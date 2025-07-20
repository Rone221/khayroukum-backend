<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_and_login(): void
    {
        $response = $this->postJson('/api/register', [
            'prenom' => 'John',
            'nom' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'secret123',
            'role' => 'donateur',
        ]);
        $response->assertStatus(201);

        $response = $this->postJson('/api/login', [
            'email' => 'john@example.com',
            'password' => 'secret123',
        ]);
        $response->assertStatus(200)->assertJsonStructure(['token']);
    }
}
