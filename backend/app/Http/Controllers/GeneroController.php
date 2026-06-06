<?php

namespace App\Http\Controllers;

use App\Models\Genero;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeneroController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $generos = Genero::all();
        return response()->json($generos);
    }

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        $genero = Genero::findOrFail($id);
        return response()->json($genero);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nome' => 'required|string|unique:generos,nome|max:255',
            'sigla' => 'required|string|max:10',
            'bpm' => 'required|integer|min:60|max:250',
            'intensidade' => 'required|integer|min:1|max:10',
            'origem' => 'nullable|string|max:255',
            'elementoSonoro' => 'nullable|string|max:255',
            'cor' => 'required|string|max:25',
        ]);

        if (array_key_exists('elementoSonoro', $validated)) {
            $validated['elemento_sonoro'] = $validated['elementoSonoro'];
            unset($validated['elementoSonoro']);
        }

        $genero = Genero::create($validated);

        return response()->json($genero, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $genero = Genero::findOrFail($id);

        $validated = $request->validate([
            'nome' => 'required|string|max:255|unique:generos,nome,' . $id,
            'sigla' => 'required|string|max:10',
            'bpm' => 'required|integer|min:60|max:250',
            'intensidade' => 'required|integer|min:1|max:10',
            'origem' => 'nullable|string|max:255',
            'elementoSonoro' => 'nullable|string|max:255',
            'cor' => 'required|string|max:25',
        ]);

        if (array_key_exists('elementoSonoro', $validated)) {
            $validated['elemento_sonoro'] = $validated['elementoSonoro'];
            unset($validated['elementoSonoro']);
        }

        $genero->update($validated);

        return response()->json($genero);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        $genero = Genero::findOrFail($id);
        $genero->delete();

        return response()->json(null, 204);
    }
}
