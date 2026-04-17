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
        Schema::create('education_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('education_id')->constrained('education')->cascadeOnDelete();
            $table->string('name'); // Nama aktivitas
            $table->text('description')->nullable(); // Penjelasan
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
        Schema::dropIfExists('education_activities');
    }
};
