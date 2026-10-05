<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WhatsappChat;
use App\Services\RetellChatService;
use App\Services\TwilioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Twilio WhatsApp -> Retell chat agent -> Twilio WhatsApp.
 *
 * Twilio POSTs here whenever someone messages the STAFFOO WhatsApp number.
 * We find or open a Retell chat for that phone, pass the message through,
 * and send the agent's reply straight back out.
 *
 * Replies always land inside WhatsApp's 24-hour customer service window
 * (the customer messaged us first), so no template is needed — we can send
 * free-form text.
 */
class WhatsappWebhookController extends Controller
{
    public function __construct(
        protected RetellChatService $retell,
        protected TwilioService $twilio,
    ) {
    }

    public function handle(Request $request)
    {
        // Twilio retries on non-2xx, which would double-reply. Always 200;
        // problems are logged, not bounced back.
        try {
            $this->process($request);
        } catch (Throwable $e) {
            Log::error('[WhatsApp] handler failed', [
                'from'  => $request->input('From'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->safeReply(
                $request->input('From'),
                "Sorry, something went wrong on our side. Please try again in a moment, "
                . "or email us and we'll pick it up."
            );
        }

        // Empty TwiML — we send our reply over the REST API instead, so the
        // agent has time to think without holding the webhook open.
        return response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', 200)
            ->header('Content-Type', 'text/xml');
    }

    protected function process(Request $request): void
    {
        // Twilio sends 'whatsapp:+61493899403'
        $from = (string) $request->input('From', '');
        $body = trim((string) $request->input('Body', ''));

        $phone = str_replace('whatsapp:', '', $from);

        if ($phone === '' || $body === '') {
            Log::info('[WhatsApp] empty message ignored', ['from' => $from]);
            return;
        }

        Log::info('[WhatsApp] inbound', ['phone' => $phone, 'body' => $body]);

        $chat = $this->resolveChat($phone);

        $reply = $this->retell->sendMessage($chat->chat_id, $body);

        if ($reply === '') {
            // The agent ran a tool but said nothing. Don't leave them hanging.
            $reply = "Thanks — I've got that. Give me a moment.";
        }

        $chat->update([
            'last_message_at' => now(),
            'message_count'   => $chat->message_count + 1,
        ]);

        $this->twilio->sendWhatsappFreeform($phone, $reply);

        Log::info('[WhatsApp] replied', ['phone' => $phone, 'chat_id' => $chat->chat_id]);
    }

    /**
     * Find a live chat for this number, or open a new one.
     *
     * A session is reused while it is fresh. Once it goes stale the next
     * message starts a clean conversation, so someone messaging a week later
     * is not answered in the middle of an old thread.
     */
    protected function resolveChat(string $phone): WhatsappChat
    {
        $timeout = (int) config('services.retell.chat_timeout_minutes', 180);

        $chat = WhatsappChat::where('phone', $phone)->first();

        if ($chat && $chat->chat_id && $chat->status === 'active' && !$chat->isStale($timeout)) {
            return $chat;
        }

        // Close the stale one so Retell is not holding a dead session.
        if ($chat && $chat->chat_id) {
            $this->retell->endChat($chat->chat_id);
        }

        $user = $this->matchUser($phone);

        $chatId = $this->retell->createChat(
            $this->dynamicVariablesFor($user, $phone),
            ['channel' => 'whatsapp', 'phone' => $phone, 'user_id' => $user?->id]
        );

        if ($chat) {
            $chat->update([
                'chat_id'         => $chatId,
                'user_id'         => $user?->id,
                'status'          => 'active',
                'last_message_at' => now(),
                'message_count'   => 0,
            ]);

            return $chat->refresh();
        }

        return WhatsappChat::create([
            'phone'           => $phone,
            'chat_id'         => $chatId,
            'user_id'         => $user?->id,
            'status'          => 'active',
            'last_message_at' => now(),
            'message_count'   => 0,
        ]);
    }

    /**
     * Try to work out who is messaging. Phone numbers are stored in several
     * formats in users.phone (local 04xx, +61, bare 61), so check each.
     */
    protected function matchUser(string $phone): ?User
    {
        $digits = preg_replace('/\D/', '', $phone);          // 61493899403
        $local  = '0' . substr($digits, 2);                   // 0493899403
        $intl   = '+' . $digits;                              // +61493899403

        return User::whereIn('phone', array_unique([$phone, $intl, $digits, $local]))->first();
    }

    /**
     * What the agent knows before the first word. Anything we can fill in
     * here is a question the guard does not have to answer.
     */
    protected function dynamicVariablesFor(?User $user, string $phone): array
    {
        if (!$user) {
            return [
                'caller_known'  => 'no',
                'caller_phone'  => $phone,
                'caller_name'   => '',
                'caller_email'  => '',
                'account_type'  => '',
                'account_state' => '',
            ];
        }

        // customer = Client in the user-facing language.
        $type = match ($user->user_type) {
            'customer'   => 'client',
            'contractor' => 'contractor',
            'staff'      => ((int) $user->user_id === 1) ? 'staffoo_staff' : 'contractor_staff',
            default      => (string) $user->user_type,
        };

        return [
            'caller_known'  => 'yes',
            'caller_phone'  => $phone,
            'caller_name'   => (string) $user->name,
            'caller_email'  => (string) $user->email,
            'account_type'  => $type,
            'account_state' => ((int) $user->is_active === 1) ? 'active' : 'inactive',
        ];
    }

    protected function safeReply(?string $from, string $message): void
    {
        if (!$from) {
            return;
        }

        try {
            $this->twilio->sendWhatsappFreeform(str_replace('whatsapp:', '', $from), $message);
        } catch (Throwable $e) {
            Log::error('[WhatsApp] failed to send error reply', ['error' => $e->getMessage()]);
        }
    }
}
