<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAgoraUidToUsersTable extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('agora_uid')->nullable()->unique()->after('id');
            $table->boolean('is_online')->default(false)->after('email');
            $table->timestamp('last_seen')->nullable()->after('is_online');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['agora_uid', 'is_online', 'last_seen']);
        });
    }
}