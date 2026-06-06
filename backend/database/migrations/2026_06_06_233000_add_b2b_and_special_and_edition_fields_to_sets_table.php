<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sets', function (Blueprint $table) {
            $table->foreignId('dj2_id')->nullable()->constrained('djs')->nullOnDelete();
            $table->foreignId('edicao_id')->nullable()->constrained('edicoes')->nullOnDelete();
            $table->boolean('especial')->default(false);
            $table->string('nome_especial')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sets', function (Blueprint $table) {
            $table->dropForeign(['dj2_id']);
            $table->dropColumn('dj2_id');
            $table->dropForeign(['edicao_id']);
            $table->dropColumn('edicao_id');
            $table->dropColumn('especial');
            $table->dropColumn('nome_especial');
        });
    }
};
