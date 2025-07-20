<?php

namespace Tests\Feature;

use App\Models\{User,Village,Projet,OffreFinancement};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class OffreFinancementTest extends TestCase
{
    use RefreshDatabase;

    private function createRoles(): void
    {
        foreach (['administrateur','prestataire','donateur'] as $role) {
            Role::firstOrCreate(['name' => $role]);
        }
    }

    public function test_donateur_verifie_peut_financer_projet_valide(): void
    {
        $this->createRoles();
        $donateur = User::factory()->create(['role' => 'donateur', 'is_verified' => true]);
        $donateur->assignRole('donateur');
        $presta = User::factory()->create(['role' => 'prestataire']);
        $presta->assignRole('prestataire');
        $admin = User::factory()->create(['role' => 'administrateur']);
        $admin->assignRole('administrateur');

        $village = Village::factory()->create(['created_by' => $presta->id]);
        $projet = Projet::factory()->for($village)->create([
            'created_by' => $presta->id,
            'statut' => 'valide',
            'validated_by' => $admin->id,
        ]);

        $response = $this->actingAs($donateur, 'sanctum')->postJson("/api/projets/{$projet->id}/offres", [
            'montant' => 1000,
            'nom_sur_tableau' => 'Test',
        ]);

        $response->assertStatus(201);
    }

    public function test_donateur_non_verifie_ne_peut_pas_financer(): void
    {
        $this->createRoles();
        $donateur = User::factory()->create(['role' => 'donateur', 'is_verified' => false]);
        $donateur->assignRole('donateur');
        $projet = Projet::factory()->create(['statut' => 'valide']);

        $response = $this->actingAs($donateur, 'sanctum')->postJson("/api/projets/{$projet->id}/offres", [
            'montant' => 1000,
            'nom_sur_tableau' => 'Test',
        ]);

        $response->assertStatus(403);
    }
}
