<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Thin wrapper over Retell's chat API.
 *
 *   POST /create-chat             -> opens a session, returns chat_id
 *   POST /create-chat-completion  -> sends one user message, returns the
 *                                    agent's new messages
 *
 * Context is kept by Retell against the chat_id, so we only ever send the
 * latest message — never the whole history.
 */
class RetellChatService
{
    protected string $baseUrl = 'https://api.retellai.com';
    protected string $apiKey;
    protected string $agentId;

    public function __construct()
    {
        $this->apiKey  = (string) config('services.retell.api_key');
        $this->agentId = (string) config('services.retell.chat_agent_id');

        if ($this->apiKey === '' || $this->agentId === '') {
            throw new RuntimeException(
                'Retell is not configured: services.retell.api_key or chat_agent_id is missing. '
                . 'Add the retell block to config/services.php and set RETELL_API_KEY / '
                . 'RETELL_CHAT_AGENT_ID in .env, then run php artisan config:clear.'
            );
        }
    }

    /**
     * Open a chat session. $dynamicVariables are injected into the agent's
     * prompt — pass the caller's name, account type, email and so on so the
     * agent does not have to ask for what we already know.
     *
     * @return string the chat_id
     */
    public function createChat(array $dynamicVariables = [], array $metadata = []): string
    {
        $payload = ['agent_id' => $this->agentId];

        if ($dynamicVariables !== []) {
            // Retell requires string values.
            $payload['retell_llm_dynamic_variables'] = array_map(
                fn ($v) => (string) $v,
                $dynamicVariables
            );
        }

        if ($metadata !== []) {
            $payload['metadata'] = $metadata;
        }

        $response = Http::withToken($this->apiKey)
            ->acceptJson()
            ->timeout(20)
            ->post($this->baseUrl . '/create-chat', $payload);

        if (!$response->successful()) {
            Log::error('[Retell] create-chat failed', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            throw new RuntimeException('Retell create-chat failed: ' . $response->status());
        }

        $chatId = $response->json('chat_id');

        if (!$chatId) {
            throw new RuntimeException('Retell create-chat returned no chat_id.');
        }

        return $chatId;
    }

    /**
     * Send one message and get the agent's reply.
     *
     * Retell returns every new message it generated, which can include tool
     * calls and their results. We only want what the human should read, so we
     * keep the 'agent' roles and join them.
     *
     * @return string the agent's reply, or '' if it produced no spoken text
     */
    public function sendMessage(string $chatId, string $content): string
    {
        $response = Http::withToken($this->apiKey)
            ->acceptJson()
            ->timeout(45) // the agent may run a tool before replying
            ->post($this->baseUrl . '/create-chat-completion', [
                'chat_id' => $chatId,
                'content' => $content,
            ]);

        if (!$response->successful()) {
            Log::error('[Retell] create-chat-completion failed', [
                'chat_id' => $chatId,
                'status'  => $response->status(),
                'body'    => $response->body(),
            ]);
            throw new RuntimeException('Retell chat completion failed: ' . $response->status());
        }

        $messages = $response->json('messages') ?? [];

        $parts = [];
        foreach ($messages as $message) {
            if (($message['role'] ?? null) === 'agent' && !empty($message['content'])) {
                $parts[] = trim($message['content']);
            }
        }

        return trim(implode("\n\n", $parts));
    }

    /**
     * Best-effort close. Retell times sessions out on its own, so a failure
     * here is logged and swallowed rather than surfaced to the user.
     */
    public function endChat(string $chatId): void
    {
        try {
            Http::withToken($this->apiKey)
                ->acceptJson()
                ->timeout(10)
                ->post($this->baseUrl . '/end-chat', ['chat_id' => $chatId]);
        } catch (\Throwable $e) {
            Log::info('[Retell] end-chat failed (ignored)', [
                'chat_id' => $chatId,
                'error'   => $e->getMessage(),
            ]);
        }
    }
}
