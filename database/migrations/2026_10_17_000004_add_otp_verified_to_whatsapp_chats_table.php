<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Marks a WhatsApp chat session as identity-verified after a successful OTP
 * check, so the agent doesn't have to re-verify on every message within the
 * same session.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_chats', function (Blueprint $table) {
            $table->timestamp('otp_verified_at')->nullable()->after('message_count');
            $table->unsignedBigInteger('otp_verified_user_id')->nullable()->after('otp_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_chats', function (Blueprint $table) {
            $table->dropColumn(['otp_verified_at', 'otp_verified_user_id']);
        });
    }
};
