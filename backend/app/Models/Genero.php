<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Genero extends Model
{
    protected $table = 'generos';

    protected $fillable = [
        'nome',
        'sigla',
        'bpm',
        'intensidade',
        'origem',
        'elemento_sonoro',
        'cor',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['elementoSonoro'];

    /**
     * Get the elementoSonoro attribute.
     */
    public function getElementoSonoroAttribute(): ?string
    {
        return $this->attributes['elemento_sonoro'] ?? null;
    }

    /**
     * Set the elementoSonoro attribute.
     */
    public function setElementoSonoroAttribute(?string $value): void
    {
        $this->attributes['elemento_sonoro'] = $value;
    }

    /**
     * Convert the model instance to an array.
     */
    public function toArray(): array
    {
        $array = parent::toArray();
        if (array_key_exists('elemento_sonoro', $array)) {
            $array['elementoSonoro'] = $array['elemento_sonoro'];
            unset($array['elemento_sonoro']);
        }
        return $array;
    }

    public function djs()
    {
        return $this->belongsToMany(DJ::class, 'dj_genero', 'genero_id', 'dj_id');
    }

    public function festivais()
    {
        return $this->belongsToMany(Festival::class, 'festival_genero', 'genero_id', 'festival_id');
    }
}
