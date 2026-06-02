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
        $sets = Set::with(['dj', 'festival'])->get();
        return response()->json($sets);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dj_id' => 'required|integer|exists:djs,id',
            'festival_id' => 'required|integer|exists:festivais,id',
            'data' => 'required|date',
            'hora_inicio' => 'required|string',
            'hora_fim' => 'nullable|string',
            'avaliacao' => 'nullable|numeric|min:0|max:10',
        ]);

        $set = Set::create($validated);

        return response()->json($set->load(['dj', 'festival']), 201);
    }
}
