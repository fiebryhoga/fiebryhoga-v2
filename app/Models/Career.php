<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Career extends Model
{
    protected $fillable = ['company_name', 'job_title', 'location', 'start_date', 'end_date', 'is_active', 'order'];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function activities()
    {
        return $this->hasMany(CareerActivity::class)->orderBy('order', 'asc');
    }
}