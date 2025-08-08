<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Models\Projet;
use App\Models\DocumentTechnique;

class ProjetDocumentController extends Controller
{
    /**
     * Afficher tous les documents d'un projet
     */
    public function index(Projet $projet)
    {
        // Vérifier que l'utilisateur peut voir ce projet
        $this->authorize('view', $projet);

        $documents = $projet->documents()->orderBy('created_at', 'desc')->get();

        return response()->json($documents);
    }

    /**
     * Ajouter un document à un projet
     */
    public function store(Request $request, Projet $projet)
    {
        // Log pour débogage
        Log::info('=== DÉBUT UPLOAD DOCUMENT ===');
        Log::info('Tentative d\'ajout de document', [
            'user_id' => Auth::id(),
            'user_role' => Auth::user()?->role,
            'projet_id' => $projet->id,
            'projet_created_by' => $projet->created_by
        ]);

        // Vérifier que l'utilisateur peut modifier ce projet
        try {
            $this->authorize('update', $projet);
            Log::info('Autorisation RÉUSSIE pour modifier le projet');
        } catch (\Exception $e) {
            Log::error('Autorisation ÉCHOUÉE: ' . $e->getMessage());
            throw $e;
        }

        Log::info('Données reçues: ' . json_encode($request->all()));

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'type_document' => 'required|in:devis,facture,rapport,photo,autre',
            'fichier' => 'required|file|max:10240', // 10MB max
        ]);

        Log::info('Validation RÉUSSIE');

        try {
            // Stocker le fichier
            $fichier = $request->file('fichier');
            $originalName = $fichier->getClientOriginalName();
            $extension = $fichier->getClientOriginalExtension();
            $fileName = time() . '_' . str_replace(' ', '_', $validated['nom']) . '.' . $extension;

            Log::info('Préparation stockage fichier: ' . $fileName);

            $cheminFichier = $fichier->storeAs('documents/projets/' . $projet->id, $fileName, 'public');

            Log::info('Fichier stocké: ' . $cheminFichier);

            // Créer l'enregistrement en base
            $document = new DocumentTechnique();
            $document->nom = $validated['nom'];
            $document->type_document = $validated['type_document'];
            $document->chemin_fichier = $cheminFichier;
            $document->taille_fichier = $fichier->getSize();
            $document->projet_id = $projet->id;
            $document->uploaded_by = Auth::id();
            $document->save();

            Log::info('Document créé avec succès - ID: ' . $document->id);
            Log::info('=== FIN UPLOAD DOCUMENT ===');

            return response()->json([
                'message' => 'Document ajouté avec succès',
                'document' => $document
            ], 201);
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'ajout du document: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de l\'ajout du document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Télécharger un document
     */
    public function download(DocumentTechnique $document)
    {
        // Vérifier les autorisations
        $this->authorize('view', $document->projet);

        if (!Storage::disk('public')->exists($document->chemin_fichier)) {
            return response()->json(['message' => 'Fichier non trouvé'], 404);
        }

        $path = Storage::disk('public')->path($document->chemin_fichier);
        $name = $document->nom . '.' . pathinfo($document->chemin_fichier, PATHINFO_EXTENSION);

        return response()->download($path, $name);
    }

    /**
     * Supprimer un document
     */
    public function destroy(DocumentTechnique $document)
    {
        // Vérifier les autorisations
        $this->authorize('delete', $document->projet);

        try {
            // Supprimer le fichier du stockage
            if (Storage::disk('public')->exists($document->chemin_fichier)) {
                Storage::disk('public')->delete($document->chemin_fichier);
            }

            // Supprimer l'enregistrement
            $document->delete();

            return response()->json(['message' => 'Document supprimé avec succès']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
