<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Casts\Attribute;

class Festival extends Model
{
    protected $table = 'festivais';

    protected $fillable = ['nome', 'tipo', 'website', 'imagem'];

    /**
     * Get the Festival image URL.
     */
    protected function imagem(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (!$value) {
                    return null;
                }
                if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://') || str_starts_with($value, 'data:')) {
                    return $value;
                }
                return asset('storage/' . $value);
            }
        );
    }

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
