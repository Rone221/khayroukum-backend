<?php

namespace Tests\Feature;

use App\Models\{User,Village,Projet};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProjetTest extends TestCase
{
    use RefreshDatabase;

    private function createRoles(): void
    {
        foreach (['administrateur','prestataire','donateur'] as $role) {
            Role::firstOrCreate(['name' => $role]);
        }
    }

    public function test_admin_valide_projet(): void
    {
        $this->createRoles();
        $admin = User::factory()->create(['role' => 'administrateur']);
        $admin->assignRole('administrateur');
        $presta = User::factory()->create(['role' => 'prestataire']);
        $presta->assignRole('prestataire');

        $village = Village::factory()->create(['created_by' => $presta->id]);
        $projet = Projet::factory()->for($village)->create(['created_by' => $presta->id]);

        $response = $this->actingAs($admin, 'sanctum')->patchJson("/api/projets/{$projet->id}/valider");
        $response->assertStatus(200)->assertJson(['statut' => 'valide']);
    }
}
