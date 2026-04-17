<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Album extends Model
{
    protected $fillable = ['parent_id', 'name', 'description'];

    public function images() {
        return $this->hasMany(GalleryImage::class);
    }

    // Relasi ke Induk Album
    public function parent() {
        return $this->belongsTo(Album::class, 'parent_id');
    }

    // Relasi ke Anak Album (Sub-album)
    public function children() {
        return $this->hasMany(Album::class, 'parent_id')->with('children');
    }
}