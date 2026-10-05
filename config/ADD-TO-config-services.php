<?php

/**
 * ============================================================================
 * ADD THIS BLOCK to config/services.php
 * ============================================================================
 *
 * Your twilio block already exists — only 'whatsapp_from' matters for the
 * bridge, and it looks like you already have it. The retell block is new.
 */

return [

    // ... your existing services ...

    'twilio' => [
        'sid'                           => env('TWILIO_SID'),
        'auth_token'                    => env('TWILIO_AUTH_TOKEN'),
        'sms_from'                      => env('TWILIO_SMS_FROM'),
        'voice_from'                    => env('TWILIO_VOICE_FROM'),
        'voice_url'                     => env('TWILIO_VOICE_URL'),

        // The WhatsApp sender, E.164, no 'whatsapp:' prefix.
        // e.g. +61480000000
        'whatsapp_from'                 => env('TWILIO_WHATSAPP_FROM'),

        // Only used by your existing sendWhatsapp() for messages OUTSIDE the
        // 24-hour window. The bridge does not need it.
        'whatsapp_generic_template_sid' => env('TWILIO_WHATSAPP_TEMPLATE_SID'),
    ],

    'retell' => [
        'api_key'               => env('RETELL_API_KEY'),

        // The CHAT agent id (not the voice one). Create a chat agent in
        // Retell and paste the same prompt into it.
        'chat_agent_id'         => env('RETELL_CHAT_AGENT_ID'),

        // Start a fresh conversation if the person has been quiet this long.
        // 180 = 3 hours.
        'chat_timeout_minutes'  => env('RETELL_CHAT_TIMEOUT_MINUTES', 180),

        // Where job requests and escalations land.
        'escalation_email'      => env('RETELL_ESCALATION_EMAIL', 'abdulsamad.idenbrid@gmail.com'),
    ],

];
