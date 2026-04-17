<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TechStack extends Model
{
    protected $fillable = ['name', 'type', 'image', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}