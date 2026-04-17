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
    Schema::create('gallery_images', function (Blueprint $table) {
        $table->id();
        // foreignId nullable agar foto bisa berstatus "Tanpa Album"
        $table->foreignId('album_id')->nullable()->constrained()->nullOnDelete();
        $table->string('name'); // Nama file yang bisa di-rename
        $table->string('path'); // Lokasi di storage
        $table->string('size'); // Ukuran file (contoh: 2.5 MB)
        $table->string('mime_type')->nullable(); // extension
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gallery_images');
    }
};
