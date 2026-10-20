<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\Staff;
use App\Models\Customer;
use App\Models\Contractor;
use App\Models\Document;
use App\Models\Questionnaire;
use App\Services\InductionAssignmentService;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class GeneralController extends Controller
{
    public function getAdmins()
    {
        $admins = User::where('user_type', 'admin')->get();

        return response()->json([
            'success' => true,
            'data' => $admins
        ], 200);
    }

    public function getSupportAdmin()
    {
        $admin = User::where('user_type', 'admin')->where('email', 'Amrit.Arora@Staffoo.com.au')->get();

        return response()->json([
            'success' => true,
            'data' => $admin
        ], 200);
    }

     function getPH(Request $request)
    {
        $getPublicHolidays = DB::table('public_holidays')->where('state', $request->state)->get();
        if ($getPublicHolidays) {
            return response()->json(['success' => true, 'data' => $getPublicHolidays]);
        }else{
            return response()->json(['success' => false, 'message' => 'Fail to Get Public Holiday!']);
        }
    }

    function addPH(Request $request)
    {
        // $states_array = array(
        //     'Victoria' => 'vic',
        //     'New South Wales' => 'nsw',
        //     'Queensland' => 'qld',
        //     'Tasmania' => 'tas',
        //     'Western Australia' => 'wa',
        //     'South Australia' => 'sa',
        //     'ACT' => 'act'
        // );
        $state = $request->state;
        $data = array(
            'holiday_name' => $request->holiday_name,
            'date' => date('Ymd', strtotime($request->date)),
            'information' => $request->holiday_information,
            'state' => $state
        );

        $addPublicHolidays = DB::table('public_holidays')->insert($data);
        if ($addPublicHolidays) {
            return response()->json(['success' => true, 'message' => 'Public Holiday add successfully.']);
        }else{
            return response()->json(['success' => false, 'message' => 'Fail to add Public Holiday!']);
        }
    }

    function updatePH(Request $request)
    {
        $data = [
            'holiday_name' => $request->holiday_name,
            'date' => date('Ymd', strtotime($request->date)),
            'information' => $request->holiday_information,
        ];
        
        $updatedPublicHolidays = DB::table('public_holidays')
            ->where('id', $request->id)
            ->update($data);
        // if ($updatedPublicHolidays) {
            return response()->json(['success' => true, 'message' => 'Public Holiday update successfully.']);
        // }else{
        //     return response()->json(['success' => false, 'message' => 'Fail to update Public Holiday!']);
        // }
    }

    function deletePH(Request $request)
    {
    
        $deletePublicHolidays = DB::table('public_holidays')->where('id', $request->id)->delete();
        if ($deletePublicHolidays) {
            return response()->json(['success' => true, 'message' => 'Public Holiday delete successfully.']);
        }else{
            return response()->json(['success' => false, 'message' => 'Fail to delete Public Holiday!']);
        }
    }

    public function userApproval(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'admin_approved' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors'  => $validator->errors(),
                ], 422);
            }

            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            $adminApproved = (int) $request->admin_approved;

            $user->admin_approved = $adminApproved;

            // If admin_approved is turned OFF, force is_active to 0 as well
            if ($adminApproved === 0) {
                $user->is_active = 0;
            }
            // If admin_approved is turned ON, optionally re-activate the user
            // Remove this block if you want to keep is_active manual
            else {
                $user->is_active = 1;
            }

            $user->save();

            return response()->json([
                'success' => true,
                'message' => $adminApproved
                    ? 'User activated successfully'
                    : 'User deactivated successfully',
                'data' => [
                    'id'             => $user->id,
                    'name'           => $user->name,
                    'email'          => $user->email,
                    'is_active'      => (bool) $user->is_active,
                    'admin_approved' => (bool) $user->admin_approved,
                    'updated_at'     => $user->updated_at,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update approval status',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

public function changeUserType(Request $request): JsonResponse
{
    // User id comes from payload
    $userId = $request->input('user_id');

    $validator = Validator::make(
        $request->all(),
        [
            'user_id'   => 'required|integer|exists:users,id',
            'user_type' => 'required|string|in:customer,contractor,staff',
        ]
    );

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors'  => $validator->errors(),
        ], 422);
    }

    $user = User::find($userId);

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'User not found',
        ], 404);
    }

    $newType = $request->user_type;
    $oldType = $user->user_type;

    if ($newType === $oldType) {
        return response()->json([
            'success' => false,
            'message' => "User is already of type '{$newType}'",
        ], 400);
    }

    DB::beginTransaction();

    try {
        // 1. Delete all documents for this user
        Document::where('user_id', $user->id)->delete();

        // 2. Delete old role child record + related data
        switch ($oldType) {
            case 'staff':
                Staff::where('user_id', $user->id)->delete();
                DB::table('induction_history')->where('guard_id', $user->id)->delete();
                DB::table('guard_questionnaire_details')->where('guard_id', $user->id)->delete();
                break;

            case 'customer':
                Customer::where('user_id', $user->id)->delete();
                break;

            case 'contractor':
                Contractor::where('user_id', $user->id)->delete();
                DB::table('contractor_chargerates')->where('user_id', $user->id)->delete();
                break;
        }

        // 3. Update user type
        $user->user_type = $newType;

        if ($newType !== 'contractor') {
            $user->states_allowed = null;
        }

        // 4. Create new role child record
        switch ($newType) {
            case 'customer':
                Customer::create(['user_id' => $user->id]);
                break;

            case 'contractor':
                Contractor::create(['user_id' => $user->id]);

                // Resource partners get the inductions authored for that audience.
                InductionAssignmentService::assignToUser($user->id, 'resource_partner');
                break;

            case 'staff':
                // Attach under Capital Security (user_id = 1) if exists
                $capitalUser = User::where('id', 1)
                    ->where('user_type', 'contractor')
                    ->first();

                if ($capitalUser) {
                    $user->user_id = $capitalUser->id;
                }

                Staff::create(['user_id' => $user->id]);

                // Recreate induction history + questionnaire details —
                // only the "staff" audience inductions.
                InductionAssignmentService::assignToUser($user->id, 'staff');
                break;
        }

        $user->save();

        DB::commit();

        // ── 5. Build profile-completion guidance for the new role ────────
        $profileSteps = $this->getProfileCompletionSteps($newType);

        // ── 6. Send email to the user about the type change ──────────────
        try {
            if (!empty($user->email)) {
                Mail::to($user->email)->queue(
                    new UserTypeChangedMail(
                        userName:     $user->name ?? 'User',
                        oldType:      $oldType,
                        newType:      $newType,
                        profileSteps: $profileSteps,
                        loginUrl:     config('app.frontend_url', config('app.url')) . '/login',
                    )
                );
            }
        } catch (\Exception $mailEx) {
            // Don't fail the whole request if mail fails — log it
            \Log::error('UserTypeChangedMail failed: ' . $mailEx->getMessage(), [
                'user_id' => $user->id,
            ]);
        }

        return response()->json([
            'success'       => true,
            'message'       => "User type changed from '{$oldType}' to '{$newType}' successfully",
            'old_type'      => $oldType,
            'new_type'      => $newType,
            'profile_steps' => $profileSteps,   // ← frontend can render this as a guide
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'success' => false,
            'message' => 'Failed to change user type',
            'error'   => $e->getMessage(),
        ], 500);
    }
}

