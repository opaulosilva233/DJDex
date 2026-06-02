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
}
