<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Staff;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\Questionnaire;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Validators\Failure;

class StaffImport implements ToModel, WithHeadingRow, WithValidation, SkipsEmptyRows, SkipsOnFailure
{
    public int $companyUserId;
    public array $created = [];
    public array $failed = [];
    public int $rowNumber = 0;

    public function __construct(int $companyUserId)
    {
        $this->companyUserId = $companyUserId;
    }

    public function model(array $row)
    {
        $this->rowNumber++;

        DB::beginTransaction();
        try {
            $name  = trim($row['name'] ?? '');
            $email = trim($row['email'] ?? '');
            $phone = trim($row['phone'] ?? '');

            // Check if email already exists
            if (User::where('email', $email)->exists()) {
                throw new \Exception("Email {$email} is already registered.");
            }

            $plainPassword = function_exists('generateSecurePassword')
                ? (generateSecurePassword() ?? 'Temp1234')
                : 'Temp1234';

            // Create user
            $user = User::create([
                'name'        => $name,
                'email'       => $email,
                'password'    => Hash::make($plainPassword),
                'user_type'   => 'staff',
                'user_id'     => $this->companyUserId,
                'address'     => $row['address'] ?? null,
                'city'        => $row['city'] ?? null,
                'state'       => $row['state'] ?? null,
                'country'     => $row['country'] ?? null,
                'phone'       => $phone,
                'is_active'   => 0,
            ]);

            $user->staffo_id = 'STAFO' . $user->id;
            $user->is_email_approved = 1;
            $user->save();

            // Create staff profile
            Staff::create([
                'user_id'              => $user->id,
                'gender'                => $row['gender'] ?? null,
                'phone'                 => $phone,
                'staff_document_type'   => $row['staff_document_type'] ?? null,
                'security_license_no'   => $row['security_license_no'] ?? null,
                'date_of_birth'          => $row['date_of_birth'] ?? null,
                'origin_country'         => $row['origin_country'] ?? null,
            ]);

            // ── Documents ──────────────────────────────────────────────────
            $documentCategories = DocumentCategory::where('document_category', 'contractor_staff')->first(); 

            if ($documentCategories) {
                foreach (json_decode($documentCategories->document_type) as $key => $value) {
                    Document::create([
                        'user_id'            => $user->id,
                        'document_category'  => $documentCategories->document_category ?: 'other',
                        'document_type'      => $key,
                        'document_name'      => $value,
                    ]);
                }
            }

            // ── Induction records ──────────────────────────────────────────
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
                DB::table('guard_questionnaire_details')->insert($guardQuestionnaireDetailsData);
            }

            // ── Welcome email ──────────────────────────────────────────────
            if ($this->companyUserId != 1) {
                try {
                    $this->sendStaffWelcomeEmail($user, $plainPassword);
                } catch (\Exception $e) {
                    Log::error('Failed to send welcome email during staff import', [
                        'user_id' => $user->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $this->created[] = [
                'row'   => $this->rowNumber + 1, // +1 for header
                'user_id' => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ];

            DB::commit();
            return $user;

        } catch (\Exception $e) {
            DB::rollBack();
            $this->failed[] = [
                'row'   => $this->rowNumber + 1,
                'email' => $row['email'] ?? null,
                'error' => $e->getMessage(),
            ];
            return null;
        }
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
        ];
    }

    public function onFailure(Failure ...$failures)
    {
        foreach ($failures as $failure) {
            $rowNumber = $failure->row();
            $row = $failure->values();
            $this->failed[] = [
                'row'   => $rowNumber,
                'email' => $row['email'] ?? null,
                'error' => implode(', ', $failure->errors()),
            ];
        }
    }

    private function sendStaffWelcomeEmail($user, $plainPassword)
    {
        try {
            $company = User::find($user->user_id);
            $companyName = $company ? $company->contractor->company_name : 'your company';
            
            $data = [
                'name' => $user->name,
                'email' => $user->email,
                'password' => $plainPassword,
                'company_name' => $companyName,
                'staffo_id' => $user->staffo_id,
            ];

            Mail::send('emails.staff_welcome', $data, function ($message) use ($user) {
                $message->to($user->email, $user->name)
                        ->subject('Your Login Details');
            });

            Log::info('Welcome email sent to staff: ' . $user->email);
        } catch (\Exception $e) {
            Log::error('Failed to send welcome email to staff: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'email' => $user->email
            ]);
        }
    }
}