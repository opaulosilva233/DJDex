<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DJ extends Model
{
    protected $table = 'djs';

    protected $fillable = ['nome', 'biografia', 'imagem'];

    public function generos()
    {
        return $this->belongsToMany(Genero::class, 'dj_genero', 'dj_id', 'genero_id');
    }

    public function sets()
    {
        return $this->hasMany(Set::class, 'dj_id');
    }
}
