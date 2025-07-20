<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class VillageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nom' => $this->faker->city(),
            'population' => $this->faker->numberBetween(100, 10000),
            'coordonnees' => [
                'lat' => $this->faker->latitude(),
                'lng' => $this->faker->longitude(),
            ],
            'region' => $this->faker->state(),
            'departement' => $this->faker->word(),
            'commune' => $this->faker->word(),
            'photo' => $this->faker->imageUrl(640, 480, 'village', true),
            'description' => $this->faker->sentence(),
            'statut' => 'actif',
            'created_by' => User::factory(),
        ];
    }
}
