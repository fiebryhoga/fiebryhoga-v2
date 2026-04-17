<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('password');
            $table->date('birth_date')->nullable()->after('avatar');
            $table->enum('gender', ['L', 'P'])->nullable()->after('birth_date'); // L = Laki-laki, P = Perempuan
            $table->text('address')->nullable()->after('gender');
            $table->string('phone')->nullable()->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'birth_date', 'gender', 'address', 'phone']);
        });
    }
};