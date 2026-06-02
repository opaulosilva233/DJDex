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
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'tipo' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'generos' => 'nullable|array',
            'generos.*' => 'integer|exists:generos,id',
        ]);

        $festival = Festival::create([
            'nome' => $validated['nome'],
            'tipo' => $validated['tipo'] ?? null,
            'website' => $validated['website'] ?? null,
        ]);

        if (!empty($validated['generos'])) {
            $festival->generos()->attach($validated['generos']);
        }

        return response()->json($festival->load(['generos', 'edicoes']), 201);
    }
}
