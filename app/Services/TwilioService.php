<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Twilio\Exceptions\RestException;
use Twilio\Rest\Client;

class TwilioService
{
    protected Client $client;

    public function __construct()
    {
        $sid   = config('services.twilio.sid');
        $token = config('services.twilio.auth_token');

        if (empty($sid) || empty($token)) {
            // Fails loudly with a message that actually says what's wrong,
            // instead of the opaque
            // "Twilio\Base\BaseClient::getAccountSid(): Return value must
            // be of type string, null returned" you get if these are left
            // null and passed straight into Client's constructor.
            throw new \RuntimeException(
                'Twilio is not configured: services.twilio.sid or auth_token is missing. '
                . 'Check config/services.php has the twilio block and .env has '
                . 'TWILIO_SID / TWILIO_AUTH_TOKEN set, then run php artisan config:clear.'
            );
        }

        $this->client = new Client($sid, $token);
    }

    /**
     * Send a message, preferring WhatsApp on the same number and falling
     * back to a plain SMS if Twilio can't deliver it over WhatsApp (number
     * not on WhatsApp, not opted in, template required, etc). This is the
     * method send_sms() below actually calls — it's what gives you
     * "WhatsApp if available, SIM otherwise" without a separate lookup step.
     */
    public function sendSmsOrWhatsapp(string $phone, string $message): bool
    {
        try {
            $this->sendWhatsapp($phone, $message);
            return true;
        } catch (RestException $e) {
            Log::info('WhatsApp delivery failed, falling back to SMS', [
                'phone'         => $phone,
                'twilio_code'   => $e->getCode(),
                'twilio_status' => $e->getStatusCode(),
                'error'         => $e->getMessage(),
            ]);

            return $this->sendSms($phone, $message);
        }
    }

    public function sendSms(string $phone, string $message): bool
    {
        $this->client->messages->create($this->normalize($phone), [
            'from' => config('services.twilio.sms_from'),
            'body' => $message,
        ]);

        return true;
    }

    public function sendWhatsapp(string $phone, string $message): bool
    {
        $this->client->messages->create('whatsapp:' . $this->normalize($phone), [
            // config value already includes the "whatsapp:" prefix, e.g.
            // 'whatsapp:+14155238886'
            'from' => config('services.twilio.whatsapp_from'),
            'body' => $message,
        ]);

        return true;
    }

    /**
     * Place a voice call. $twimlUrl must point to TwiML (a Twilio Function,
     * a route in this app returning <Response><Say>...</Say></Response>,
     * or a Twilio TwiML Bin) that controls what the call actually says/does
     * — Twilio fetches and executes that when the call connects.
     */
    public function makeCall(string $phone, ?string $twimlUrl = null): bool
    {
        $this->client->calls->create(
            $this->normalize($phone),
            config('services.twilio.voice_from'),
            ['url' => $twimlUrl ?? config('services.twilio.voice_url')]
        );

        return true;
    }

    /**
     * Normalize to E.164. Handles Australian local-format numbers
     * specifically, since that's what this app collects from users —
     * e.g. "0493899403" -> "+61493899403". Just stripping the leading 0
     * and prepending "+" (the old version) produces "+493899403", which
     * isn't a valid number in any country and Twilio silently rejects —
     * that was the cause of "Failed to send OTP" on locally-formatted
     * numbers.
     */
    protected function normalize(string $phone): string
    {
        $phone = trim($phone);
        $phone = preg_replace('/[^\d+]/', '', $phone); // strip spaces, dashes, brackets, etc.

        if (str_starts_with($phone, '+')) {
            return $phone;
        }

        // Local AU format: 0493899403 -> +61493899403
        if (str_starts_with($phone, '0')) {
            return '+61' . substr($phone, 1);
        }

        // Already has the country code but missing the '+': 61493899403
        if (str_starts_with($phone, '61')) {
            return '+' . $phone;
        }

        // Fallback: bare local number with no leading 0, e.g. 493899403
        return '+61' . $phone;
    }
}