<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index()
    {
        $logs = \App\Models\ActivityLog::with('user')->latest()->paginate(10);

        return \Inertia\Inertia::render('Admin/Logs/Index', [
            'logs' => $logs
        ]);
    }
}
