<?php

namespace App\Http\Controllers;

use App\Models\Festival;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FestivalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $festivais = Festival::with(['generos', 'edicoes'])->get();
        return response()->json($festivais);
    }

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        $festival = Festival::with(['generos', 'edicoes'])->findOrFail($id);
        return response()->json($festival);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        if ($request->has('generoIds') && !$request->has('generos')) {
            $generoIds = $request->input('generoIds');
            if (is_string($generoIds)) {
                $generoIds = json_decode($generoIds, true);
            }
            $request->merge(['generos' => $generoIds]);
        }

        if ($request->has('edicoes') && is_string($request->input('edicoes'))) {
            $request->merge(['edicoes' => json_decode($request->input('edicoes'), true)]);
        }

        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'tipo' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'imagem' => 'nullable', // Can be file or string
            'generos' => 'nullable|array',
            'generos.*' => 'integer|exists:generos,id',
            'edicoes' => 'nullable|array',
            'edicoes.*.ano' => 'required|integer',
            'edicoes.*.local' => 'required|string',
            'edicoes.*.dataInicio' => 'nullable|date',
            'edicoes.*.data_inicio' => 'nullable|date',
            'edicoes.*.duracao' => 'required|integer',
        ]);

        $festival = Festival::create([
            'nome' => $validated['nome'],
            'tipo' => $validated['tipo'] ?? null,
            'website' => $validated['website'] ?? null,
            'imagem' => null,
        ]);

        if ($request->hasFile('imagem')) {
            $file = $request->file('imagem');
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $sanitizedName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $originalName);
            $fileName = $sanitizedName . '_' . time() . '.' . $extension;

            $path = $file->storeAs('images/festivais/' . $festival->id, $fileName, 'public');

            $festival->update([
                'imagem' => $path,
            ]);
        } elseif ($request->filled('imagem') && is_string($request->input('imagem'))) {
            $festival->update([
                'imagem' => $request->input('imagem'),
            ]);
        }

        if (!empty($validated['generos'])) {
            $festival->generos()->attach($validated['generos']);
        }

        // Create editions
        if (!empty($validated['edicoes'])) {
            foreach ($validated['edicoes'] as $edData) {
                $festival->edicoes()->create([
                    'ano' => $edData['ano'],
                    'local' => $edData['local'],
                    'data_inicio' => $edData['data_inicio'] ?? $edData['dataInicio'] ?? null,
                    'duracao' => $edData['duracao'],
                ]);
            }
        }

        return response()->json($festival->load(['generos', 'edicoes']), 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        if ($request->has('generoIds') && !$request->has('generos')) {
            $generoIds = $request->input('generoIds');
            if (is_string($generoIds)) {
                $generoIds = json_decode($generoIds, true);
            }
            $request->merge(['generos' => $generoIds]);
        }

        if ($request->has('edicoes') && is_string($request->input('edicoes'))) {
            $request->merge(['edicoes' => json_decode($request->input('edicoes'), true)]);
        }

        $festival = Festival::findOrFail($id);

        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'tipo' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'imagem' => 'nullable',
            'generos' => 'nullable|array',
            'generos.*' => 'integer|exists:generos,id',
            'edicoes' => 'nullable|array',
            'edicoes.*.ano' => 'required|integer',
            'edicoes.*.local' => 'required|string',
            'edicoes.*.dataInicio' => 'nullable|date',
            'edicoes.*.data_inicio' => 'nullable|date',
            'edicoes.*.duracao' => 'required|integer',
        ]);

        $festivalData = [
            'nome' => $validated['nome'],
            'tipo' => $validated['tipo'] ?? null,
            'website' => $validated['website'] ?? null,
        ];

        if ($request->hasFile('imagem')) {
            // Delete old file if exists
            $oldImage = $festival->getRawOriginal('imagem');
            if ($oldImage && Storage::disk('public')->exists($oldImage)) {
                Storage::disk('public')->delete($oldImage);
            }

            $file = $request->file('imagem');
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $sanitizedName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $originalName);
            $fileName = $sanitizedName . '_' . time() . '.' . $extension;

            $path = $file->storeAs('images/festivais/' . $festival->id, $fileName, 'public');
            $festivalData['imagem'] = $path;
        } elseif ($request->has('imagem')) {
            $imagemInput = $request->input('imagem');
            if ($imagemInput === null || $imagemInput === '') {
                $oldImage = $festival->getRawOriginal('imagem');
                if ($oldImage && Storage::disk('public')->exists($oldImage)) {
                    Storage::disk('public')->delete($oldImage);
                }
                $festivalData['imagem'] = null;
            } elseif (is_string($imagemInput)) {
                $festivalData['imagem'] = $imagemInput;
            }
        }

        $festival->update($festivalData);

        $generos = $validated['generos'] ?? [];
        $festival->generos()->sync($generos);

        // Delete old editions and recreate
        $festival->edicoes()->delete();
        if (!empty($validated['edicoes'])) {
            foreach ($validated['edicoes'] as $edData) {
                $festival->edicoes()->create([
                    'ano' => $edData['ano'],
                    'local' => $edData['local'],
                    'data_inicio' => $edData['data_inicio'] ?? $edData['dataInicio'] ?? null,
                    'duracao' => $edData['duracao'],
                ]);
            }
        }

        return response()->json($festival->load(['generos', 'edicoes']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        $festival = Festival::findOrFail($id);
        $festival->delete();

        return response()->json(null, 204);
    }
}
