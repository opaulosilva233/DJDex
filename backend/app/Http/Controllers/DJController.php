<?php

namespace App\Http\Controllers;

use App\Models\DJ;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DJController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        // Fetch all DJs with their associated genres to prevent N+1 query issues
        $djs = DJ::with('generos')->get();

        return response()->json($djs);
    }

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        $dj = DJ::with('generos')->findOrFail($id);
        return response()->json($dj);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // Normalise generoIds from frontend
        if ($request->has('generoIds') && !$request->has('generos')) {
            $request->merge(['generos' => $request->input('generoIds')]);
        }

        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'biografia' => 'required|string',
            'imagem' => 'nullable|string',
            'generos' => 'nullable|array',
            'generos.*' => 'integer|exists:generos,id',
        ]);

        $dj = DJ::create([
            'nome' => $validated['nome'],
            'biografia' => $validated['biografia'],
            'imagem' => $validated['imagem'] ?? null,
        ]);

        if (!empty($validated['generos'])) {
            $dj->generos()->attach($validated['generos']);
        }

        return response()->json($dj->load('generos'), 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        // Normalise generoIds from frontend
        if ($request->has('generoIds') && !$request->has('generos')) {
            $request->merge(['generos' => $request->input('generoIds')]);
        }

        $dj = DJ::findOrFail($id);

        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'biografia' => 'required|string',
            'imagem' => 'nullable|string',
            'generos' => 'nullable|array',
            'generos.*' => 'integer|exists:generos,id',
        ]);

        $dj->update([
            'nome' => $validated['nome'],
            'biografia' => $validated['biografia'],
            'imagem' => $validated['imagem'] ?? null,
        ]);

        $generos = $validated['generos'] ?? [];
        $dj->generos()->sync($generos);

        return response()->json($dj->load('generos'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        $dj = DJ::findOrFail($id);
        $dj->delete();

        return response()->json(null, 204);
    }
}
