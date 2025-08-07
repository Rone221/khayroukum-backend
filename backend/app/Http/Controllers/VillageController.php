<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Village;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class VillageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $villages = Village::all();

        // Transformer les données pour correspondre au format frontend
        $transformedVillages = $villages->map(function ($village) {
            return [
                'id' => $village->id,
                'nom' => $village->nom,
                'name' => $village->nom, // Alias pour compatibilité
                'region' => $village->region,
                'departement' => $village->departement,
                'commune' => $village->commune,
                'population' => $village->population,
                'coordinates' => $village->coordonnees ? [
                    'lat' => $village->coordonnees['lat'] ?? null,
                    'lng' => $village->coordonnees['lng'] ?? null,
                ] : null,
                'latitude' => $village->coordonnees['lat'] ?? null,
                'longitude' => $village->coordonnees['lng'] ?? null,
                'statut' => $village->statut,
                'description' => $village->description,
                'photo' => $village->photo,
                'telephone' => $village->telephone,
                'created_by' => $village->created_by,
                'created_at' => $village->created_at,
                'updated_at' => $village->updated_at,
            ];
        });

        return response()->json($transformedVillages);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required',
            'region' => 'required',
            'localisation_gps' => 'nullable',
            'description' => 'nullable',
            'prioritaire' => 'boolean',
        ]);

        $data['created_by'] = Auth::id();

        $village = Village::create($data);

        return response()->json($village, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $village = Village::findOrFail($id);

        // Transformer les données pour correspondre au format frontend
        $transformedVillage = [
            'id' => $village->id,
            'nom' => $village->nom,
            'region' => $village->region,
            'departement' => $village->departement,
            'commune' => $village->commune,
            'population' => $village->population,
            'latitude' => $village->coordonnees['lat'] ?? null,
            'longitude' => $village->coordonnees['lng'] ?? null,
            'statut' => $village->statut,
            'description' => $village->description,
            'photo' => $village->photo,
            'telephone' => $village->telephone ?? null,
            'date_creation' => $village->created_at->toISOString(),
            'created_by' => $village->created_by,
            'created_at' => $village->created_at,
            'updated_at' => $village->updated_at,
        ];

        return response()->json(['data' => $transformedVillage]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $village = Village::findOrFail($id);

        // Vérifier si l'utilisateur est autorisé à modifier ce village
        if ($village->created_by !== Auth::id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $data = $request->validate([
            'nom' => 'sometimes|required|string',
            'region' => 'sometimes|required|string',
            'departement' => 'sometimes|nullable|string',
            'commune' => 'sometimes|nullable|string',
            'population' => 'sometimes|nullable|integer',
            'coordonnees' => 'sometimes|nullable|array',
            'coordonnees.lat' => 'sometimes|nullable|numeric',
            'coordonnees.lng' => 'sometimes|nullable|numeric',
            'photo' => 'sometimes|nullable|string',
            'telephone' => 'sometimes|nullable|string',
            'description' => 'sometimes|nullable|string',
            'statut' => 'sometimes|in:actif,inactif',
        ]);

        $village->update($data);

        return response()->json(['data' => $village, 'message' => 'Village mis à jour avec succès']);
    }

    /**
     * Get villages for the authenticated user
     */
    public function userVillages()
    {
        $user = Auth::user();
        $villages = Village::where('created_by', $user->id)->get();

        // Transformer les données pour correspondre au format frontend
        $transformedVillages = $villages->map(function ($village) {
            return [
                'id' => $village->id,
                'nom' => $village->nom,
                'name' => $village->nom, // Alias pour compatibilité
                'region' => $village->region,
                'departement' => $village->departement,
                'commune' => $village->commune,
                'population' => $village->population,
                'coordinates' => $village->coordonnees ? [
                    'lat' => $village->coordonnees['lat'] ?? null,
                    'lng' => $village->coordonnees['lng'] ?? null,
                ] : null,
                'latitude' => $village->coordonnees['lat'] ?? null,
                'longitude' => $village->coordonnees['lng'] ?? null,
                'statut' => $village->statut,
                'description' => $village->description,
                'photo' => $village->photo,
                'telephone' => $village->telephone,
                'chef_village' => $village->chef_village,
                'created_by' => $village->created_by,
                'created_at' => $village->created_at,
                'updated_at' => $village->updated_at,
            ];
        });

        return response()->json($transformedVillages);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Log::info('Tentative de suppression du village', ['id' => $id, 'user_id' => Auth::id()]);

        try {
            $village = Village::findOrFail($id);

            Log::info('Village trouvé', ['village' => $village->toArray()]);

            // Vérifier si l'utilisateur est autorisé à supprimer ce village
            if ($village->created_by !== Auth::id()) {
                Log::warning('Utilisateur non autorisé', ['village_created_by' => $village->created_by, 'user_id' => Auth::id()]);
                return response()->json(['error' => 'Non autorisé'], 403);
            }

            // Supprimer toutes les dépendances en cascade
            foreach ($village->projets as $projet) {
                Log::info('Suppression des dépendances du projet', ['projet_id' => $projet->id]);

                // Supprimer les documents techniques
                $projet->documents()->delete();

                // Supprimer les offres de financement
                $projet->offres()->delete();

                // Supprimer le projet
                $projet->delete();
            }

            // Supprimer le village
            $village->delete();

            Log::info('Village supprimé avec succès', ['id' => $id]);
            return response()->json(['message' => 'Village supprimé avec succès'], 200);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la suppression', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Erreur lors de la suppression: ' . $e->getMessage()], 500);
        }
    }
}
