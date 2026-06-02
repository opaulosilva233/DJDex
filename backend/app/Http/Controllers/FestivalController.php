<?php

namespace App\Http\Controllers;

use App\Models\Festival;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
            $request->merge(['generos' => $request->input('generoIds')]);
        }

        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'tipo' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'imagem' => 'nullable|string',
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
            'imagem' => $validated['imagem'] ?? null,
        ]);

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
            $request->merge(['generos' => $request->input('generoIds')]);
        }

        $festival = Festival::findOrFail($id);

        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'tipo' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'imagem' => 'nullable|string',
            'generos' => 'nullable|array',
            'generos.*' => 'integer|exists:generos,id',
            'edicoes' => 'nullable|array',
            'edicoes.*.ano' => 'required|integer',
            'edicoes.*.local' => 'required|string',
            'edicoes.*.dataInicio' => 'nullable|date',
            'edicoes.*.data_inicio' => 'nullable|date',
            'edicoes.*.duracao' => 'required|integer',
        ]);

        $festival->update([
            'nome' => $validated['nome'],
            'tipo' => $validated['tipo'] ?? null,
            'website' => $validated['website'] ?? null,
            'imagem' => $validated['imagem'] ?? null,
        ]);

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
