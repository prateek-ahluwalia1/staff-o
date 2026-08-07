<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        $payload    = $request->getContent();
        $sigHeader  = $request->header('Stripe-Signature');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $sigHeader,
                config('services.stripe.webhook_secret')
            );
        } catch (\Exception $e) {
            Log::error('Stripe webhook signature verification failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        if ($event->type === 'checkout.session.completed' || $event->type === 'payment_link.completed') {
            $rosterId = $event->data->object->metadata->roster_id ?? null;

            if ($rosterId) {
                DB::table('job_rosters')->where('id', $rosterId)->update([
                    'job_status'     => 'confirmed',
                    'payment_status' => 'paid',
                ]);

                Log::info('Job confirmed via Stripe webhook', ['roster_id' => $rosterId]);
            }
        }

        return response()->json(['status' => 'ok']);
    }
}