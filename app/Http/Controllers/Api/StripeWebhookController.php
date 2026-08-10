<?php

namespace App\Http\Controllers\Api;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;


class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        $payload   = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

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

        if ($event->type === 'checkout.session.completed') {
            $this->handleCheckoutSessionCompleted($event);
        }

        return response()->json(['status' => 'ok']);
    }

    /**
     * SUCCESS CASE: payment via the contractor invoice payment link went through.
     * - Flips job_status to 'confirmed' and payment_status to 'paid' on job_rosters
     * - Creates the matching row in the transactions table
     */
    private function handleCheckoutSessionCompleted($event)
    {
        $session = $event->data->object;

        $rosterId     = $session->metadata->roster_id ?? null;
        $contractorId = $session->metadata->contractor_id ?? null;

        if (!$rosterId) {
            Log::warning('checkout.session.completed had no roster_id in metadata', [
                'session_id' => $session->id ?? null,
            ]);
            return;
        }

        // Only proceed if the session actually succeeded
        if (($session->payment_status ?? null) !== 'paid') {
            Log::info('checkout.session.completed received but payment_status is not paid', [
                'roster_id' => $rosterId,
                'payment_status' => $session->payment_status ?? null,
            ]);
            return;
        }

        $updatedRoster = DB::table('job_rosters')->where('id', $rosterId)->first();

        if (!$updatedRoster) {
            Log::error('Roster not found for webhook', ['roster_id' => $rosterId]);
            return;
        }

        // Avoid double-processing if Stripe retries the webhook
        if ($updatedRoster->payment_status === 'paid') {
            Log::info('Roster already marked paid, skipping duplicate webhook', ['roster_id' => $rosterId]);
            return;
        }

        // Pull back the breakdown we saved when the payment link was created
        $meta = $updatedRoster->invoice_meta ? json_decode($updatedRoster->invoice_meta, true) : [];

        $baseTotal  = $meta['base_total']  ?? 0;
        $discount   = $meta['discount']    ?? 0;
        $serviceFee = $meta['service_fee'] ?? 0;
        $grandTotal = $meta['grand_total'] ?? (($session->amount_total ?? 0) / 100);
        $currency   = $meta['currency']    ?? ($session->currency ?? 'aud');

        // Try to get the charge id off the payment intent (optional, best-effort)
        $chargeId = null;
        try {
            if (!empty($session->payment_intent)) {
                $paymentIntent = \Stripe\PaymentIntent::retrieve($session->payment_intent);
                $chargeId = $paymentIntent->latest_charge ?? null;
            }
        } catch (\Exception $e) {
            Log::warning('Could not retrieve payment intent/charge for transaction record', [
                'error' => $e->getMessage(),
            ]);
        }

        // 1. Update the roster
        DB::table('job_rosters')->where('id', $rosterId)->update([
            'job_status'     => 'confirmed',
            'payment_status' => 'paid',
        ]);

        // 2. Create the transaction record
        try {
            Transaction::create([
                'user_id'                   => $updatedRoster->created_by, // client who paid
                'job_roster_id'             => $rosterId,
                'payment_intent_id'         => $session->payment_intent ?? null,
                'charge_id'                 => $chargeId,
                'amount'                    => $baseTotal,
                'discount'                  => $discount,
                'amount_charged'            => $grandTotal,
                'balance'                   => 0,
                'service_fee'               => $serviceFee,
                'total_amount'              => $grandTotal,
                'currency'                  => $currency,
                'status'                    => 'completed',
                'response'                  => json_encode($session),
                'payment_option'            => 'full',
                'balance_status'            => null,
                'balance_payment_intent_id' => null,
                'balance_charged_at'        => null,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create transaction record from webhook', [
                'roster_id' => $rosterId,
                'error' => $e->getMessage(),
            ]);
        }

        Log::info('Job confirmed and transaction recorded via Stripe webhook', [
            'roster_id' => $rosterId,
            'contractor_id' => $contractorId,
        ]);
    }
}