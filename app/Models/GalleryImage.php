<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class GalleryImage extends Model {
    protected $fillable = ['album_id', 'name', 'path', 'size', 'mime_type'];
    public function album() { return $this->belongsTo(Album::class); }
}