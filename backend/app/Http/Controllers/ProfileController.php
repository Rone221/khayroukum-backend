<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /**
     * Get user profile information
     */
    public function show()
    {
        $user = Auth::user();
        
        // Calculer les statistiques selon le rôle
        $stats = $this->getUserStats($user);
        
        return response()->json([
            'user' => $user,
            'stats' => $stats
        ]);
    }

    /**
     * Update user profile
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        
        try {
            $data = $request->validate([
                'prenom' => 'sometimes|string|max:255',
                'nom' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'telephone' => 'sometimes|nullable|string|max:20',
                'adresse' => 'sometimes|nullable|string|max:255',
                'date_naissance' => 'sometimes|nullable|date',
                'profession' => 'sometimes|nullable|string|max:255',
                'bio' => 'sometimes|nullable|string|max:1000',
            ]);

            $user->update($data);

            return response()->json([
                'message' => 'Profil mis à jour avec succès',
                'user' => $user->fresh()
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Update user password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if (!Hash::check($request->current_password, Auth::user()->password)) {
            return response()->json([
                'message' => 'Le mot de passe actuel est incorrect'
            ], 422);
        }

        Auth::user()->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'message' => 'Mot de passe mis à jour avec succès'
        ]);
    }

    /**
     * Get user activity
     */
    public function activity()
    {
        $user = Auth::user();
        $activities = [];

        // Activités selon le rôle
        switch ($user->role) {
            case 'administrateur':
                // Projets validés récemment
                $projetsValides = $user->projetsValides()->latest()->take(5)->get();
                foreach ($projetsValides as $projet) {
                    $activities[] = [
                        'type' => 'Validation',
                        'detail' => 'Projet "' . $projet->titre . '" validé',
                        'date' => $projet->updated_at->diffForHumans(),
                        'color' => 'green'
                    ];
                }
                break;

            case 'prestataire':
                // Projets créés
                $projets = $user->projets()->latest()->take(5)->get();
                foreach ($projets as $projet) {
                    $activities[] = [
                        'type' => 'Projet',
                        'detail' => 'Projet "' . $projet->titre . '" créé',
                        'date' => $projet->created_at->diffForHumans(),
                        'color' => 'blue'
                    ];
                }
                break;

            case 'donateur':
                // Offres de financement
                $offres = $user->offres()->latest()->take(5)->get();
                foreach ($offres as $offre) {
                    $activities[] = [
                        'type' => 'Don',
                        'detail' => number_format($offre->montant, 0, ',', ' ') . ' FCFA pour "' . $offre->projet->titre . '"',
                        'date' => $offre->created_at->diffForHumans(),
                        'color' => 'yellow'
                    ];
                }
                break;
        }

        return response()->json($activities);
    }

    /**
     * Calculate user statistics based on role
     */
    private function getUserStats($user)
    {
        switch ($user->role) {
            case 'administrateur':
                return [
                    [
                        'label' => 'Projets validés',
                        'value' => $user->projetsValides()->count(),
                        'color' => 'green'
                    ],
                    [
                        'label' => 'Projets en attente',
                        'value' => \App\Models\Projet::where('statut', 'en_attente')->count(),
                        'color' => 'yellow'
                    ],
                    [
                        'label' => 'Utilisateurs totaux',
                        'value' => \App\Models\User::count(),
                        'color' => 'blue'
                    ],
                    [
                        'label' => 'Villages enregistrés',
                        'value' => \App\Models\Village::count(),
                        'color' => 'purple'
                    ]
                ];

            case 'prestataire':
                $projets = $user->projets();
                return [
                    [
                        'label' => 'Projets créés',
                        'value' => $projets->count(),
                        'color' => 'blue'
                    ],
                    [
                        'label' => 'Projets validés',
                        'value' => $projets->where('statut', 'valide')->count(),
                        'color' => 'green'
                    ],
                    [
                        'label' => 'En attente',
                        'value' => $projets->where('statut', 'en_attente')->count(),
                        'color' => 'yellow'
                    ],
                    [
                        'label' => 'Villages couverts',
                        'value' => $user->villages()->count(),
                        'color' => 'purple'
                    ]
                ];

            case 'donateur':
                $offres = $user->offres();
                return [
                    [
                        'label' => 'Projets financés',
                        'value' => $offres->distinct('projet_id')->count(),
                        'color' => 'blue'
                    ],
                    [
                        'label' => 'Montant total donné',
                        'value' => number_format($offres->sum('montant'), 0, ',', ' ') . ' FCFA',
                        'color' => 'green'
                    ],
                    [
                        'label' => 'Offres actives',
                        'value' => $offres->count(),
                        'color' => 'yellow'
                    ],
                    [
                        'label' => 'Projets suivis',
                        'value' => $offres->distinct('projet_id')->count(),
                        'color' => 'purple'
                    ]
                ];

            default:
                return [];
        }
    }
}
