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
        $this->client = new Client(
            config('services.twilio.sid'),
            config('services.twilio.auth_token')
        );
    }

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
            'from' => config('services.twilio.whatsapp_from'),
            'body' => $message,
        ]);

        return true;
    }

    public function makeCall(string $phone, ?string $twimlUrl = null): bool
    {
        $this->client->calls->create(
            $this->normalize($phone),
            config('services.twilio.voice_from'),
            ['url' => $twimlUrl ?? config('services.twilio.voice_url')]
        );

        return true;
    }

    protected function normalize(string $phone): string
    {
        $phone = trim($phone);

        return str_starts_with($phone, '+') ? $phone : '+' . ltrim($phone, '0');
    }
}