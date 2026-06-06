<?php

namespace App\Http\Controllers;

use App\Models\Set;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $sets = Set::with(['dj', 'dj2', 'festival', 'edicao'])->get();
        return response()->json($sets);
    }

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        $set = Set::with(['dj', 'dj2', 'festival', 'edicao'])->findOrFail($id);
        return response()->json($set);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $this->normalizeRequest($request);

        $validated = $request->validate([
            'dj_id' => 'required|integer|exists:djs,id',
            'dj2_id' => 'nullable|integer|exists:djs,id|different:dj_id',
            'festival_id' => 'required|integer|exists:festivais,id',
            'edicao_id' => 'nullable|integer|exists:edicoes,id',
            'especial' => 'nullable|boolean',
            'nome_especial' => 'nullable|string|max:255',
            'data' => 'required|date',
            'hora_inicio' => 'required|string',
            'hora_fim' => 'nullable|string',
            'avaliacao' => 'nullable|numeric|min:0|max:10',
        ]);

        $set = Set::create($validated);

        return response()->json($set->load(['dj', 'dj2', 'festival', 'edicao']), 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $this->normalizeRequest($request);

        $set = Set::findOrFail($id);

        $validated = $request->validate([
            'dj_id' => 'required|integer|exists:djs,id',
            'dj2_id' => 'nullable|integer|exists:djs,id|different:dj_id',
            'festival_id' => 'required|integer|exists:festivais,id',
            'edicao_id' => 'nullable|integer|exists:edicoes,id',
            'especial' => 'nullable|boolean',
            'nome_especial' => 'nullable|string|max:255',
            'data' => 'required|date',
            'hora_inicio' => 'required|string',
            'hora_fim' => 'nullable|string',
            'avaliacao' => 'nullable|numeric|min:0|max:10',
        ]);

        $set->update($validated);

        return response()->json($set->load(['dj', 'dj2', 'festival', 'edicao']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        $set = Set::findOrFail($id);
        $set->delete();

        return response()->json(null, 204);
    }

    /**
     * Normalize camelCase parameters from frontend to snake_case.
     */
    private function normalizeRequest(Request $request)
    {
        if ($request->has('djId') && !$request->has('dj_id')) {
            $request->merge(['dj_id' => $request->input('djId')]);
        }
        if ($request->has('dj2Id') && !$request->has('dj2_id')) {
            $request->merge(['dj2_id' => $request->input('dj2Id')]);
        }
        if ($request->has('festivalId') && !$request->has('festival_id')) {
            $request->merge(['festival_id' => $request->input('festivalId')]);
        }
        if ($request->has('edicaoId') && !$request->has('edicao_id')) {
            $request->merge(['edicao_id' => $request->input('edicaoId')]);
        }
        if ($request->has('nomeEspecial') && !$request->has('nome_especial')) {
            $request->merge(['nome_especial' => $request->input('nomeEspecial')]);
        }
        if ($request->has('horaInicio') && !$request->has('hora_inicio')) {
            $request->merge(['hora_inicio' => $request->input('horaInicio')]);
        }
        if ($request->has('horaFim') && !$request->has('hora_fim')) {
            $request->merge(['hora_fim' => $request->input('horaFim')]);
        }
    }
}
