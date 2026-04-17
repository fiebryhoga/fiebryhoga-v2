<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CareerActivity extends Model
{
    protected $fillable = ['career_id', 'name', 'description', 'is_active', 'order'];

    protected $casts = ['is_active' => 'boolean'];

    public function career()
    {
        return $this->belongsTo(Career::class);
    }
}