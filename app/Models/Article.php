<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
        'user_id', 'title', 'slug', 'content', 'thumbnail', 
        'tags', 'published_at', 'views', 'meta_description', 
        'meta_keywords', 'is_active', 'order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'published_at' => 'date',
        'tags' => 'array', // Otomatis ubah JSON ke Array
    ];

    // Relasi ke tabel User (Penulis)
    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}