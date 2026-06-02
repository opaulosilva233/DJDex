<?php

namespace App\Http\Controllers;

use App\Models\Edicao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EdicaoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $edicoes = Edicao::with('festival')->get();
        return response()->json($edicoes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'festival_id' => 'required|integer|exists:festivais,id',
            'ano' => 'required|integer|min:1900|max:2100',
            'local' => 'required|string|max:255',
            'data_inicio' => 'required|date',
            'duracao' => 'required|integer|min:1',
        ]);

        $edicao = Edicao::create($validated);

        return response()->json($edicao->load('festival'), 201);
    }
}
