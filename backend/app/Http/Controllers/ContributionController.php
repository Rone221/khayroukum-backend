<?php

namespace App\Http\Controllers;

use App\Models\OffreFinancement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContributionController extends Controller
{
    /**
     * Get all contributions for the authenticated donateur
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'donateur') {
                return response()->json([
                    'error' => 'Accès non autorisé'
                ], 403);
            }

            $contributions = OffreFinancement::with(['projet.village'])
                ->where('donateur_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($offre) {
                    return [
                        'id' => $offre->id,
                        'donatorId' => $offre->donateur_id,
                        'donatorName' => $offre->nom_sur_tableau,
                        'projectId' => $offre->projet_id,
                        'projectTitle' => $offre->projet ? $offre->projet->titre : 'Projet supprimé',
                        'amount' => $offre->montant,
                        'createdAt' => $offre->created_at->toISOString(),
                        'status' => 'confirmed', // Toutes les offres sont confirmées par défaut
                        'message' => $offre->message,
                        'peopleHelped' => rand(10, 100) // Estimation temporaire
                    ];
                });

            return response()->json($contributions);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des contributions: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Erreur lors de la récupération des contributions'
            ], 500);
        }
    }

    /**
     * Get contributions stats for the authenticated donateur
     */
    public function myContributions()
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'donateur') {
                return response()->json([
                    'error' => 'Accès non autorisé'
                ], 403);
            }

            $contributions = OffreFinancement::with(['projet'])
                ->where('donateur_id', $user->id)
                ->get();

            $data = $contributions->map(function ($offre) {
                return [
                    'id' => $offre->id,
                    'donatorId' => $offre->donateur_id,
                    'donatorName' => $offre->nom_sur_tableau,
                    'projectId' => $offre->projet_id,
                    'projectTitle' => $offre->projet ? $offre->projet->titre : 'Projet supprimé',
                    'amount' => $offre->montant,
                    'createdAt' => $offre->created_at->toISOString(),
                    'status' => 'confirmed'
                ];
            });

            return response()->json($data);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des contributions utilisateur: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Erreur lors de la récupération des contributions'
            ], 500);
        }
    }

    /**
     * Get stats for the authenticated donateur
     */
    public function myStats()
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'donateur') {
                return response()->json([
                    'error' => 'Accès non autorisé'
                ], 403);
            }

            $contributions = OffreFinancement::where('donateur_id', $user->id)->get();
            
            $stats = [
                'myContributions' => $contributions->count(),
                'totalDonated' => $contributions->sum('montant'),
                'projectsSupported' => $contributions->pluck('projet_id')->unique()->count(),
                'impactedPeople' => $contributions->count() * 25, // Estimation: 25 personnes par contribution
                'availableProjects' => 0 // Sera mis à jour par le frontend
            ];

            return response()->json($stats);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des stats donateur: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Erreur lors de la récupération des statistiques'
            ], 500);
        }
    }
}