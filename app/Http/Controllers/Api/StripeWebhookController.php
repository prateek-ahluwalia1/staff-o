<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

        // With capture_method = manual, the PaymentIntent moves to
        // 'requires_capture' the moment the hold succeeds — Stripe fires
        // payment_intent.amount_capturable_updated for that transition.
        // (checkout.session.completed still fires too, but the session's
        // payment_status stays 'unpaid' for a hold, so it's not useful here.)
        if ($event->type === 'payment_intent.amount_capturable_updated') {
            $this->handlePaymentIntentHoldSucceeded($event);
        }

        return response()->json(['status' => 'ok']);
    }

    /**
     * HOLD CONFIRMED: funds have been authorized (held) on the client's card,
     * but NOT captured yet — capture happens later, after shift completion
     * (separate task, not built yet).
     * - Flips job_status to 'confirmed' and payment_status to 'held' on job_rosters
     * - Creates the matching row in the transactions table with status 'authorized'
     */
    private function handlePaymentIntentHoldSucceeded($event)
    {
        $paymentIntent = $event->data->object; // this event's object IS the PaymentIntent

        $rosterId     = $paymentIntent->metadata->roster_id ?? null;
        $contractorId = $paymentIntent->metadata->contractor_id ?? null;

        if (!$rosterId) {
            Log::warning('payment_intent.amount_capturable_updated had no roster_id in metadata', [
                'payment_intent_id' => $paymentIntent->id ?? null,
            ]);
            return;
        }

        // Only proceed if Stripe actually has capturable funds held
        if (empty($paymentIntent->amount_capturable) || $paymentIntent->amount_capturable <= 0) {
            Log::info('payment_intent.amount_capturable_updated received but amount_capturable is 0', [
                'roster_id' => $rosterId,
                'payment_intent_id' => $paymentIntent->id,
            ]);
            return;
        }

        $updatedRoster = DB::table('job_rosters')->where('id', $rosterId)->first();

        if (!$updatedRoster) {
            Log::error('Roster not found for webhook', ['roster_id' => $rosterId]);
            return;
        }

        // Avoid double-processing if Stripe retries the webhook
        if ($updatedRoster->payment_status === 'held') {
            Log::info('Roster already marked held, skipping duplicate webhook', ['roster_id' => $rosterId]);
            return;
        }

        // Pull back the breakdown we saved when the payment link was created
        $meta = $updatedRoster->invoice_meta ? json_decode($updatedRoster->invoice_meta, true) : [];

        $baseTotal  = $meta['base_total']  ?? 0;
        $discount   = $meta['discount']    ?? 0;
        $serviceFee = $meta['service_fee'] ?? 0;
        $grandTotal = $meta['grand_total'] ?? (($paymentIntent->amount_capturable ?? 0) / 100);
        $currency   = $meta['currency']    ?? ($paymentIntent->currency ?? 'aud');

        // 1. Update the roster — job proceeds now that funds are held,
        // but payment_status is 'held', not 'paid', since capture is a later step
        DB::table('job_rosters')->where('id', $rosterId)->update([
            'job_status'     => 'confirmed',
            'payment_status' => 'held',
            'payment_intent_id' => $paymentIntent->id,
            'payment_captured'  => 0,
        ]);

        // 2. Create the transaction record
        // No charge_id yet — a charge only exists once the PaymentIntent is captured
        try {
            Transaction::create([
                'user_id'                   => $updatedRoster->created_by, // client who authorized payment
                'job_roster_id'             => json_encode([(int) $rosterId]),
                'payment_intent_id'         => $paymentIntent->id,
                'charge_id'                 => null,
                'amount'                    => $baseTotal,
                'discount'                  => $discount,
                'amount_charged'            => 0, // nothing captured/charged yet
                'balance'                   => $grandTotal, // full amount still held, not captured
                'service_fee'               => $serviceFee,
                'total_amount'              => $grandTotal,
                'currency'                  => $currency,
                'status'                    => 'held', // held, not completed
                'response'                  => json_encode($paymentIntent),
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

        Log::info('Payment hold confirmed via Stripe webhook, job confirmed', [
            'roster_id' => $rosterId,
            'contractor_id' => $contractorId,
            'payment_intent_id' => $paymentIntent->id,
        ]);
    }

        /**
         * GET /invoice/pay/{rosterId}
         *
         * This is what the "Pay Now" button in the invoice email links to —
         * NOT the raw Stripe payment link. It checks the roster's current
         * payment_status first:
         *   - already held/paid -> send to a friendly "already paid" page,
         *     never touches Stripe, so no duplicate hold gets created
         *   - not yet paid -> forward on to the actual Stripe payment link
         */
        public function redirectToPay($rosterId)
        {
            $roster = DB::table('job_rosters')->where('id', $rosterId)->first();

            if (!$roster) {
                abort(404, 'Invoice not found.');
            }

            // Payment already held or completed — don't let a second click create another hold
            if (in_array($roster->payment_status, ['held', 'paid'])) {
                return redirect()->route('invoice-already-paid', ['rosterId' => $rosterId]);
            }

            // payment_intent_id column currently stores the Stripe Payment Link URL
            // (per the existing generateContractorInvoiceAndPaymentLink logic)
            if (empty($roster->payment_intent_id)) {
                abort(404, 'Payment link not available for this invoice.');
            }

            return redirect()->away($roster->payment_intent_id);
        }

        /**
         * GET /invoice/already-paid/{rosterId}
         * Simple landing page shown if the client clicks Pay Now again
         * after the payment has already been held/completed.
         */
        public function alreadyPaid($rosterId)
        {
            $roster = DB::table('job_rosters')->where('id', $rosterId)->first();

            return view('emails.invoice-already-paid', [
                'invoiceNumber' => $roster->invoice_filename ?? null,
                'paymentStatus' => $roster->payment_status ?? null,
            ]);
        }
}