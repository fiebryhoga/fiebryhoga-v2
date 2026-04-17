<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'notifications' => $request->user() ? $request->user()->notifications()->take(10)->get()->map(function ($notif) {
                    return [
                        'id' => $notif->id,
                        'text' => $notif->data['message'],
                        'isRead' => $notif->read_at !== null,
                        'time' => $notif->created_at->diffForHumans(), // Menghasilkan waktu seperti "2 minutes ago"
                    ];
                }) : [],
            ],
        ];
    }
}
