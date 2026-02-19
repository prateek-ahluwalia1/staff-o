<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('job_roster_activites', function (Blueprint $table) {
            $table->id();
            $table->integer('guard_id')->nullable();
            $table->integer('job_roster_id')->nullable();
            $table->integer('job_incident_report_id')->nullable();
            $table->string('signin_time')->nullable();
            $table->string('signout_time')->nullable();
            $table->string('signin_selfie')->nullable();
            $table->string('signout_selfie')->nullable();
            $table->string('location')->nullable();
            $table->string('status')->default(0);
            $table->string('auto_signout')->default(0);
            $table->string('signin_notes')->nullable();
            $table->string('signout_notes')->nullable();
            $table->integer('last_location_time')->nullable();
            $table->string('last_location')->nullable();
            $table->string('signout_location')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('job_roster_activites');
    }
};
