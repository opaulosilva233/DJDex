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
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $sanitizedName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $originalName);
            $fileName = $sanitizedName . '_' . time() . '.' . $extension;

            $path = $file->storeAs('images/djs/' . $dj->id, $fileName, 'public');

            $dj->update([
                'imagem' => $path,
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
            // Delete old file if exists
            $oldImage = $dj->getRawOriginal('imagem');
            if ($oldImage && Storage::disk('public')->exists($oldImage)) {
                Storage::disk('public')->delete($oldImage);
            }

            $file = $request->file('imagem');
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $sanitizedName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $originalName);
            $fileName = $sanitizedName . '_' . time() . '.' . $extension;

            $path = $file->storeAs('images/djs/' . $dj->id, $fileName, 'public');
            $djData['imagem'] = $path;
        } elseif ($request->has('imagem')) {
            $imagemInput = $request->input('imagem');
            if ($imagemInput === null || $imagemInput === '') {
                $oldImage = $dj->getRawOriginal('imagem');
                if ($oldImage && Storage::disk('public')->exists($oldImage)) {
                    Storage::disk('public')->delete($oldImage);
                }
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

        // Delete the DJ's image directory physically if it exists
        if (Storage::disk('public')->exists("images/djs/{$id}")) {
            Storage::disk('public')->deleteDirectory("images/djs/{$id}");
        }

        $dj->delete();

        return response()->json(null, 204);
    }
}
