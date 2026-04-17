<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\TechStackController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {

    Route::post('/notifications/mark-as-read', function () {
        auth()->user()->unreadNotifications->markAsRead();
        return back();
    })->name('notifications.markRead');

    Route::get('/admin/logs', [ActivityLogController::class, 'index'])->name('logs.index');
    Route::get('/api/search', [App\Http\Controllers\AdminController::class, 'globalSearch'])->name('api.search');

    Route::get('/admins', [AdminController::class, 'index'])->name('admins.index');
    Route::post('/admins', [AdminController::class, 'store'])->name('admins.store');
    Route::post('/admins/{user}', [AdminController::class, 'update'])->name('admins.update');
    Route::delete('/admins/{user}', [AdminController::class, 'destroy'])->name('admins.destroy');

    Route::get('/tech-stacks', [TechStackController::class, 'index'])->name('tech-stacks.index');
    Route::post('/tech-stacks', [TechStackController::class, 'store'])->name('tech-stacks.store');
    Route::post('/tech-stacks/{techStack}', [TechStackController::class, 'update'])->name('tech-stacks.update');
    Route::post('/admin/tech-stacks/update-order', [TechStackController::class, 'updateOrder'])->name('tech-stacks.update-order');
    Route::delete('/tech-stacks/{techStack}', [TechStackController::class, 'destroy'])->name('tech-stacks.destroy');

    
    Route::get('/profile', [AdminController::class, 'profileEdit'])->name('profile.edit');
    Route::post('/profile', [AdminController::class, 'profileUpdate'])->name('profile.update');

    
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    
});

require __DIR__.'/auth.php';
