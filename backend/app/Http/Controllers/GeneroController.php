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
        ]);

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
        ]);

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
