<?php

namespace Database\Factories;

use App\Models\Projet;
use App\Models\User;
use App\Models\Village;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjetFactory extends Factory
{
    protected $model = Projet::class;

    public function definition(): array
    {
        return [
            'village_id' => Village::factory(),
            'titre' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'statut' => 'en_attente',
            'date_debut' => $this->faker->date(),
            'date_fin' => $this->faker->date(),
            'montant_total' => $this->faker->randomFloat(2, 1000, 100000),
            'created_by' => User::factory(),
            'validated_by' => null,
        ];
    }
}
