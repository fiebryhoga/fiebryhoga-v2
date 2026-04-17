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
    Schema::create('projects', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->text('description')->nullable();
        $table->string('type'); // e.g., Web App, Landing Page, Mobile App
        $table->string('repository_url')->nullable();
        $table->string('live_url')->nullable();
        $table->enum('displayed_link', ['repository', 'live_url', 'none'])->default('none');
        $table->date('start_date');
        $table->date('end_date')->nullable();
        $table->string('image')->nullable(); // Gambar cover project
        $table->boolean('is_active')->default(true);
        $table->integer('order')->default(0); // Untuk urutan tampilan nanti
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
