<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Superadmin on/off switchboard for every automated WhatsApp (and future
 * channel) notification in the system.
 *
 * One row per event key (e.g. "job.posted", "payment.completed"). The
 * WhatsappNotificationService checks this table before sending anything, so
 * turning a row off stops that message everywhere it's fired from, with no
 * code change and no deploy.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();          // e.g. job.posted
            $table->string('label');                  // human label for the admin UI
            $table->string('group')->default('general'); // account | job | payment | admin
            $table->string('channel')->default('whatsapp'); // whatsapp | sms | email
            $table->boolean('enabled')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        $defaults = [
            ['key' => 'account.activated',        'label' => 'Account activated',                 'group' => 'account', 'description' => 'Sent to a user the moment their account flips to active.'],
            ['key' => 'account.created',          'label' => 'Account created via chat',           'group' => 'account', 'description' => 'Confirms a new account created through the WhatsApp/chat assistant.'],
            ['key' => 'job.posted',               'label' => 'Job posted to RPs / staff',          'group' => 'job', 'description' => 'Sent to resource partners and eligible staff when a new job becomes available to them.'],
            ['key' => 'job.accepted_client',      'label' => 'Job accepted — notify client',       'group' => 'job', 'description' => 'Tells the client their job was accepted and to check status/payment.'],
            ['key' => 'job.accepted_contractor',  'label' => 'Job accepted — notify contractor',   'group' => 'job', 'description' => 'Reminds the resource partner to assign one of their guards.'],
            ['key' => 'job.guard_assigned',       'label' => 'Guard assigned a job',               'group' => 'job', 'description' => 'Tells the guard/staff they have a new job.'],
            ['key' => 'job.staff_confirm',        'label' => 'Staff accepted — confirm availability', 'group' => 'job', 'description' => 'Tells a STAFFOO staff member who accepted a job to confirm availability.'],
            ['key' => 'job.signin',               'label' => 'Guard signed in',                    'group' => 'job', 'description' => 'Tells the client and the RP/contractor a guard has signed in on site.'],
            ['key' => 'job.signout',              'label' => 'Guard signed out',                   'group' => 'job', 'description' => 'Tells the client and the RP/contractor a guard has signed out / completed the job.'],
            ['key' => 'job.chat_request',         'label' => 'Job request received via chat',      'group' => 'job', 'description' => 'Pings admin numbers whenever the chat assistant takes a job request.'],
            ['key' => 'payment.due',              'label' => 'Payment due reminder',               'group' => 'payment', 'description' => 'Sent to the client when a job payment is still outstanding.'],
            ['key' => 'payment.completed',        'label' => 'Payment completed',                  'group' => 'payment', 'description' => 'Sent to client, resource partner and admin once a payment is captured in full.'],
            ['key' => 'admin.daily_summary',      'label' => 'Daily admin summary',                'group' => 'admin', 'description' => 'One message per day to admin numbers with job-posting and account-creation counts.'],
            ['key' => 'security.otp_gate',        'label' => 'OTP gate for detailed chat answers', 'group' => 'security', 'description' => 'When on, the chat assistant must verify identity by email OTP before giving shift/pay specifics.'],
        ];

        $now = now();
        foreach ($defaults as $row) {
            $row['enabled']    = true;
            $row['channel']    = 'whatsapp';
            $row['created_at'] = $now;
            $row['updated_at'] = $now;
            DB::table('notification_settings')->insert($row);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_settings');
    }
};
