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
        Schema::create('sets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dj_id')->constrained('djs')->onDelete('cascade');
            $table->foreignId('festival_id')->constrained('festivais')->onDelete('cascade');
            $table->date('data');
            $table->string('hora_inicio');
            $table->string('hora_fim')->nullable();
            $table->decimal('avaliacao', 3, 1)->nullable(); // e.g. 9.4
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sets');
    }
};
