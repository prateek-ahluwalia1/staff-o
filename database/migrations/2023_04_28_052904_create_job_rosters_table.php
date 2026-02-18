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
        Schema::create('job_rosters', function (Blueprint $table) {
            $table->id();
            $table->string('site_id')->nullable();
            $table->string('user_id')->nullable();
            $table->string('start');
            $table->string('end');
            $table->enum('shift_payable', ['yes', 'no'])->default('yes');
            $table->enum('shift_chargeable', ['yes', 'no'])->default('yes');
            $table->integer('is_document')->default(0);
            $table->text('document_list')->nullable();

            // $table->string('payrate_level')->nullable();
            // $table->string('payrate')->nullable();
            // $table->string('chargerate_level')->nullable();
            // $table->string('chargerate')->nullable();
            // $table->string('un_published_shift')->nullable();
            // $table->string('public_holidays')->nullable();
            // $table->string('covid_marshal')->nullable();
            // $table->string('training')->nullable();
            // $table->string('continuation')->nullable();
            // $table->string('over_time')->nullable();
            // $table->string('over_time_value')->nullable();
            // $table->string('travel_time')->nullable();
            // $table->string('travel_time_value')->nullable();
            // $table->string('shift_create_status')->nullable();
            // $table->string('shift_type')->nullable();
            // $table->string('conflict')->nullable();
            // $table->string('doc_conf')->nullable();
            // $table->string('conf_start')->nullable();
            // $table->string('conf_end')->nullable();
            // $table->string('work_limitaion_conf')->nullable();
            // $table->string('total_week_hours')->nullable();
            $table->float('morning_hours', 8, 2)->nullable();
            $table->float('night_hours', 8, 2)->nullable();
            $table->float('saturday_morning_hours', 8, 2)->nullable();
            $table->float('saturday_night_hours', 8, 2)->nullable();
            $table->float('sunday_morning_hours', 8, 2)->nullable();
            $table->float('sunday_night_hours', 8, 2)->nullable();
            $table->float('ph_morning_hours', 8, 2)->nullable();
            $table->float('ph_night_hours', 8, 2)->nullable();
            // $table->boolean('update_status')->default(false);
            $table->integer('signin_status')->default(0);
            // $table->string('last_update')->nullable();
            $table->string('job_status')->default('pending');
            // $table->integer('break_status')->default(0);
            // $table->text('operation_notes')->nullable();
            $table->float('hours')->default(0.0);
            // $table->integer('admin_approved')->default(0);
            // $table->integer('admin_approved_by')->nullable();
            $table->integer('publish_status')->default(0);
            // $table->integer('unpublish_status')->default(0);
            // $table->string('custome_rate')->nullable();
            // $table->string('custome_payrate')->nullable();
            // $table->string('custome_chagerate')->nullable();
            // $table->longText('manualPayRate')->nullable();
            // $table->longText('manualChargeRate')->nullable();
            // $table->string('unprofile_name')->nullable();
            // $table->string('po_wo')->nullable();
            $table->boolean('asap')->default(0);
            // $table->integer('asap_counter')->default(0);
            $table->string('radius')->nullable();
            // $table->string('last_send_welfare_call')->nullable();
            $table->text('job_instrcutions')->nullable();
            // $table->string('green_call_notification')->nullable();
            // $table->string('green_call_before_thirty')->nullable();
            $table->string('roster_id')->nullable();
            // $table->string('rejected_by')->nullable();
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
        Schema::dropIfExists('job_rosters');
    }
};
