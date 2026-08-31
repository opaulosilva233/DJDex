<?php

namespace App\Http\Controllers;

use App\Models\DJ;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
            $generoIds = $request->input('generoIds');
            if (is_string($generoIds)) {
                $generoIds = json_decode($generoIds, true);
            }
            $request->merge(['generos' => $generoIds]);
        }

        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'biografia' => 'required|string',
            'imagem' => 'nullable', // Can be file or string
            'generos' => 'nullable|array',
            'generos.*' => 'integer|exists:generos,id',
        ]);

        $dj = DJ::create([
            'nome' => $validated['nome'],
            'biografia' => $validated['biografia'],
            'imagem' => null,
        ]);

        if ($request->hasFile('imagem')) {
            $file = $request->file('imagem');
            $mime = $file->getMimeType() ?: 'image/jpeg';
            $base64 = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($file->getRealPath()));

            $dj->update([
                'imagem' => $base64,
            ]);
        } elseif ($request->filled('imagem') && is_string($request->input('imagem'))) {
            $dj->update([
                'imagem' => $request->input('imagem'),
            ]);
        }

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
            $generoIds = $request->input('generoIds');
            if (is_string($generoIds)) {
                $generoIds = json_decode($generoIds, true);
            }
            $request->merge(['generos' => $generoIds]);
        }

        $dj = DJ::findOrFail($id);

        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'biografia' => 'required|string',
            'imagem' => 'nullable',
            'generos' => 'nullable|array',
            'generos.*' => 'integer|exists:generos,id',
        ]);

        $djData = [
            'nome' => $validated['nome'],
            'biografia' => $validated['biografia'],
        ];

        if ($request->hasFile('imagem')) {
            $file = $request->file('imagem');
            $mime = $file->getMimeType() ?: 'image/jpeg';
            $base64 = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($file->getRealPath()));
            $djData['imagem'] = $base64;
        } elseif ($request->has('imagem')) {
            $imagemInput = $request->input('imagem');
            if ($imagemInput === null || $imagemInput === '') {
                $djData['imagem'] = null;
            } elseif (is_string($imagemInput)) {
                $djData['imagem'] = $imagemInput;
            }
        }

        $dj->update($djData);

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
