<?php

namespace Tests\Feature;

use App\Models\{Projet, User, Video, Village};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VideoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        foreach (['administrateur', 'prestataire', 'donateur'] as $role) {
            Role::firstOrCreate(['name' => $role]);
        }
        config([
            'services.moneyprinter.url' => 'http://mpt.test',
            'services.moneyprinter.api_key' => 'secret',
            'services.moneyprinter.disk' => 'local',
        ]);
        Storage::fake('local');
    }

    private function user(string $role): User
    {
        $user = User::factory()->create(['role' => $role]);
        $user->assignRole($role);

        return $user;
    }

    public function test_prestataire_lance_une_video_depuis_son_projet(): void
    {
        Http::fake(['mpt.test/api/v1/videos' => Http::response(['status' => 200, 'data' => ['task_id' => 'task-1']])]);

        $presta = $this->user('prestataire');
        $village = Village::factory()->create(['created_by' => $presta->id]);
        $projet = Projet::factory()->for($village)->create(['created_by' => $presta->id, 'titre' => 'Forage à Ndiaye']);

        $this->actingAs($presta, 'sanctum')
            ->postJson('/api/videos', ['projet_id' => $projet->id, 'format' => '16:9'])
            ->assertStatus(202)
            ->assertJson(['statut' => 'en_cours', 'progression' => 0, 'projetId' => $projet->id, 'format' => '16:9']);

        $this->assertDatabaseHas('videos', ['task_id' => 'task-1', 'user_id' => $presta->id]);
        Http::assertSent(fn (Request $r) => $r->hasHeader('x-api-key', 'secret')
            && str_starts_with($r['video_subject'], 'Forage à Ndiaye')
            && $r['video_aspect'] === '16:9');
    }

    public function test_prestataire_ne_peut_pas_utiliser_le_projet_d_un_autre(): void
    {
        Http::fake();
        $owner = $this->user('prestataire');
        $other = $this->user('prestataire');
        $village = Village::factory()->create(['created_by' => $owner->id]);
        $projet = Projet::factory()->for($village)->create(['created_by' => $owner->id]);

        $this->actingAs($other, 'sanctum')
            ->postJson('/api/videos', ['projet_id' => $projet->id])
            ->assertStatus(403);
        Http::assertNothingSent();
    }

    public function test_donateur_n_a_pas_acces(): void
    {
        $this->actingAs($this->user('donateur'), 'sanctum')
            ->postJson('/api/videos', ['sujet' => 'Test'])
            ->assertStatus(403);
    }

    public function test_erreur_du_service_renvoie_502(): void
    {
        Http::fake(['mpt.test/*' => Http::response(['status' => 429, 'message' => 'queue full'], 429)]);

        $this->actingAs($this->user('administrateur'), 'sanctum')
            ->postJson('/api/videos', ['sujet' => "L'eau potable au village"])
            ->assertStatus(502);
        $this->assertDatabaseCount('videos', 0);
    }

    public function test_video_terminee_est_rapatriee_et_telechargeable(): void
    {
        $presta = $this->user('prestataire');
        $video = Video::create(['user_id' => $presta->id, 'task_id' => 'task-9', 'sujet' => 'Puits', 'statut' => 'en_cours']);

        Http::fake([
            'mpt.test/api/v1/tasks/task-9' => Http::response(['status' => 200, 'data' => [
                'state' => 1, 'progress' => 100, 'script' => 'Le script',
                'videos' => ['http://autre-hote:8080/tasks/task-9/final-1.mp4'],
                'combined_videos' => ['http://autre-hote:8080/tasks/task-9/combined-1.mp4'],
            ]]),
            'mpt.test/tasks/task-9/final-1.mp4' => Http::response('FINAL'),
            'mpt.test/tasks/task-9/combined-1.mp4' => Http::response('INTERMEDIAIRE'),
        ]);

        $this->actingAs($presta, 'sanctum')
            ->getJson("/api/videos/{$video->id}")
            ->assertOk()
            ->assertJson(['statut' => 'termine', 'progression' => 100, 'script' => 'Le script']);

        // C'est bien le rendu final (avec voix et sous-titres) qui est conservé.
        $this->assertSame('FINAL', Storage::disk('local')->get("videos/{$video->id}.mp4"));

        $this->actingAs($presta, 'sanctum')
            ->get("/api/videos/{$video->id}/download")
            ->assertOk()
            ->assertHeader('content-type', 'video/mp4');
    }

    public function test_echec_de_generation(): void
    {
        $presta = $this->user('prestataire');
        $video = Video::create(['user_id' => $presta->id, 'task_id' => 'task-x', 'sujet' => 'X', 'statut' => 'en_cours']);
        Http::fake(['mpt.test/api/v1/tasks/task-x' => Http::response(['status' => 200, 'data' => ['state' => -1, 'progress' => 30, 'error' => 'Pexels key missing']])]);

        $this->actingAs($presta, 'sanctum')
            ->getJson("/api/videos/{$video->id}")
            ->assertJson(['statut' => 'echec', 'erreur' => 'Pexels key missing']);
    }

    public function test_un_prestataire_ne_voit_pas_les_videos_des_autres(): void
    {
        Http::fake();
        $a = $this->user('prestataire');
        $b = $this->user('prestataire');
        $video = Video::create(['user_id' => $a->id, 'task_id' => 't', 'sujet' => 'A', 'statut' => 'termine']);

        $this->actingAs($b, 'sanctum')->getJson("/api/videos/{$video->id}")->assertStatus(403);
        $this->actingAs($b, 'sanctum')->getJson('/api/videos')->assertOk()->assertJsonCount(0);
        $this->actingAs($this->user('administrateur'), 'sanctum')->getJson('/api/videos')->assertJsonCount(1);
    }
}
