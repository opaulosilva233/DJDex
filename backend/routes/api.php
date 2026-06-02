<?php

use App\Http\Controllers\DJController;
use App\Http\Controllers\FestivalController;
use App\Http\Controllers\GeneroController;
use App\Http\Controllers\EdicaoController;
use App\Http\Controllers\SetController;
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

// DJs
Route::get('/djs', [DJController::class, 'index']);
Route::post('/djs', [DJController::class, 'store']);

// Festivais
Route::get('/festivais', [FestivalController::class, 'index']);
Route::post('/festivais', [FestivalController::class, 'store']);

// Generos
Route::get('/generos', [GeneroController::class, 'index']);
Route::post('/generos', [GeneroController::class, 'store']);

// Edicoes
Route::get('/edicoes', [EdicaoController::class, 'index']);
Route::post('/edicoes', [EdicaoController::class, 'store']);

// Sets
Route::get('/sets', [SetController::class, 'index']);
Route::post('/sets', [SetController::class, 'store']);
