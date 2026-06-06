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
        Schema::table('generos', function (Blueprint $table) {
            $table->string('sigla', 10)->nullable();
            $table->integer('bpm')->default(120);
            $table->integer('intensidade')->default(5);
            $table->string('origem')->nullable();
            $table->string('elemento_sonoro')->nullable();
            $table->string('cor')->default('#a855f7');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('generos', function (Blueprint $table) {
            $table->dropColumn(['sigla', 'bpm', 'intensidade', 'origem', 'elemento_sonoro', 'cor']);
        });
    }
};
