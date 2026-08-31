<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Converter imagens de DJs
        $djs = DB::table('djs')->whereNotNull('imagem')->get();
        foreach ($djs as $dj) {
            $imagem = $dj->imagem;
            if (!$imagem || str_starts_with($imagem, 'data:') || str_starts_with($imagem, 'http://') || str_starts_with($imagem, 'https://')) {
                continue;
            }

            if (Storage::disk('public')->exists($imagem)) {
                $filePath = Storage::disk('public')->path($imagem);
                $mimeType = mime_content_type($filePath) ?: 'image/jpeg';
                $data = file_get_contents($filePath);
                if ($data !== false) {
                    $base64 = 'data:' . $mimeType . ';base64,' . base64_encode($data);
                    DB::table('djs')->where('id', $dj->id)->update(['imagem' => $base64]);
                }
            }
        }

        // 2. Converter imagens de Festivais
        $festivais = DB::table('festivais')->whereNotNull('imagem')->get();
        foreach ($festivais as $festival) {
            $imagem = $festival->imagem;
            if (!$imagem || str_starts_with($imagem, 'data:') || str_starts_with($imagem, 'http://') || str_starts_with($imagem, 'https://')) {
                continue;
            }

            if (Storage::disk('public')->exists($imagem)) {
                $filePath = Storage::disk('public')->path($imagem);
                $mimeType = mime_content_type($filePath) ?: 'image/jpeg';
                $data = file_get_contents($filePath);
                if ($data !== false) {
                    $base64 = 'data:' . $mimeType . ';base64,' . base64_encode($data);
                    DB::table('festivais')->where('id', $festival->id)->update(['imagem' => $base64]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // As imagens continuam em Base64 na base de dados
    }
};
