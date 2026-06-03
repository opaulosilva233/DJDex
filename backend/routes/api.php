<?php

use App\Http\Controllers\DJController;
use App\Http\Controllers\FestivalController;
use App\Http\Controllers\GeneroController;
use App\Http\Controllers\EdicaoController;
use App\Http\Controllers\SetController;
use App\Http\Controllers\EstatisticaController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public Authentication routes
Route::post('login', [AuthController::class, 'login']);

// Public Read-Only routes
Route::get('estatisticas', [EstatisticaController::class, 'index']);
Route::apiResource('djs', DJController::class)->only(['index', 'show']);
Route::apiResource('festivais', FestivalController::class)->only(['index', 'show']);
Route::apiResource('generos', GeneroController::class)->only(['index', 'show']);
Route::apiResource('edicoes', EdicaoController::class)->only(['index', 'show']);
Route::apiResource('sets', SetController::class)->only(['index', 'show']);

// Protected Write routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    
    Route::apiResource('djs', DJController::class)->except(['index', 'show']);
    Route::apiResource('festivais', FestivalController::class)->except(['index', 'show']);
    Route::apiResource('generos', GeneroController::class)->except(['index', 'show']);
    Route::apiResource('edicoes', EdicaoController::class)->except(['index', 'show']);
    Route::apiResource('sets', SetController::class)->except(['index', 'show']);
});
