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
        Schema::create('careers', function (Blueprint $table) {
            $table->id();
            $table->string('company_name'); // Nama institusi/perusahaan
            $table->string('job_title'); // Pekerjaan / Posisi
            $table->string('location'); // Lokasi (misal: Bekasi, Remote, Jakarta)
            $table->date('start_date');
            $table->date('end_date')->nullable(); // Null jika masih bekerja
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
        Schema::dropIfExists('careers');
    }
};
