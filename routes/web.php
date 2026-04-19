<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\TechStackController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\EducationController;
use App\Http\Controllers\CareerController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\ConnectionController;
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

    Route::get('/api/search', [SearchController::class, 'globalSearch'])->name('api.search');

    Route::post('/notifications/mark-as-read', function () {
        auth()->user()->unreadNotifications->markAsRead();
        return back();
    })->name('notifications.markRead');

    Route::get('/admin/logs', [ActivityLogController::class, 'index'])->name('logs.index');
    // Route::get('/api/search', [App\Http\Controllers\AdminController::class, 'globalSearch'])->name('api.search');

    Route::get('/admins', [AdminController::class, 'index'])->name('admins.index');
    Route::post('/admins', [AdminController::class, 'store'])->name('admins.store');
    Route::post('/admins/{user}', [AdminController::class, 'update'])->name('admins.update');
    Route::delete('/admins/{user}', [AdminController::class, 'destroy'])->name('admins.destroy');

    Route::get('/tech-stacks', [TechStackController::class, 'index'])->name('tech-stacks.index');
    Route::post('/tech-stacks', [TechStackController::class, 'store'])->name('tech-stacks.store');
    Route::post('/tech-stacks/{techStack}', [TechStackController::class, 'update'])->name('tech-stacks.update');
    Route::post('/admin/tech-stacks/update-order', [TechStackController::class, 'updateOrder'])->name('tech-stacks.update-order');
    Route::delete('/tech-stacks/{techStack}', [TechStackController::class, 'destroy'])->name('tech-stacks.destroy');

    // Project Routes
    Route::get('/projects', [App\Http\Controllers\ProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [App\Http\Controllers\ProjectController::class, 'store'])->name('projects.store');
    Route::post('/projects/{project}', [App\Http\Controllers\ProjectController::class, 'update'])->name('projects.update');
    Route::post('/admin/projects/update-order', [ProjectController::class, 'updateOrder'])->name('projects.update-order');
    Route::delete('/projects/{project}', [App\Http\Controllers\ProjectController::class, 'destroy'])->name('projects.destroy');

    // Education Routes
    Route::get('/educations', [App\Http\Controllers\EducationController::class, 'index'])->name('educations.index');
    Route::post('/educations', [App\Http\Controllers\EducationController::class, 'store'])->name('educations.store');
    Route::post('/educations/{education}', [App\Http\Controllers\EducationController::class, 'update'])->name('educations.update');
    Route::delete('/educations/{education}', [App\Http\Controllers\EducationController::class, 'destroy'])->name('educations.destroy');
    Route::post('/admin/educations/update-order', [App\Http\Controllers\EducationController::class, 'updateOrder'])->name('educations.update-order');

    // Education Activity Routes
    Route::post('/educations/{education}/activities', [App\Http\Controllers\EducationController::class, 'storeActivity'])->name('educations.activities.store');
    Route::post('/education-activities/{activity}', [App\Http\Controllers\EducationController::class, 'updateActivity'])->name('educations.activities.update');
    Route::delete('/education-activities/{activity}', [App\Http\Controllers\EducationController::class, 'destroyActivity'])->name('educations.activities.destroy');
    Route::post('/admin/education-activities/update-order', [App\Http\Controllers\EducationController::class, 'updateActivityOrder'])->name('educations.activities.update-order');

    // Career Routes
    Route::get('/careers', [App\Http\Controllers\CareerController::class, 'index'])->name('careers.index');
    Route::post('/careers', [App\Http\Controllers\CareerController::class, 'store'])->name('careers.store');
    Route::post('/careers/{career}', [App\Http\Controllers\CareerController::class, 'update'])->name('careers.update');
    Route::delete('/careers/{career}', [App\Http\Controllers\CareerController::class, 'destroy'])->name('careers.destroy');
    Route::post('/admin/careers/update-order', [App\Http\Controllers\CareerController::class, 'updateOrder'])->name('careers.update-order');

    // Career Activity Routes
    Route::post('/careers/{career}/activities', [App\Http\Controllers\CareerController::class, 'storeActivity'])->name('careers.activities.store');
    Route::post('/career-activities/{activity}', [App\Http\Controllers\CareerController::class, 'updateActivity'])->name('careers.activities.update');
    Route::delete('/career-activities/{activity}', [App\Http\Controllers\CareerController::class, 'destroyActivity'])->name('careers.activities.destroy');
    Route::post('/admin/career-activities/update-order', [App\Http\Controllers\CareerController::class, 'updateActivityOrder'])->name('careers.activities.update-order');

    Route::get('/articles', [App\Http\Controllers\ArticleController::class, 'index'])->name('articles.index');
    Route::post('/articles', [App\Http\Controllers\ArticleController::class, 'store'])->name('articles.store');
    Route::post('/articles/{article}', [App\Http\Controllers\ArticleController::class, 'update'])->name('articles.update');
    Route::delete('/articles/{article}', [App\Http\Controllers\ArticleController::class, 'destroy'])->name('articles.destroy');
    Route::post('/admin/articles/update-order', [App\Http\Controllers\ArticleController::class, 'updateOrder'])->name('articles.update-order');

    // Contact Routes
    Route::get('/contacts', [App\Http\Controllers\ContactController::class, 'index'])->name('contacts.index');
    Route::post('/contacts', [App\Http\Controllers\ContactController::class, 'store'])->name('contacts.store');
    Route::post('/contacts/{contact}', [App\Http\Controllers\ContactController::class, 'update'])->name('contacts.update');
    Route::delete('/contacts/{contact}', [App\Http\Controllers\ContactController::class, 'destroy'])->name('contacts.destroy');
    Route::post('/admin/contacts/update-order', [App\Http\Controllers\ContactController::class, 'updateOrder'])->name('contacts.update-order');

    Route::get('/gallery', [GalleryController::class, 'index'])->name('gallery.index');
    Route::post('/gallery/albums', [GalleryController::class, 'storeAlbum'])->name('gallery.albums.store');
    Route::delete('/gallery/albums/{album}', [GalleryController::class, 'destroyAlbum'])->name('gallery.albums.destroy');
    Route::put('/gallery/albums/{album}', [GalleryController::class, 'updateAlbum'])->name('gallery.albums.update');


    Route::post('/gallery/images', [GalleryController::class, 'storeImages'])->name('gallery.images.store');
    Route::put('/gallery/images/{image}', [GalleryController::class, 'updateImage'])->name('gallery.images.update');
    Route::delete('/gallery/images/{image}', [GalleryController::class, 'destroyImage'])->name('gallery.images.destroy');

    Route::post('/gallery/images/bulk-destroy', [GalleryController::class, 'bulkDestroy'])->name('gallery.images.bulk-destroy');
    Route::post('/gallery/images/bulk-move', [GalleryController::class, 'bulkMove'])->name('gallery.images.bulk-move');

    Route::get('/connections', [ConnectionController::class, 'index'])->name('connections.index');
    Route::post('/connections', [ConnectionController::class, 'store'])->name('connections.store');
    Route::post('/connections/{connection}', [ConnectionController::class, 'update'])->name('connections.update');
    Route::delete('/connections/{connection}', [ConnectionController::class, 'destroy'])->name('connections.destroy');

    Route::post('/connection-tags', [ConnectionController::class, 'storeTag'])->name('connection-tags.store');
    Route::put('/connection-tags/{tag}', [ConnectionController::class, 'updateTag'])->name('connection-tags.update');
    Route::delete('/connection-tags/{tag}', [ConnectionController::class, 'destroyTag'])->name('connection-tags.destroy');
    
    Route::get('/profile', [AdminController::class, 'profileEdit'])->name('profile.edit');
    Route::post('/profile', [AdminController::class, 'profileUpdate'])->name('profile.update');

    
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    
});

require __DIR__.'/auth.php';