/**
 * Return the list of steps required for the user to complete their profile
 * under the new role.
 */
private function getProfileCompletionSteps(string $userType): array
{
    switch ($userType) {

        case 'customer':
            return [
                [
                    'key'         => 'personal_details',
                    'title'       => 'Complete your personal details',
                    'description' => 'Add your name, contact number, and billing address.',
                    'route'       => '/profile/personal-details',
                    'required'    => true,
                ],
                [
                    'key'         => 'company_details',
                    'title'       => 'Add company details',
                    'description' => 'Provide your ABN / ACN and company name for invoicing.',
                    'route'       => '/profile/company-details',
                    'required'    => true,
                ],
                [
                    'key'         => 'add_site',
                    'title'       => 'Add your first site',
                    'description' => 'Register the site(s) where you need security services.',
                    'route'       => '/sites/create',
                    'required'    => true,
                ],
                [
                    'key'         => 'payment_method',
                    'title'       => 'Add a payment method',
                    'description' => 'Save a card so bookings can be confirmed.',
                    'route'       => '/profile/payment-methods',
                    'required'    => true,
                ],
            ];

        case 'contractor':
            return [
                [
                    'key'         => 'personal_details',
                    'title'       => 'Complete your personal details',
                    'description' => 'Add your name, contact number, and business address.',
                    'route'       => '/profile/personal-details',
                    'required'    => true,
                ],
                [
                    'key'         => 'company_details',
                    'title'       => 'Add your company / ABN',
                    'description' => 'Provide your ABN, business name, and insurance details.',
                    'route'       => '/profile/company-details',
                    'required'    => true,
                ],
                [
                    'key'         => 'states_allowed',
                    'title'       => 'Select the states you operate in',
                    'description' => 'Choose which Australian states your guards can work in.',
                    'route'       => '/profile/states',
                    'required'    => true,
                ],
                [
                    'key'         => 'charge_rates',
                    'title'       => 'Set your charge rates',
                    'description' => 'Configure the rates you charge for each job level.',
                    'route'       => '/profile/charge-rates',
                    'required'    => true,
                ],
                [
                    'key'         => 'add_staff',
                    'title'       => 'Add your staff / guards',
                    'description' => 'Invite or register guards who will work under you.',
                    'route'       => '/staff/create',
                    'required'    => true,
                ],
                [
                    'key'         => 'bank_details',
                    'title'       => 'Add payout bank details',
                    'description' => 'Provide bank account details so payouts can be made.',
                    'route'       => '/profile/bank-details',
                    'required'    => true,
                ],
            ];

        case 'staff':
            return [
                [
                    'key'         => 'personal_details',
                    'title'       => 'Complete your personal details',
                    'description' => 'Add your name, contact number, and home address.',
                    'route'       => '/profile/personal-details',
                    'required'    => true,
                ],
                [
                    'key'         => 'upload_documents',
                    'title'       => 'Upload required documents',
                    'description' => 'Upload your security licence, white card, and any other required documents.',
                    'route'       => '/profile/documents',
                    'required'    => true,
                ],
                [
                    'key'         => 'complete_inductions',
                    'title'       => 'Complete induction modules',
                    'description' => 'Read and pass all induction questionnaires assigned to you.',
                    'route'       => '/inductions',
                    'required'    => true,
                ],
                [
                    'key'         => 'bank_details',
                    'title'       => 'Add bank details for payouts',
                    'description' => 'Provide bank account details so you can be paid for shifts.',
                    'route'       => '/profile/bank-details',
                    'required'    => true,
                ],
                [
                    'key'         => 'availability',
                    'title'       => 'Set your availability',
                    'description' => 'Mark the days and hours you are available for shifts.',
                    'route'       => '/profile/availability',
                    'required'    => false,
                ],
            ];

        default:
            return [];
    }
}
}