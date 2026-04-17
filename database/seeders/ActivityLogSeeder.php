<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ActivityLogSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first(); // Pastikan sudah ada user di database
        if (!$admin) return;

        $types = ['success', 'info', 'warning', 'danger'];
        $actions = ['Menambah Proyek', 'Menghapus Admin', 'Mengubah Profil', 'Login Sistem'];

        // Buat 50 log acak dalam rentang 45 hari ke belakang
        for ($i = 0; $i < 50; $i++) {
            ActivityLog::create([
                'user_id' => $admin->id,
                'description' => $actions[array_rand($actions)] . " - Dummy " . ($i + 1),
                'type' => $types[array_rand($types)],
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                // Mengatur tanggal acak antara 45 hari yang lalu hingga hari ini
                'created_at' => Carbon::now()->subDays(rand(0, 45)),
            ]);
        }
    }
}