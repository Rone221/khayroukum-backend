<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Projet;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Notifications\NouveauProjet;
use App\Notifications\ProjetValide;

class ProjetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $projets = Projet::with(['village', 'creator', 'documents', 'offres'])->get();

        return $projets->map(function ($projet) {
            return [
                'id' => $projet->id,
                'title' => $projet->titre,
                'description' => $projet->description ?? 'Aucune description disponible',
                'village' => [
                    'id' => $projet->village->id ?? null,
                    'name' => $projet->village->nom ?? 'Village inconnu',
                    'region' => $projet->village->region ?? 'Région inconnue',
                    'population' => $projet->village->population ?? 0,
                    'coordinates' => $projet->village->coordonnees ?? ['lat' => 14.0, 'lng' => -14.0],
                ],
                'prestataireId' => $projet->created_by,
                'prestataireName' => ($projet->creator->prenom ?? '') . ' ' . ($projet->creator->nom ?? 'Prestataire inconnu'),
                'targetAmount' => $projet->montant_total ?? 0,
                'currentAmount' => $projet->offres->sum('montant') ?? 0,
                'status' => $this->mapStatus($projet->statut),
                'category' => 'well', // Valeur par défaut
                'estimatedDuration' => 12, // Valeur par défaut
                'documents' => $projet->documents->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'name' => basename($doc->fichier_path),
                        'type' => $doc->type,
                        'url' => $doc->fichier_path,
                        'uploadedAt' => $doc->created_at->toISOString(),
                    ];
                }),
                'createdAt' => $projet->created_at->toISOString(),
                'updatedAt' => $projet->updated_at->toISOString(),
            ];
        });
    }

    private function mapStatus($statut)
    {
        $mapping = [
            'en_attente' => 'pending',
            'valide' => 'validated',
            'en_cours' => 'in_progress',
            'termine' => 'completed',
        ];

        return $mapping[$statut] ?? 'pending';
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'village_id' => 'required|exists:villages,id',
            'titre' => 'required',
            'description' => 'nullable',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'montant_total' => 'numeric',
        ]);
        $data['created_by'] = Auth::id();

        $projet = Projet::create($data);

        // notify admins of new project
        User::role('administrateur')->get()->each(function ($admin) use ($projet) {
            $admin->notify(new NouveauProjet($projet));
        });

        return response()->json($projet, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $projet = Projet::with(['village', 'creator', 'documents', 'offres'])->findOrFail($id);

        return [
            'id' => $projet->id,
            'title' => $projet->titre,
            'description' => $projet->description ?? 'Aucune description disponible',
            'village' => [
                'id' => $projet->village->id ?? null,
                'name' => $projet->village->nom ?? 'Village inconnu',
                'region' => $projet->village->region ?? 'Région inconnue',
                'population' => $projet->village->population ?? 0,
                'coordinates' => $projet->village->coordonnees ?? ['lat' => 14.0, 'lng' => -14.0],
            ],
            'prestataireId' => $projet->created_by,
            'prestataireName' => ($projet->creator->prenom ?? '') . ' ' . ($projet->creator->nom ?? 'Prestataire inconnu'),
            'targetAmount' => $projet->montant_total ?? 0,
            'currentAmount' => $projet->offres->sum('montant') ?? 0,
            'status' => $this->mapStatus($projet->statut),
            'category' => 'well', // Valeur par défaut
            'estimatedDuration' => 12, // Valeur par défaut
            'documents' => $projet->documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'name' => basename($doc->fichier_path),
                    'type' => $doc->type,
                    'url' => $doc->fichier_path,
                    'uploadedAt' => $doc->created_at->toISOString(),
                ];
            }),
            'createdAt' => $projet->created_at->toISOString(),
            'updatedAt' => $projet->updated_at->toISOString(),
        ];
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $projet = Projet::findOrFail($id);
        $projet->update($request->all());
        return $projet;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Projet::findOrFail($id)->delete();
        return response()->noContent();
    }

    public function valider(Projet $projet)
    {
        $this->authorize('validate', $projet);

        $projet->update([
            'statut' => 'valide',
            'validated_by' => Auth::id(),
        ]);

        $projet->creator->notify(new ProjetValide($projet));

        return $projet;
    }
}
