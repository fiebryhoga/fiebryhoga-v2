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
        Schema::create('coding_notes', function (Blueprint $table) {
            $table->id();
            // nullOnDelete: Jika folder dihapus, catatan di dalamnya otomatis pindah ke root (Tanpa Folder)
            $table->foreignId('folder_id')->nullable()->constrained('coding_folders')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->longText('content')->nullable(); // Untuk menyimpan kode / langkah-langkah
            $table->string('language')->default('plaintext'); // php, javascript, bash, dll
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coding_notes');
    }
};
