<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One-time codes used to verify a WhatsApp/chat caller before the agent
 * reads out anything detailed (specific shifts, pay/payslip specifics,
 * document breakdowns). The code is emailed to the account's registered
 * email — never sent over WhatsApp itself — so a stolen phone number alone
 * can't pull account detail out of the assistant.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_otp_verifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('phone');          // the WhatsApp number asking
            $table->string('code_hash');      // hashed, never store the plain code
            $table->string('purpose')->default('chat_detail'); // chat_detail | account_creation
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at');
            $table->timestamp('consumed_at')->nullable();
            $table->timestamps();

            $table->index(['phone', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_otp_verifications');
    }
};
