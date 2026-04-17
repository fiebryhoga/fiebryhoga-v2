<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use Illuminate\Console\Command;
use Carbon\Carbon;

class CleanupActivityLogs extends Command
{
    protected $signature = 'logs:cleanup';
    protected $description = 'Menghapus log aktivitas yang lebih tua dari 30 hari';

    public function handle()
    {
        $days = 30;
        $date = Carbon::now()->subDays($days);
        
        // Hapus log yang dibuat sebelum tanggal tersebut
        $deleted = ActivityLog::where('created_at', '<', $date)->delete();

        $this->info("Berhasil menghapus {$deleted} log lama.");
    }
}