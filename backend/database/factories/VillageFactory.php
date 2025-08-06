<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class VillageFactory extends Factory
{
    public function definition(): array
    {
        $gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        ];

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
            'photo' => $this->faker->randomElement($gradients),
            'description' => $this->faker->sentence(),
            'statut' => 'actif',
            'telephone' => $this->faker->optional()->phoneNumber(),
            'created_by' => User::factory(),
        ];
    }
}
