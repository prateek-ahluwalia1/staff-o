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

                // Recreate induction history + questionnaire details
                $inductions = Questionnaire::all();
                $now = Carbon::now();
                $inductionHistoryData = [];
                $guardQuestionnaireDetailsData = [];

                foreach ($inductions as $induction) {
                    $inductionHistoryData[] = [
                        'guard_id'     => $user->id,
                        'induction_id' => $induction->id,
                        'state'        => 'Victoria',
                        'read_status'  => 0,
                        'created_at'   => $now,
                        'updated_at'   => $now,
                    ];

                    $guardQuestionnaireDetailsData[] = [
                        'guard_id'         => $user->id,
                        'questionnaire_id' => $induction->id,
                        'marks'            => 0,
                        'certificate_path' => null,
                        'expiry_date'      => null,
                        'created_at'       => $now,
                        'updated_at'       => $now,
                    ];
                }

                if (!empty($inductionHistoryData)) {
                    DB::table('induction_history')->insert($inductionHistoryData);
                }
                if (!empty($guardQuestionnaireDetailsData)) {
                    DB::table('guard_questionnaire_details')->insert($guardQuestionnaireDetailsData);
                }
                break;
        }

        $user->save();

        DB::commit();

        return response()->json([
            'success'  => true,
            'message'  => "User type changed from '{$oldType}' to '{$newType}' successfully",
            'old_type' => $oldType,
            'new_type' => $newType,
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
}
