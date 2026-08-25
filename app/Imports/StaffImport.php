<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Staff;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\Questionnaire;
use App\Mail\StaffWelcomeMail;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StaffImport implements ToCollection, WithHeadingRow
{
    public int $companyUserId;
    public array $created = [];
    public array $failed = [];
    public int $processedRows = 0;

    public function __construct(int $companyUserId)
    {
        $this->companyUserId = $companyUserId;
    }

    public function collection($rows)
    {
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2; // +1 for zero-index, +1 for the header row

            // ============ FIXED: Better empty row detection ============
            $rowArray = $row->toArray();
            
            // Remove null values and empty strings, then check if anything remains
            $filteredRow = array_filter($rowArray, function ($value) {
                return $value !== null && $value !== '' && $value !== ' ';
            });
            
            // If after filtering, there's nothing, skip this row
            if (empty($filteredRow)) {
                continue;
            }
            // ============ END FIXED ============

            // ============ NEW: Check if row has at least the minimum required fields ============
            $hasName = !empty(trim($row['name'] ?? ''));
            $hasEmail = !empty(trim($row['email'] ?? ''));
            $hasPhone = !empty(trim($row['phone'] ?? ''));
            
            if (!$hasName || !$hasEmail || !$hasPhone) {
                $this->failed[] = [
                    'row'   => $rowNumber,
                    'email' => $row['email'] ?? null,
                    'error' => 'Missing required field(s): name, email, and phone are all required.',
                ];
                continue; // Skip to next row instead of throwing exception
            }
            // ============ END NEW ============

            DB::beginTransaction();
            try {
                $this->processRow($row, $rowNumber);
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $this->failed[] = [
                    'row'   => $rowNumber,
                    'email' => $row['email'] ?? null,
                    'error' => $e->getMessage(),
                ];
            }
        }
    }

    private function processRow($row, int $rowNumber): void
    {
        $name  = trim((string) ($row['name'] ?? ''));
        $email = trim((string) ($row['email'] ?? ''));
        $phone = trim((string) ($row['phone'] ?? ''));
 
        // ============ FIXED: These checks are now redundant but kept for safety ============
        if ($name === '' || $email === '' || $phone === '') {
            throw new \Exception('Missing required field(s): name, email, and phone are all required.');
        }
        // ============ END FIXED ============
 
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \Exception("'{$email}' is not a valid email address.");
        }
 
        if (User::where('email', $email)->exists()) {
            throw new \Exception("Email {$email} is already registered.");
        }

        $plainPassword = function_exists('generateSecurePassword')
            ? (generateSecurePassword() ?? 'Temp1234')
            : 'Temp1234';

        // ── Create user ────────────────────────────────────────────────
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

        // ── Create staff profile ───────────────────────────────────────
        $staffDocumentType = $row['staff_document_type'] ?? null;

        Staff::create([
            'user_id'              => $user->id,
            'gender'                => $row['gender'] ?? null,
            'phone'                 => $phone,
            'staff_document_type'   => $staffDocumentType,
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
            'row'   => $rowNumber,
            'user_id' => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
        ];
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