<?php

/**
 * ============================================================================
 * ADD THESE ROUTES to routes/api.php
 * ============================================================================
 *
 * Put them OUTSIDE any auth:sanctum group — Twilio and Retell call these
 * server-to-server and have no user token.
 */

use App\Http\Controllers\Api\WhatsappWebhookController;
use App\Http\Controllers\Api\RetellFunctionController;

// Twilio posts here on every inbound WhatsApp message.
// Set this URL in Twilio Console > Messaging > your WhatsApp sender >
// "When a message comes in".
Route::post('/whatsapp/incoming', [WhatsappWebhookController::class, 'handle'])
    ->name('whatsapp.incoming');

// Retell custom functions. Register these two URLs on BOTH the voice agent
// and the chat agent — one implementation serves both channels.
Route::post('/retell/job-request', [RetellFunctionController::class, 'jobRequest'])
    ->name('retell.job-request');

Route::post('/retell/escalate', [RetellFunctionController::class, 'escalate'])
    ->name('retell.escalate');
