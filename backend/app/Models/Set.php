<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Set extends Model
{
    protected $fillable = ['dj_id', 'festival_id', 'data', 'hora_inicio', 'hora_fim', 'avaliacao'];

    public function dj()
    {
        return $this->belongsTo(DJ::class, 'dj_id');
    }

    public function festival()
    {
        return $this->belongsTo(Festival::class, 'festival_id');
    }
}
