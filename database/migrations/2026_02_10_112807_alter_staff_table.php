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
        Schema::table('staff', function (Blueprint $table) {
            $table->string('address')->nullable()->after('user_id');
            $table->string('profile_image')->nullable()->after('address');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('profile_image');
            $table->string('city')->nullable()->after('gender');
            $table->string('staff_document_type')->nullable()->after('city');
        });

        Schema::table('staff', function (Blueprint $table) {
            $table->dropColumn([
                'employee_code',
                'designation',
                'joining_date',
                'salary'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->string('employee_code')->nullable();
            $table->string('designation')->nullable();
            $table->date('joining_date')->nullable();
            $table->decimal('salary', 10, 2)->nullable();
        });

        Schema::table('staff', function (Blueprint $table) {
            $table->dropColumn([
                'address',
                'profile_image',
                'gender',
                'city'
            ]);
        });
    }
};