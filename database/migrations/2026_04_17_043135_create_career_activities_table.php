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
    Schema::create('career_activities', function (Blueprint $table) {
        $table->id();
        $table->foreignId('career_id')->constrained('careers')->cascadeOnDelete();
        $table->string('name'); // Aktivitas / Tanggung Jawab
        $table->text('description')->nullable(); 
        $table->boolean('is_active')->default(true);
        $table->integer('order')->default(0);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('career_activities');
    }
};
