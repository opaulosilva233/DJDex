<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Genero;
use App\Models\DJ;
use App\Models\Festival;
use App\Models\Edicao;
use App\Models\Set;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Clear database tables
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Set::truncate();
        Edicao::truncate();
        DB::table('dj_genero')->truncate();
        DB::table('festival_genero')->truncate();
        Festival::truncate();
        DJ::truncate();
        Genero::truncate();
        User::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 2. Create Default User
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // 3. Seed Generos
        Genero::create(['id' => 1, 'nome' => 'Hardstyle']);
        Genero::create(['id' => 2, 'nome' => 'Rawstyle']);
        Genero::create(['id' => 3, 'nome' => 'Hardcore']);
        Genero::create(['id' => 4, 'nome' => 'Frenchcore']);

        // 4. Seed DJs & attach Generos
        $sefa = DJ::create([
            'id' => 1,
            'nome' => 'Sefa',
            'biografia' => 'Referência do hardstyle melódico, conhecido por sets intensos e emotivos.'
        ]);
        $sefa->generos()->attach([1, 4]);

        $rebelion = DJ::create([
            'id' => 2,
            'nome' => 'Rebelion',
            'biografia' => 'Dupla neerlandesa com energia crua e drops pesados para grandes palcos.'
        ]);
        $rebelion->generos()->attach([2]);

        // 5. Seed Festivais & Edições
        $neonPulse = Festival::create([
            'id' => 1,
            'nome' => 'Neon Pulse',
            'tipo' => 'Indoor/Outdoor',
            'website' => 'https://neonpulse.example.com'
        ]);
        
        Edicao::create([
            'festival_id' => $neonPulse->id,
            'ano' => 2026,
            'local' => 'Lisboa',
            'data_inicio' => '2026-05-24',
            'duracao' => 3
        ]);

        $riftOpenAir = Festival::create([
            'id' => 2,
            'nome' => 'Rift Open Air',
            'tipo' => 'Open Air',
            'website' => 'https://riftopenair.example.com'
        ]);

        Edicao::create([
            'festival_id' => $riftOpenAir->id,
            'ano' => 2026,
            'local' => 'Porto',
            'data_inicio' => '2026-05-25',
            'duracao' => 3
        ]);

        // 6. Seed Sets
        Set::create([
            'dj_id' => 1,
            'festival_id' => 1,
            'data' => '2026-05-24',
            'hora_inicio' => '22:30',
            'avaliacao' => 9.4
        ]);

        Set::create([
            'dj_id' => 2,
            'festival_id' => 2,
            'data' => '2026-05-25',
            'hora_inicio' => '01:00',
            'avaliacao' => 8.8
        ]);

        Set::create([
            'dj_id' => 1,
            'festival_id' => 2,
            'data' => '2026-05-26',
            'hora_inicio' => '19:45',
            'avaliacao' => 9.1
        ]);

        Set::create([
            'dj_id' => 2,
            'festival_id' => 1,
            'data' => '2026-05-27',
            'hora_inicio' => '23:15',
            'avaliacao' => 8.5
        ]);
    }
}
