<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = ['platform', 'value', 'url', 'is_active', 'order'];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}