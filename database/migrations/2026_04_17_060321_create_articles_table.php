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
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Penulis
            $table->string('title');
            $table->string('slug')->unique(); // URL Friendly untuk SEO (misal: judul-tulisan-saya)
            $table->longText('content'); // Isi tulisan
            $table->string('thumbnail')->nullable();
            $table->json('tags')->nullable(); // Disimpan dalam format array JSON
            $table->date('published_at'); // Tanggal publish
            $table->integer('views')->default(0); // Dilihat berapa kali
            
            // --- FIELD UNTUK SEO ---
            $table->text('meta_description')->nullable(); 
            $table->string('meta_keywords')->nullable(); 

            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0); // Untuk urutan
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
