<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Genero extends Model
{
    protected $table = 'generos';

    protected $fillable = ['nome'];

    public function djs()
    {
        return $this->belongsToMany(DJ::class, 'dj_genero', 'genero_id', 'dj_id');
    }

    public function festivais()
    {
        return $this->belongsToMany(Festival::class, 'festival_genero', 'genero_id', 'festival_id');
    }
}
