<?php

namespace App\Services;

use App\Mail\AccountCredentialsMail;
use App\Models\Contractor;
use App\Models\Customer;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Creates a new account from the WhatsApp/chat assistant, so someone can say
 * "I want to create an account" to the agent instead of filling in the
 * website form.
 *
 * Deliberately kept SEPARATE from AuthController@register rather than
 * calling into it — that method expects a validated web Request and is live
 * in production, so duplicating the (small) amount of creation logic here
 * means this new chat-driven path can never change behaviour for the
 * existing registration form. Both end up creating the same shape of
 * User + child row, so a user created here is indistinguishable from one
 * created on the website.
 */
class ChatAccountService
{
    public const TYPES = ['client' => 'customer', 'contractor' => 'contractor', 'staff' => 'staff'];

    /**
     * One line the agent can read out, per account type, before it even
     * creates anything — used both for "here's what each type can do" and
     * in the confirmation message afterwards.
     */
    public static function explain(string $accountType): string
    {
        return match ($accountType) {
            'client'     => 'A client account lets you post security jobs and pay once a guard arrives on site.',
            'contractor' => 'A resource partner (contractor) account lets you accept jobs and assign your own guards to them.',
            'staff'      => 'A staff account lets you accept jobs yourself and get notified when new shifts are available nearby.',
            default      => '',
        };
    }

    /**
     * @param string $accountType one of 'client', 'contractor', 'staff'
     * @return array{success: bool, message: string, user?: User}
     */
    public function create(string $name, string $email, ?string $phone, string $accountType, array $extra = []): array
    {
        $accountType = strtolower(trim($accountType));

        if (!array_key_exists($accountType, self::TYPES)) {
            return ['success' => false, 'message' => 'Unknown account type. It must be client, contractor or staff.'];
        }

        $email = strtolower(trim($email));

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'message' => 'That email address doesn\'t look valid.'];
        }

        if (User::whereRaw('LOWER(email) = ?', [$email])->exists()) {
            return ['success' => false, 'message' => 'An account already exists for that email.'];
        }

        $userType    = self::TYPES[$accountType];
        $plainPassword = Str::password(10, true, true, false, false);

        try {
            return DB::transaction(function () use ($name, $email, $phone, $accountType, $userType, $plainPassword, $extra) {
                $capitalUser = null;
                if ($userType === 'staff') {
                    $capitalUser = User::where('id', 1)
                        ->where('user_type', 'contractor')
                        ->first();
                }

                $user = User::create([
                    'name'            => trim($name),
                    'email'           => $email,
                    'password'        => Hash::make($plainPassword),
                    'user_type'       => $userType,
                    'is_active'       => 0,
                    'user_id'         => $capitalUser->id ?? null,
                    'phone'           => $phone,
                    'phone_otp'       => rand(100000, 999999),
                    'agora_uid'       => rand(100000, 999999),
                    'is_online'       => false,
                    'last_seen'       => now(),
                    'phone_verified'  => 0,
                    'is_email_approved' => 0,
                ]);

                $user->staffo_id = 'STAFO' . $user->id;
                $user->save();

                match ($userType) {
                    'customer' => Customer::create([
                        'user_id' => $user->id,
                        'phone'   => $phone,
                    ]),
                    'contractor' => Contractor::create([
                        'user_id'      => $user->id,
                        'company_name' => $extra['company_name'] ?? null,
                        'phone'        => $phone,
                    ]),
                    'staff' => Staff::create([
                        'user_id' => $user->id,
                        'phone'   => $phone,
                    ]),
                    default => null,
                };

                $this->sendVerificationEmail($user);
                $this->sendCredentialsEmail($user, $plainPassword, $accountType);

                Log::info('[ChatAccountService] account created via chat', [
                    'user_id'      => $user->id,
                    'account_type' => $accountType,
                ]);

                return [
                    'success' => true,
                    'message' => 'Account created. Login details and a temporary password have been emailed to '
                        . $email . '. ' . self::explain($accountType)
                        . ' Please verify the email to finish activating the account.',
                    'user' => $user,
                ];
            });
        } catch (\Throwable $e) {
            Log::error('[ChatAccountService] account creation failed', ['error' => $e->getMessage()]);

            return ['success' => false, 'message' => 'Something went wrong creating the account. Please try again or contact support.'];
        }
    }

    private function sendVerificationEmail(User $user): void
    {
        try {
            $otp = Str::random(6);
            $user->email_otp = $otp;
            $user->save();

            $title = match ($user->user_type) {
                'staff'      => 'Staff Verify Email',
                'contractor' => 'Resource Partner Verify Email',
                'customer'   => 'Client',
                default      => 'User',
            };

            Mail::send('emails.isEmailVerify', [
                'token'    => $otp,
                'email'    => $user->email,
                'title'    => $title,
                'userType' => $user->user_type,
            ], function ($message) use ($user, $title) {
                $message->from('no-reply@staffoo.com.au', 'STAFFOO')
                    ->to($user->email)
                    ->subject($title);
            });
        } catch (\Throwable $e) {
            Log::error('[ChatAccountService] verification email failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
        }
    }

    private function sendCredentialsEmail(User $user, string $plainPassword, string $accountType): void
    {
        try {
            Mail::to($user->email)->send(new AccountCredentialsMail(
                $user->name,
                $user->email,
                $plainPassword,
                $accountType,
                self::explain($accountType)
            ));
        } catch (\Throwable $e) {
            Log::error('[ChatAccountService] credentials email failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
        }
    }
}
