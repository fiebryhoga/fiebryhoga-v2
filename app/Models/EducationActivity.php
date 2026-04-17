<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EducationActivity extends Model
{
    protected $fillable = ['education_id', 'name', 'description', 'is_active', 'order'];

    protected $casts = ['is_active' => 'boolean'];

    public function education()
    {
        return $this->belongsTo(Education::class);
    }
}