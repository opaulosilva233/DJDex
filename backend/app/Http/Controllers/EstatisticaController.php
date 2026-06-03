<?php

namespace App\Http\Controllers;

use App\Models\DJ;
use App\Models\Festival;
use App\Models\Edicao;
use App\Models\Set;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EstatisticaController extends Controller
{
    /**
     * Get centralized metrics.
     */
    public function index(): JsonResponse
    {
        try {
            $totalDjs = DJ::count();
            $totalFestivais = Festival::count();
            $totalEdicoes = Edicao::count();
            $totalSets = Set::count();

            // Aggregated query for DJs count per genre using pivot table
            $generosCount = DB::table('dj_genero')
                ->join('generos', 'dj_genero.genero_id', '=', 'generos.id')
                ->select('generos.nome as name', DB::raw('count(dj_genero.dj_id) as value'))
                ->groupBy('generos.id', 'generos.nome')
                ->get();

            // Clean up emojis from genre names to ensure clean text representation
            $djsPorGenero = $generosCount->map(function ($item) {
                // Regex to strip various unicode emoji blocks
                $cleanName = preg_replace('/[\x{1F600}-\x{1F64F}\x{1F300}-\x{1F5FF}\x{1F680}-\x{1F6FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{1F900}-\x{1F9FF}\x{1F1E0}-\x{1F1FF}\x{1FA70}-\x{1FAFF}]/u', '', $item->name);
                // Regex for other Symbol characters
                $cleanName = preg_replace('/\p{So}/u', '', $cleanName);
                
                return [
                    'name' => trim($cleanName),
                    'value' => (int) $item->value
                ];
            })->filter(function ($item) {
                return !empty($item['name']);
            })->values();

            return response()->json([
                'total_djs' => $totalDjs,
                'total_festivais' => $totalFestivais,
                'total_edicoes' => $totalEdicoes,
                'total_sets' => $totalSets,
                'djs_por_genero' => $djsPorGenero,
            ]);
        } catch (\Exception $e) {
            // TODO(security): Log detailed diagnostic info and return generic error message
            Log::error('Error fetching statistics: ' . $e->getMessage());
            return response()->json([
                'message' => 'Ocorreu um erro ao carregar as estatísticas.'
            ], 500);
        }
    }
}
