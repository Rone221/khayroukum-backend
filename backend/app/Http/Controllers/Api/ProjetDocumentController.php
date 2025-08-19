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
        // Test simple pour voir si on arrive ici
        error_log("=== CONTRÔLEUR INDEX APPELÉ ===");
        error_log("Projet ID: " . $projet->id);
        error_log("User ID: " . auth()->id());
        
        try {
            // Vérifier que l'utilisateur peut voir ce projet
            $this->authorize('view', $projet);
            error_log("Autorisation VIEW réussie");

            $documents = $projet->documents()->orderBy('created_at', 'desc')->get();
            error_log("Documents récupérés: " . $documents->count());
            
            // Formater les documents pour le frontend (comme dans prestataireDocuments)
            $formattedDocuments = $documents->map(function($doc) use ($projet) {
                return [
                    'id' => $doc->id,
                    'name' => $doc->nom,  // Pour compatibilité frontend
                    'nom' => $doc->nom,   // Champ original
                    'type' => $doc->type_document,  // Pour compatibilité frontend
                    'type_document' => $doc->type_document, // Champ original
                    'size' => $this->formatFileSize($doc->taille_fichier), // Pour compatibilité frontend
                    'taille_fichier' => $doc->taille_fichier,
                    'extension' => pathinfo($doc->chemin_fichier, PATHINFO_EXTENSION), // Extension réelle
                    'projectName' => $projet->titre,
                    'projet' => [
                        'id' => $projet->id,
                        'titre' => $projet->titre
                    ],
                    'status' => $doc->status,
                    'rejection_reason' => $doc->rejection_reason,
                    'reviewed_by' => $doc->reviewer ? $doc->reviewer->name : null,
                    'reviewed_at' => $doc->reviewed_at ? $doc->reviewed_at->toISOString() : null,
                    'url' => url('/api/documents/' . $doc->id . '/download'), // URL sécurisée
                    'created_at' => $doc->created_at->toISOString(),
                ];
            });
            
            error_log("Documents formatés pour le frontend: " . $formattedDocuments->count());
            error_log("=== FIN INDEX DOCUMENTS ===");
            
            return response()->json([
                'data' => $formattedDocuments,
                'total' => $formattedDocuments->count()
            ]);
        } catch (\Exception $e) {
            error_log("Erreur dans index: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Ajouter un document à un projet
     */
    public function store(Request $request, Projet $projet)
    {
        // Test simple pour voir si on arrive ici
        error_log("=== CONTRÔLEUR STORE APPELÉ ===");
        error_log("Projet ID: " . $projet->id);
        error_log("User ID: " . auth()->id());

        try {
            // Vérifier que l'utilisateur peut modifier ce projet
            $this->authorize('update', $projet);
            error_log("Autorisation RÉUSSIE pour modifier le projet");

            error_log("Données reçues: " . json_encode($request->all()));

            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'type_document' => 'required|in:devis,facture,rapport,photo,autre',
                'fichier' => 'required|file|max:10240', // 10MB max
            ]);

            error_log("Validation RÉUSSIE");

            // Stocker le fichier
            $fichier = $request->file('fichier');
            $originalName = $fichier->getClientOriginalName();
            $extension = $fichier->getClientOriginalExtension();
            $fileName = time() . '_' . str_replace(' ', '_', $validated['nom']) . '.' . $extension;

            error_log("Préparation stockage fichier: " . $fileName);

            $cheminFichier = $fichier->storeAs('documents/projets/' . $projet->id, $fileName, 'public');

            error_log("Fichier stocké: " . $cheminFichier);

            // Créer l'enregistrement en base
            $document = new DocumentTechnique();
            $document->nom = $validated['nom'];
            $document->type_document = $validated['type_document'];
            $document->chemin_fichier = $cheminFichier;
            $document->taille_fichier = $fichier->getSize();
            $document->projet_id = $projet->id;
            $document->uploaded_by = auth()->id();
            $document->save();

            error_log("Document créé avec succès - ID: " . $document->id);
            error_log("=== FIN UPLOAD DOCUMENT ===");

            return response()->json([
                'message' => 'Document ajouté avec succès',
                'document' => $document
            ], 201);
        } catch (\Exception $e) {
            error_log("Erreur lors de l'ajout du document: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
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
        error_log("=== TÉLÉCHARGEMENT DOCUMENT ===");
        error_log("Document ID: " . $document->id);
        error_log("Document nom: " . $document->nom);
        error_log("Chemin fichier: " . $document->chemin_fichier);
        
        // Vérifier les autorisations
        $this->authorize('view', $document->projet);

        if (!Storage::disk('public')->exists($document->chemin_fichier)) {
            error_log("Fichier non trouvé: " . $document->chemin_fichier);
            return response()->json(['message' => 'Fichier non trouvé'], 404);
        }

        $path = Storage::disk('public')->path($document->chemin_fichier);
        
        // Récupérer l'extension du fichier original stocké
        $extension = pathinfo($document->chemin_fichier, PATHINFO_EXTENSION);
        error_log("Extension détectée: " . $extension);
        
        // Utiliser le nom original avec la bonne extension
        $downloadName = $document->nom . '.' . $extension;
        error_log("Nom de téléchargement: " . $downloadName);
        
        // Définir le bon Content-Type en fonction de l'extension
        $mimeTypes = [
            // Documents PDF
            'pdf' => 'application/pdf',
            
            // Documents Microsoft Office
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt' => 'application/vnd.ms-powerpoint',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            
            // Images
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'bmp' => 'image/bmp',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            
            // Texte et documents
            'txt' => 'text/plain',
            'csv' => 'text/csv',
            'json' => 'application/json',
            'xml' => 'application/xml',
            'html' => 'text/html',
            'md' => 'text/markdown',
            'log' => 'text/plain',
            'rtf' => 'application/rtf',
            
            // Archives (optionnel)
            'zip' => 'application/zip',
            'rar' => 'application/x-rar-compressed',
        ];
        
        $mimeType = $mimeTypes[strtolower($extension)] ?? 'application/octet-stream';
        error_log("MIME type: " . $mimeType);

        return response()->download($path, $downloadName, [
            'Content-Type' => $mimeType,
        ]);
    }

    /**
     * Supprimer un document
     */
    public function destroy(DocumentTechnique $document)
    {
        error_log("=== SUPPRESSION DOCUMENT DEBUG ===");
        error_log("Document ID: " . $document->id);
        error_log("Document nom: " . $document->nom);
        error_log("Projet ID: " . $document->projet->id);
        error_log("User connecté: " . auth()->id());
        error_log("Uploaded by: " . $document->uploaded_by);

        try {
            // Vérifier les autorisations
            $this->authorize('delete', $document->projet);
            
            error_log("Autorisation OK, suppression en cours...");

            // Supprimer le fichier du stockage
            if (Storage::disk('public')->exists($document->chemin_fichier)) {
                Storage::disk('public')->delete($document->chemin_fichier);
                error_log("Fichier supprimé: " . $document->chemin_fichier);
            } else {
                error_log("Fichier introuvable: " . $document->chemin_fichier);
            }

            // Supprimer l'enregistrement
            $document->delete();
            
            error_log("Document supprimé avec succès");

            return response()->json(['message' => 'Document supprimé avec succès']);
        } catch (\Exception $e) {
            error_log("Erreur suppression: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return response()->json([
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer tous les documents du prestataire connecté
     */
    public function prestataireDocuments()
    {
        error_log("=== PRESTATAIRE DOCUMENTS APPELÉ ===");
        
        try {
            $user = auth()->user();
            error_log("User ID: " . $user->id . ", Role: " . $user->role);
            
            if ($user->role !== 'prestataire') {
                error_log("Accès refusé - pas prestataire");
                return response()->json(['message' => 'Accès non autorisé'], 403);
            }

            error_log("Récupération des documents...");
            
            // Récupérer les documents de tous les projets du prestataire
            $documents = DocumentTechnique::whereHas('projet', function($query) use ($user) {
                $query->where('created_by', $user->id);
            })->with(['projet:id,titre'])
            ->orderBy('created_at', 'desc')
            ->get();

            error_log("Documents trouvés: " . $documents->count());

            // Transformer les données pour l'affichage
            $formattedDocuments = $documents->map(function($doc) {
                return [
                    'id' => $doc->id,
                    'name' => $doc->nom,  // Adapté pour le frontend
                    'nom' => $doc->nom,   // Gardé pour compatibilité
                    'type' => $doc->type_document,  // Adapté pour le frontend
                    'type_document' => $doc->type_document, // Gardé pour compatibilité
                    'size' => $this->formatFileSize($doc->taille_fichier), // Adapté pour le frontend
                    'taille_fichier' => $doc->taille_fichier,
                    'extension' => pathinfo($doc->chemin_fichier, PATHINFO_EXTENSION), // Extension réelle du fichier
                    'projectName' => $doc->projet->titre, // Ajouté pour le frontend
                    'projet' => [
                        'id' => $doc->projet->id,
                        'titre' => $doc->projet->titre
                    ],
                    'status' => $doc->status, // Utiliser le vrai statut de la DB
                    'rejection_reason' => $doc->rejection_reason,
                    'reviewed_by' => $doc->reviewer ? $doc->reviewer->name : null,
                    'reviewed_at' => $doc->reviewed_at ? $doc->reviewed_at->toISOString() : null,
                    'url' => url('/api/documents/' . $doc->id . '/download'), // URL sécurisée
                    'created_at' => $doc->created_at->toISOString(),
                ];
            });

            error_log("Documents formatés: " . json_encode($formattedDocuments->toArray()));
            error_log("=== FIN PRESTATAIRE DOCUMENTS ===");

            return response()->json([
                'documents' => $formattedDocuments,
                'total' => $documents->count(),
                'approuves' => $documents->where('type_document', '!=', 'autre')->count(),
                'en_attente' => $documents->where('type_document', 'autre')->count(),
                'espace_utilise' => $documents->sum('taille_fichier')
            ]);

        } catch (\Exception $e) {
            error_log("Erreur prestataireDocuments: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return response()->json([
                'message' => 'Erreur lors du chargement des documents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Formate la taille du fichier pour l'affichage
     */
    private function formatFileSize($bytes)
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }

    /**
     * Supprimer un document par le prestataire
     */
    public function prestataireDestroy($id)
    {
        error_log("=== SUPPRESSION PRESTATAIRE DOCUMENT ===");
        error_log("Document ID: " . $id);
        error_log("User connecté: " . auth()->id());

        try {
            $document = DocumentTechnique::findOrFail($id);
            
            error_log("Document trouvé: " . $document->nom);
            error_log("Projet ID: " . $document->projet_id);
            error_log("Uploaded by: " . $document->uploaded_by);

            // Vérifier que le document appartient au prestataire connecté
            // OU que le prestataire est propriétaire du projet
            $user = auth()->user();
            
            if ($document->uploaded_by !== $user->id && $document->projet->user_id !== $user->id) {
                error_log("Accès refusé - Document ne appartient pas au prestataire");
                return response()->json([
                    'message' => 'Vous n\'êtes pas autorisé à supprimer ce document'
                ], 403);
            }

            error_log("Autorisation OK, suppression en cours...");

            // Supprimer le fichier du stockage
            if (Storage::disk('public')->exists($document->chemin_fichier)) {
                Storage::disk('public')->delete($document->chemin_fichier);
                error_log("Fichier supprimé: " . $document->chemin_fichier);
            } else {
                error_log("Fichier introuvable: " . $document->chemin_fichier);
            }

            // Supprimer l'enregistrement
            $document->delete();
            
            error_log("Document supprimé avec succès");

            return response()->json(['message' => 'Document supprimé avec succès']);

        } catch (\Exception $e) {
            error_log("Erreur suppression prestataire: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return response()->json([
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer plusieurs documents en une fois pour les prestataires
     */
    public function prestataireBulkDestroy(Request $request)
    {
        error_log("=== SUPPRESSION MULTIPLE PRESTATAIRE ===");
        
        $request->validate([
            'document_ids' => 'required|array|min:1',
            'document_ids.*' => 'integer|exists:document_techniques,id'
        ]);

        try {
            $documentIds = $request->document_ids;
            error_log("Documents à supprimer: " . implode(', ', $documentIds));

            $documents = DocumentTechnique::whereIn('id', $documentIds)->get();
            $user = auth()->user();
            
            $deletedCount = 0;
            $errors = [];

            foreach ($documents as $document) {
                try {
                    // Vérifier les autorisations pour chaque document
                    if ($document->uploaded_by !== $user->id && $document->projet->user_id !== $user->id) {
                        $errors[] = "Document '{$document->nom}' : accès refusé";
                        continue;
                    }

                    // Supprimer le fichier du stockage
                    if (Storage::disk('public')->exists($document->chemin_fichier)) {
                        Storage::disk('public')->delete($document->chemin_fichier);
                    }

                    // Supprimer l'enregistrement
                    $document->delete();
                    $deletedCount++;
                    
                } catch (\Exception $e) {
                    $errors[] = "Document '{$document->nom}' : " . $e->getMessage();
                }
            }

            error_log("Documents supprimés: {$deletedCount}");
            
            if ($deletedCount === 0) {
                return response()->json([
                    'message' => 'Aucun document n\'a pu être supprimé',
                    'errors' => $errors
                ], 400);
            }

            if (!empty($errors)) {
                return response()->json([
                    'message' => "{$deletedCount} document(s) supprimé(s) avec des erreurs",
                    'deleted_count' => $deletedCount,
                    'errors' => $errors
                ], 207); // Multi-Status
            }

            return response()->json([
                'message' => "{$deletedCount} document(s) supprimé(s) avec succès",
                'deleted_count' => $deletedCount
            ]);

        } catch (\Exception $e) {
            error_log("Erreur suppression multiple: " . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la suppression multiple',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
