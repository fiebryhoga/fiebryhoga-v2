<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('albums', function (Blueprint $table) {
        // Tambahkan parent_id yang merujuk ke tabel albums itu sendiri
        $table->foreignId('parent_id')->nullable()->constrained('albums')->cascadeOnDelete()->after('id');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('albums', function (Blueprint $table) {
            //
        });
    }
};
