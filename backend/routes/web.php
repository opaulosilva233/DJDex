<?php
 
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Route;

Route::get('storage/{path}', function ($path) {
    \Illuminate\Support\Facades\Log::info('Storage Route Fallback Triggered', [
        'requested_path' => $path,
        'disk_public_exists' => Storage::disk('public')->exists($path),
        'disk_public_path' => Storage::disk('public')->path($path),
        'storage_path_app_public' => storage_path('app/public'),
    ]);

    if (!Storage::disk('public')->exists($path)) {
        abort(404);
    }
    
    $filePath = Storage::disk('public')->path($path);
    $realPath = realpath($filePath);
    $publicPath = realpath(storage_path('app/public'));
    
    \Illuminate\Support\Facades\Log::info('Storage Route Fallback File Details', [
        'file_path' => $filePath,
        'resolved_real_path' => $realPath,
        'resolved_public_path' => $publicPath,
        'path_match' => ($realPath && str_starts_with($realPath, $publicPath))
    ]);

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
