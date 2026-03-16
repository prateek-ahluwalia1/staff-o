<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNotificationsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('receiver_id'); // Who receives the notification
            $table->unsignedBigInteger('guard_id'); // Who receives the notification
            $table->string('title');               // Notification title
            $table->text('message');                // Notification message
            $table->string('type')->default('info'); // info, success, warning, error, task
            $table->json('data')->nullable();        // Additional data (like roster_id, guard_id, etc.)
            $table->timestamp('read_at')->nullable(); // When user read it
            $table->timestamps();                     // created_at, updated_at
            
            // Indexes for faster queries
            $table->index(['receiver_id', 'read_at']);
            $table->index('created_at');
            
            // Foreign key constraint
            $table->foreign('receiver_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
}