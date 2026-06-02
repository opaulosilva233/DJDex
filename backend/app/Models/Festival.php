<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Festival extends Model
{
    protected $table = 'festivais';

    protected $fillable = ['nome', 'tipo', 'website'];

    public function generos()
    {
        return $this->belongsToMany(Genero::class, 'festival_genero', 'festival_id', 'genero_id');
    }

    public function edicoes()
    {
        return $this->hasMany(Edicao::class, 'festival_id');
    }

    public function sets()
    {
        return $this->hasMany(Set::class, 'festival_id');
    }
}
