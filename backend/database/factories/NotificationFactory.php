<?php

namespace Database\Factories;

use App\Models\Notification;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition()
    {
        return [
            'type' => $this->faker->randomElement(['validation', 'nouveau_projet', 'offre_financement']),
            'notifiable_id' => 1, // à surcharger dans le seeder
            'notifiable_type' => 'App\\Models\\User',
            'data' => [
                'message' => $this->faker->sentence,
            ],
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
