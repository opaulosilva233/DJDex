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

Artisan::command('user:create', function () {
    $name = \Laravel\Prompts\text(
        label: 'Qual o nome do utilizador?',
        placeholder: 'ex. Paulo Silva',
        required: true
    );

    $email = \Laravel\Prompts\text(
        label: 'Qual o email?',
        placeholder: 'ex. paulosilvaimportante23@gmail.com',
        required: true,
        validate: fn (string $value) => match (true) {
            !filter_var($value, FILTER_VALIDATE_EMAIL) => 'O email introduzido não é válido.',
            \App\Models\User::where('email', $value)->exists() => 'Este email já está registado.',
            default => null,
        }
    );

    $password = \Laravel\Prompts\password(
        label: 'Qual a password?',
        placeholder: 'Introduza a password',
        required: true,
        validate: fn (string $value) => strlen($value) < 8 ? 'A password deve ter pelo menos 8 caracteres.' : null
    );

    $user = \App\Models\User::create([
        'name' => $name,
        'email' => $email,
        'password' => \Illuminate\Support\Facades\Hash::make($password),
    ]);

    $this->info("Utilizador criado com sucesso: {$user->name} ({$user->email})");
})->purpose('Criar um novo utilizador interativamente');

