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
    Schema::create('education', function (Blueprint $table) {
        $table->id();
        $table->string('institution_name'); // Nama kampus/sekolah
        $table->string('degree'); // Jenjang (S1, SMA, D3)
        $table->string('field_of_study'); // Jurusan
        $table->date('start_date');
        $table->date('end_date')->nullable(); // Null jika masih menempuh pendidikan
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
        Schema::dropIfExists('education');
    }
};
