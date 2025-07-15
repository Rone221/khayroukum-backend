<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VillageTest extends TestCase
{
    use RefreshDatabase;

    private function createRoles(): void
    {
        foreach (['administrateur','prestataire','donateur'] as $role) {
            Role::firstOrCreate(['name' => $role]);
        }
    }

    public function test_prestataire_peut_creer_village(): void
    {
        $this->createRoles();
        $user = User::factory()->create(['role' => 'prestataire']);
        $user->assignRole('prestataire');

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/villages', [
            'nom' => 'Village Test',
            'region' => 'Region',
        ]);

        $response->assertStatus(201);
    }

    public function test_donateur_ne_peut_pas_creer_village(): void
    {
        $this->createRoles();
        $user = User::factory()->create(['role' => 'donateur']);
        $user->assignRole('donateur');

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/villages', [
            'nom' => 'Village Test',
            'region' => 'Region',
        ]);

        $response->assertStatus(403);
    }
}
