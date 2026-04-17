<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SystemActivity extends Notification
{
    use Queueable;

    public $message;
    public $type;

    public function __construct($message, $type = 'info')
    {
        $this->message = $message;
        $this->type = $type; // info, warning, success, error
    }

    // Arahkan notifikasi untuk disimpan ke database
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    // Format data yang masuk ke database
    public function toDatabase(object $notifiable): array
    {
        return [
            'message' => $this->message,
            'type' => $this->type,
        ];
    }
}