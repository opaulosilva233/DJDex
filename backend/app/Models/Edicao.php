<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Edicao extends Model
{
    protected $table = 'edicoes';

    protected $fillable = ['festival_id', 'ano', 'local', 'data_inicio', 'duracao'];

    public function festival()
    {
        return $this->belongsTo(Festival::class, 'festival_id');
    }
}
