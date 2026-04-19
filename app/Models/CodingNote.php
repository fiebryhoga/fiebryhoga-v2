<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class CodingNote extends Model
{
    protected $fillable = ['folder_id', 'title', 'description', 'content', 'language'];
    public function folder() { return $this->belongsTo(CodingFolder::class, 'folder_id'); }
}