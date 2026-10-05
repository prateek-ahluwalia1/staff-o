<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\JobRequestMail;
use App\Mail\SupportEscalationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Endpoints for Retell custom functions.
 *
 * These are called by RETELL, not by the user's browser or app. You register
 * them as custom functions on the agent, and the agent calls one when it has
 * finished collecting what it needs.
 *
 * The same two functions serve BOTH the voice agent and the WhatsApp chat
 * agent — one implementation, two channels.
 *
 * Whatever string you return in `result` is what the agent then says to the
 * caller, so keep it short and human.
 */
class RetellFunctionController extends Controller
{
    /**
     * POST /api/retell/job-request
     *
     * The agent has collected a job a client wants covered. We do NOT post
     * the job — posting needs a Stripe payment hold (see JobRosterController
     * @jobData, which requires payment_intent_id). We email the details so a
     * human can set it up and send the client a payment link.
     */
    public function jobRequest(Request $request)
    {
        try {
            $data = [
                'email'            => $this->str($request, 'email'),
                'contact_phone'    => $this->str($request, 'contact_phone'),
                'site_name'        => $this->str($request, 'site_name'),
                'address'          => $this->str($request, 'address'),
                'state'            => $this->str($request, 'state'),
                'job_type'         => $this->str($request, 'job_type'),
                'number_of_guards' => $this->str($request, 'number_of_guards'),
                'shifts'           => $this->str($request, 'shifts'),
                'requirements'     => $this->str($request, 'requirements'),
                'instructions'     => $this->str($request, 'instructions'),
                'channel'          => $this->channel($request),
                'received_at'      => now()->format('d M Y, g:i A'),
            ];

            // What we would not be able to act on.
            $missing = [];
            foreach (['email', 'address', 'job_type', 'shifts'] as $field) {
                if ($data[$field] === '') {
                    $missing[] = str_replace('_', ' ', $field);
                }
            }
            $data['missing'] = $missing;

            Log::info('[Retell] job request received', $data);

            Mail::to(config('services.retell.escalation_email'))
                ->send(new JobRequestMail($data));

            return response()->json([
                'result' => "Job request sent through. The team will set it up and email the "
                    . "payment link to {$data['email']}, usually within the hour.",
            ]);
        } catch (Throwable $e) {
            Log::error('[Retell] job request failed', [
                'error'   => $e->getMessage(),
                'payload' => $request->all(),
            ]);

            return response()->json([
                'result' => "I've taken the details but couldn't send them automatically. "
                    . "Someone will still follow up — I've logged it.",
            ]);
        }
    }

    /**
     * POST /api/retell/escalate
     *
     * The agent could not resolve something. It has the caller's email and
     * phone and hands the whole thing to a human.
     */
    public function escalate(Request $request)
    {
        try {
            $data = [
                'name'         => $this->str($request, 'name'),
                'email'        => $this->str($request, 'email'),
                'phone'        => $this->str($request, 'phone'),
                'account_type' => $this->str($request, 'account_type'),
                'issue'        => $this->str($request, 'issue'),
                'details'      => $this->str($request, 'details'),
                'urgency'      => $this->str($request, 'urgency') ?: 'normal',
                'channel'      => $this->channel($request),
                'received_at'  => now()->format('d M Y, g:i A'),
            ];

            Log::info('[Retell] escalation received', $data);

            Mail::to(config('services.retell.escalation_email'))
                ->send(new SupportEscalationMail($data));

            return response()->json([
                'result' => "Passed to the team. They'll come back to you, typically within an hour.",
            ]);
        } catch (Throwable $e) {
            Log::error('[Retell] escalation failed', [
                'error'   => $e->getMessage(),
                'payload' => $request->all(),
            ]);

            return response()->json([
                'result' => "I've logged your details and someone will be in touch.",
            ]);
        }
    }

    /**
     * Retell nests the function arguments under `args` on some agent
     * versions and sends them flat on others. Read both.
     */
    protected function str(Request $request, string $key): string
    {
        $value = $request->input("args.$key", $request->input($key));

        if (is_array($value)) {
            $value = implode('; ', array_map('strval', $value));
        }

        return trim((string) ($value ?? ''));
    }

    protected function channel(Request $request): string
    {
        $metadata = $request->input('call.metadata', $request->input('metadata', []));

        if (is_array($metadata) && !empty($metadata['channel'])) {
            return (string) $metadata['channel'];
        }

        // A voice call carries call_id; a chat carries chat_id.
        return $request->has('call') || $request->has('call_id') ? 'phone' : 'whatsapp';
    }
}
