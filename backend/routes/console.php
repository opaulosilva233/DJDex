<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('make:admin {name} {email} {password}', function ($name, $email, $password) {
    $user = \App\Models\User::create([
        'name' => $name,
        'email' => $email,
        'password' => \Illuminate\Support\Facades\Hash::make($password),
    ]);
    
    $this->info("Utilizador criado com sucesso: {$user->name} ({$user->email})");
})->purpose('Criar um novo utilizador administrador');
