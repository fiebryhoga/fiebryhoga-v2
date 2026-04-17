<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Education extends Model
{
    protected $fillable = ['institution_name', 'degree', 'field_of_study', 'start_date', 'end_date', 'is_active', 'order'];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function activities()
    {
        // Urutkan aktivitas berdasarkan kolom order
        return $this->hasMany(EducationActivity::class)->orderBy('order', 'asc');
    }
}