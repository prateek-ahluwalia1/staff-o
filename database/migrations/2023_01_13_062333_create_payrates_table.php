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
        Schema::create('payrates', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('user_id');
            $table->string('position');
            $table->string('level');
            $table->string('state');
            
            $table->string('def_metro_mon_to_fri_day_rate')->nullable();
            $table->string('def_metro_mon_to_fri_night_rate')->nullable();
            $table->string('def_metro_sat_day_rate')->nullable();
            $table->string('def_metro_sat_night_rate')->nullable();
            $table->string('def_metro_sun_day_rate')->nullable();
            $table->string('def_metro_sun_night_rate')->nullable();
            $table->string('def_metro_pub_holi_day_rate')->nullable();
            $table->string('def_metro_pub_holi_night_rate')->nullable();

            $table->string('def_reg_mon_to_fri_day_rate')->nullable();
            $table->string('def_reg_mon_to_fri_night_rate')->nullable();
            $table->string('def_reg_sat_day_rate')->nullable();
            $table->string('def_reg_sat_night_rate')->nullable();
            $table->string('def_reg_sun_day_rate')->nullable();
            $table->string('def_reg_sun_night_rate')->nullable();
            $table->string('def_reg_pub_holi_day_rate')->nullable();
            $table->string('def_reg_pub_holi_night_rate')->nullable();

            $table->string('eba_metro_mon_to_fri_day_rate')->nullable();
            $table->string('eba_metro_mon_to_fri_night_rate')->nullable();
            $table->string('eba_metro_sat_day_rate')->nullable();
            $table->string('eba_metro_sat_night_rate')->nullable();
            $table->string('eba_metro_sun_day_rate')->nullable();
            $table->string('eba_metro_sun_night_rate')->nullable();
            $table->string('eba_metro_pub_holi_day_rate')->nullable();
            $table->string('eba_metro_pub_holi_night_rate')->nullable();

            $table->string('eba_reg_mon_to_fri_day_rate')->nullable();
            $table->string('eba_reg_mon_to_fri_night_rate')->nullable();
            $table->string('eba_reg_sat_day_rate')->nullable();
            $table->string('eba_reg_sat_night_rate')->nullable();
            $table->string('eba_reg_sun_day_rate')->nullable();
            $table->string('eba_reg_sun_night_rate')->nullable();
            $table->string('eba_reg_pub_holi_day_rate')->nullable();
            $table->string('eba_reg_pub_holi_night_rate')->nullable();

            $table->string('ot_base_rate')->nullable();
            $table->enum('status', ['active', 'archive'])->default('active')->nullable();
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
        Schema::dropIfExists('payrates');
    }
};
