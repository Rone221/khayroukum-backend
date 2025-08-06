<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class PrestataireDashboardController extends Controller
{
    public function stats()
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'prestataire') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $projets = \App\Models\Projet::where('created_by', $user->id)->with(['village', 'documents'])->get();
        $villages = \App\Models\Village::where('created_by', $user->id)->get();

        // Calculer les statistiques
        $stats = [
            'totalProjects' => $projets->count(),
            'pendingProjects' => $projets->where('statut', 'en_attente')->count(),
            'approvedProjects' => $projets->whereIn('statut', ['valide', 'termine'])->count(),
            'totalFunding' => $projets->sum('montant_total'),
            'totalVillages' => $villages->count(),
        ];

        // Projets récents (3 derniers)
        $recentProjects = $projets->sortByDesc('created_at')->take(3)->values()->map(function ($project) {
            return [
                'id' => $project->id,
                'title' => $project->titre,
                'description' => $project->description,
                'status' => $this->mapStatusToEnglish($project->statut),
                'targetAmount' => $project->montant_total,
                'currentAmount' => $project->montant_total, // Pour l'instant, on suppose que c'est le même
                'village' => [
                    'id' => $project->village->id,
                    'name' => $project->village->nom,
                    'region' => $project->village->region,
                    'population' => $project->village->population,
                ],
                'created_at' => $project->created_at,
                'updated_at' => $project->updated_at,
            ];
        });

        return response()->json([
            'stats' => $stats,
            'recentProjects' => $recentProjects,
        ]);
    }

    public function activity()
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'prestataire') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $activities = [];

        // Activités des projets récents
        $recentProjects = \App\Models\Projet::where('created_by', $user->id)
            ->where('updated_at', '>=', Carbon::now()->subDays(30))
            ->orderBy('updated_at', 'desc')
            ->take(5)
            ->get();

        foreach ($recentProjects as $project) {
            $activities[] = [
                'type' => 'project_update',
                'title' => 'Projet mis à jour',
                'description' => $project->titre,
                'time' => $project->updated_at->diffForHumans(),
                'timestamp' => $project->updated_at->timestamp,
                'status' => $project->statut,
                'color' => $this->getStatusColor($project->statut)
            ];
        }

        // Activités des documents récents
        $recentDocuments = \App\Models\DocumentTechnique::where('uploaded_by', $user->id)
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get();

        foreach ($recentDocuments as $document) {
            $activities[] = [
                'type' => 'document_upload',
                'title' => 'Document téléchargé',
                'description' => 'Document ' . ucfirst($document->type),
                'time' => $document->created_at->diffForHumans(),
                'timestamp' => $document->created_at->timestamp,
                'color' => 'blue'
            ];
        }

        // Activités des villages récents
        $recentVillages = \App\Models\Village::where('created_by', $user->id)
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get();

        foreach ($recentVillages as $village) {
            $activities[] = [
                'type' => 'village_created',
                'title' => 'Nouveau village ajouté',
                'description' => $village->nom,
                'time' => $village->created_at->diffForHumans(),
                'timestamp' => $village->created_at->timestamp,
                'color' => 'purple'
            ];
        }

        // Trier par timestamp (plus récent en premier)
        usort($activities, function ($a, $b) {
            return $b['timestamp'] - $a['timestamp'];
        });

        // Supprimer le timestamp avant de retourner
        $activities = array_map(function ($activity) {
            unset($activity['timestamp']);
            return $activity;
        }, $activities);

        return response()->json([
            'activities' => array_slice($activities, 0, 10)
        ]);
    }

    private function getStatusColor($status)
    {
        switch ($status) {
            case 'valide':
            case 'termine':
                return 'green';
            case 'en_attente':
                return 'orange';
            case 'en_cours':
                return 'blue';
            default:
                return 'gray';
        }
    }

    private function mapStatusToEnglish($status)
    {
        switch ($status) {
            case 'en_attente':
                return 'pending';
            case 'en_cours':
                return 'in_progress';
            case 'valide':
                return 'validated';
            case 'termine':
                return 'completed';
            default:
                return 'pending';
        }
    }
}
