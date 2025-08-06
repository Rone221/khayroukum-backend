<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminUserController extends Controller
{
    /**
     * Récupérer tous les utilisateurs avec leurs statistiques
     */
    public function index(): JsonResponse
    {
        try {
            $users = User::with(['villages', 'projets'])
                ->select([
                    'id',
                    'prenom',
                    'nom',
                    'email',
                    'role',
                    'email_verified_at',
                    'created_at',
                    'updated_at'
                ])
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'prenom' => $user->prenom,
                        'nom' => $user->nom,
                        'email' => $user->email,
                        'role' => $user->role,
                        'is_verified' => !is_null($user->email_verified_at),
                        'created_at' => $user->created_at->toISOString(),
                        'updated_at' => $user->updated_at->toISOString(),
                        'village_count' => $user->villages ? $user->villages->count() : 0,
                        'project_count' => $user->projets ? $user->projets->count() : 0,
                        'contribution_count' => $user->role === 'donateur' ?
                            $this->getUserContributionCount($user->id) : 0,
                        'total_contributions' => $user->role === 'donateur' ?
                            $this->getUserTotalContributions($user->id) : 0,
                    ];
                });

            return response()->json($users);
        } catch (\Exception $e) {
            Log::error('AdminUserController@index error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des utilisateurs',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer un utilisateur spécifique avec ses détails
     */
    public function show(string $id): JsonResponse
    {
        try {
            $user = User::with(['villages', 'projets'])->findOrFail($id);

            $userData = [
                'id' => $user->id,
                'prenom' => $user->prenom,
                'nom' => $user->nom,
                'email' => $user->email,
                'role' => $user->role,
                'is_verified' => !is_null($user->email_verified_at),
                'created_at' => $user->created_at->toISOString(),
                'updated_at' => $user->updated_at->toISOString(),
                'villages' => $user->villages ? $user->villages->map(function ($village) {
                    return [
                        'id' => $village->id,
                        'nom' => $village->nom ?? 'Village sans nom',
                        'region' => $village->region ?? 'Région non spécifiée',
                        'created_at' => $village->created_at->toISOString(),
                    ];
                }) : [],
                'projets' => $user->projets ? $user->projets->map(function ($projet) {
                    return [
                        'id' => $projet->id,
                        'titre' => $projet->titre ?? 'Projet sans titre',
                        'statut' => $projet->statut ?? 'pending',
                        'montant_cible' => $projet->montant_total ?? 0,
                        'created_at' => $projet->created_at->toISOString(),
                    ];
                }) : [],
            ];

            return response()->json($userData);
        } catch (\Exception $e) {
            Log::error('AdminUserController@show error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Utilisateur non trouvé',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Basculer le statut de vérification d'un utilisateur
     */
    public function toggleVerification(string $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            if ($user->email_verified_at) {
                $user->email_verified_at = null;
                $message = 'Utilisateur dé-vérifié avec succès';
            } else {
                $user->email_verified_at = now();
                $message = 'Utilisateur vérifié avec succès';
            }

            $user->save();

            return response()->json([
                'message' => $message,
                'is_verified' => !is_null($user->email_verified_at)
            ]);
        } catch (\Exception $e) {
            Log::error('AdminUserController@toggleVerification error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la modification du statut de vérification',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bannir un utilisateur (soft delete)
     */
    public function banUser(string $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            // Empêcher de bannir les administrateurs
            if ($user->role === 'administrateur') {
                return response()->json([
                    'error' => 'Impossible de bannir un administrateur'
                ], 403);
            }

            // Soft delete de l'utilisateur
            $user->delete();

            return response()->json([
                'message' => 'Utilisateur banni avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('AdminUserController@banUser error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors du bannissement de l\'utilisateur',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Réactiver un utilisateur banni
     */
    public function unbanUser(string $id): JsonResponse
    {
        try {
            $user = User::withTrashed()->findOrFail($id);
            $user->restore();

            return response()->json([
                'message' => 'Utilisateur réactivé avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('AdminUserController@unbanUser error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la réactivation de l\'utilisateur',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Changer le rôle d'un utilisateur
     */
    public function changeRole(string $id, Request $request): JsonResponse
    {
        try {
            $request->validate([
                'role' => 'required|in:administrateur,prestataire,donateur'
            ]);

            $user = User::findOrFail($id);
            $user->role = $request->role;
            $user->save();

            return response()->json([
                'message' => 'Rôle modifié avec succès',
                'user' => [
                    'id' => $user->id,
                    'role' => $user->role
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('AdminUserController@changeRole error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la modification du rôle',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir le nombre de contributions d'un donateur
     */
    private function getUserContributionCount(string $userId): int
    {
        // TODO: Implémenter quand la table des contributions sera créée
        return rand(0, 10); // Valeur temporaire pour la démonstration
    }

    /**
     * Obtenir le montant total des contributions d'un donateur
     */
    private function getUserTotalContributions(string $userId): int
    {
        // TODO: Implémenter quand la table des contributions sera créée
        return rand(1000, 50000); // Valeur temporaire pour la démonstration
    }
}
