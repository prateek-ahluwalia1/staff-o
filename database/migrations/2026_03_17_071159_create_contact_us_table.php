<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_contact_us_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateContactUsTable extends Migration
{
    public function up()
    {
        Schema::create('contact_us', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('inquiry_type');
            $table->string('subject');
            $table->text('message');
            $table->string('source')->default('website-contact-page');
            $table->timestamp('submitted_at')->nullable();
            $table->string('status')->default('pending'); // pending, reviewed, replied
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('contact_us');
    }
}