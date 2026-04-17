<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'type', 'repository_url', 'live_url', 
        'displayed_link', 'start_date', 'end_date', 'image', 'is_active', 'order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function techStacks()
    {
        return $this->belongsToMany(TechStack::class, 'project_tech_stack');
    }
}