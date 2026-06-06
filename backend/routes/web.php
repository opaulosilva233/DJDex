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

    $filePath = Storage::disk('public')->path($path);
    $realPath = realpath($filePath);
    $publicPath = realpath(storage_path('app/public'));
    $exists = Storage::disk('public')->exists($path);
    $isWritable = is_writable(storage_path('app/public'));
    $safe = ($realPath && str_starts_with($realPath, $publicPath));

    \Illuminate\Support\Facades\Log::info('Storage Route Fallback File Details', [
        'file_path' => $filePath,
        'resolved_real_path' => $realPath,
        'resolved_public_path' => $publicPath,
        'path_match' => $safe
    ]);

    if ($exists && $safe) {
        return response()->file($filePath);
    }

    return response()->json([
        'status' => 'error',
        'message' => 'Ficheiro não encontrado ou acesso não autorizado.',
        'diagnostics' => [
            'requested_path' => $path,
            'file_exists_on_disk' => $exists,
            'absolute_file_path' => $filePath,
            'resolved_real_path' => $realPath ? $realPath : 'Failed resolving realpath (file does not exist)',
            'allowed_public_path' => $publicPath,
            'path_is_safe_and_allowed' => $safe ? 'Yes' : 'No',
            'storage_directory_is_writable' => $isWritable ? 'Yes' : 'No',
            'server_user' => function_exists('posix_getpwuid') ? (posix_getpwuid(posix_geteuid())['name'] ?? 'unknown') : 'unknown',
            'php_version' => PHP_VERSION,
        ]
    ], 404);
})->where('path', '.*');

Route::get('{any}', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return file_get_contents($indexPath);
    }
    return 'Frontend index.html not found. Please build the frontend.';
})->where('any', '^(?!api|up|storage).*$');
