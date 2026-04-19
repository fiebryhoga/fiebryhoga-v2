<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Connection extends Model
{
    protected $fillable = ['tag_id', 'full_name', 'nickname', 'gender', 'whatsapp', 'instagram', 'address', 'avatar'];

    public function tag() { return $this->belongsTo(ConnectionTag::class, 'tag_id'); }
}