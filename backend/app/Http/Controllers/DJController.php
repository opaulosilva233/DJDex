<?php

namespace App\Http\Controllers;

use App\Models\DJ;
use Illuminate\Http\JsonResponse;

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
}
