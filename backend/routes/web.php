<?php
 
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Route;

Route::get('storage/{path}', function ($path) {
    if (!Storage::disk('public')->exists($path)) {
        abort(404);
    }
    
    $filePath = Storage::disk('public')->path($path);
    $realPath = realpath($filePath);
    $publicPath = realpath(storage_path('app/public'));
    
    if (!$realPath || !str_starts_with($realPath, $publicPath)) {
        abort(403, 'Acesso não autorizado.');
    }
    
    return response()->file($filePath);
})->where('path', '.*');

Route::get('{any}', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return file_get_contents($indexPath);
    }
    return 'Frontend index.html not found. Please build the frontend.';
})->where('any', '^(?!api|up|storage).*$');
