<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class CodingFolder extends Model
{
    protected $fillable = ['parent_id', 'name'];

    public function notes() { return $this->hasMany(CodingNote::class, 'folder_id'); }
    public function parent() { return $this->belongsTo(CodingFolder::class, 'parent_id'); }
    public function children() { return $this->hasMany(CodingFolder::class, 'parent_id')->with('children'); }
}