<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-managed phone numbers for notifications that don't target a single
 * user record — right now that's just the admin-facing ones (daily summary,
 * job requests taken via chat, payment-completed admin copy).
 *
 * `group_key` lets the same table serve several admin lists later
 * (e.g. "admin.daily_summary" vs "admin.payments") without new tables.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_recipients', function (Blueprint $table) {
            $table->id();
            $table->string('group_key'); // matches a notification_settings.group or a specific key
            $table->string('phone');
            $table->string('label')->nullable();
            $table->boolean('enabled')->default(true);
            $table->timestamps();

            $table->index(['group_key', 'enabled']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_recipients');
    }
};
