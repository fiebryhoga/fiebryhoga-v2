<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ConnectionTag extends Model
{
    protected $fillable = ['parent_id', 'name', 'color'];

    public function connections() { return $this->hasMany(Connection::class, 'tag_id'); }
    public function parent() { return $this->belongsTo(ConnectionTag::class, 'parent_id'); }
    public function children() { return $this->hasMany(ConnectionTag::class, 'parent_id')->with('children'); }
}