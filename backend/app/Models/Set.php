<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Set extends Model
{
    protected $fillable = ['dj_id', 'dj2_id', 'festival_id', 'edicao_id', 'especial', 'nome_especial', 'data', 'hora_inicio', 'hora_fim', 'avaliacao'];

    public function dj()
    {
        return $this->belongsTo(DJ::class, 'dj_id');
    }

    public function dj2()
    {
        return $this->belongsTo(DJ::class, 'dj2_id');
    }

    public function festival()
    {
        return $this->belongsTo(Festival::class, 'festival_id');
    }

    public function edicao()
    {
        return $this->belongsTo(Edicao::class, 'edicao_id');
    }
}
