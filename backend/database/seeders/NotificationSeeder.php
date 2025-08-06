<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer tous les utilisateurs
        $users = User::all();

        foreach ($users as $user) {
            // Créer 3-5 notifications par utilisateur
            $notificationCount = rand(3, 5);

            for ($i = 0; $i < $notificationCount; $i++) {
                $notifications = [
                    [
                        'title' => 'Nouveau projet validé',
                        'message' => 'Le projet "Forage au village de Keur Moussa" a été validé par l\'administration.',
                        'type' => 'success'
                    ],
                    [
                        'title' => 'Document technique ajouté',
                        'message' => 'Un nouveau document technique a été ajouté à votre projet.',
                        'type' => 'info'
                    ],
                    [
                        'title' => 'Nouvelle offre de financement',
                        'message' => 'Vous avez reçu une nouvelle offre de financement de 500 000 FCFA.',
                        'type' => 'success'
                    ],
                    [
                        'title' => 'Modification requise',
                        'message' => 'Votre projet nécessite des modifications avant validation.',
                        'type' => 'warning'
                    ],
                    [
                        'title' => 'Échéance approche',
                        'message' => 'L\'échéance de votre projet approche. Veuillez mettre à jour le statut.',
                        'type' => 'warning'
                    ],
                    [
                        'title' => 'Bienvenue sur Khayroukum',
                        'message' => 'Bienvenue sur la plateforme Khayroukum ! Découvrez toutes les fonctionnalités disponibles.',
                        'type' => 'info'
                    ]
                ];

                $notification = $notifications[array_rand($notifications)];

                DB::table('notifications')->insert([
                    'id' => Str::uuid(),
                    'type' => 'App\\Notifications\\' . ucfirst($notification['type']) . 'Notification',
                    'notifiable_type' => 'App\\Models\\User',
                    'notifiable_id' => $user->id,
                    'data' => json_encode($notification),
                    'read_at' => $i < 2 ? null : now()->subDays(rand(1, 7)), // Les 2 premières sont non lues
                    'created_at' => now()->subDays(rand(0, 30)),
                    'updated_at' => now()->subDays(rand(0, 30))
                ]);
            }
        }
    }
}
