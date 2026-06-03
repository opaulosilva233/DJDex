<?php

use App\Http\Controllers\DJController;
use App\Http\Controllers\FestivalController;
use App\Http\Controllers\GeneroController;
use App\Http\Controllers\EdicaoController;
use App\Http\Controllers\SetController;
use App\Http\Controllers\EstatisticaController;
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

Route::get('estatisticas', [EstatisticaController::class, 'index']);
Route::apiResource('djs', DJController::class);
Route::apiResource('festivais', FestivalController::class);
Route::apiResource('generos', GeneroController::class);
Route::apiResource('edicoes', EdicaoController::class);
Route::apiResource('sets', SetController::class);
