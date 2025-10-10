<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\DocumentTechnique;
use App\Models\Projet;

class MultipleDocumentUploadController extends Controller
{
    /**
     * Upload multiple documents for a project
     */
    public function uploadMultiple(Request $request, $project)
    {
        $request->validate([
            'files' => 'required|array|min:1|max:10',
            'files.*' => 'file|max:10240', // 10MB max per file
            'types' => 'required|array',
            'types.*' => 'required|in:devis,facture,rapport,photo,video,autre',
            'descriptions' => 'array',
            'descriptions.*' => 'nullable|string|max:255',
        ]);

        try {
            $projectId = $project;
            $files = $request->file('files');
            $types = $request->input('types');
            $descriptions = $request->input('descriptions');

            // Vérifier que le projet appartient à l'utilisateur
            $project = Projet::where('id', $projectId)
                ->where('created_by', Auth::id())
                ->firstOrFail();

            $uploadedDocuments = [];
            $errors = [];

            foreach ($files as $index => $file) {
                try {
                    // Valider le fichier individuellement
                    $fileType = $file->getClientMimeType();
                    $fileName = $file->getClientOriginalName();
                    $fileSize = $file->getSize();

                    // Validation supplémentaire par type
                    $allowedMimes = [
                        'image/jpeg',
                        'image/png',
                        'image/gif',
                        'image/webp',
                        'video/mp4',
                        'video/avi',
                        'video/mov',
                        'video/wmv',
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    ];

                    if (!in_array($fileType, $allowedMimes)) {
                        $errors[] = "Fichier {$fileName}: Type de fichier non autorisé";
                        continue;
                    }

                    // Générer un nom unique
                    $extension = $file->getClientOriginalExtension();
                    $uniqueName = time() . '_' . Str::random(10) . '.' . $extension;

                    // Stocker le fichier
                    $path = $file->storeAs('uploads/documents', $uniqueName, 'public');
                    $url = url('storage/' . $path);

                    // Créer l'entrée en base de données
                    $document = DocumentTechnique::create([
                        'projet_id' => $projectId,
                        'nom' => $descriptions[$index] ?? $fileName,
                        'type_document' => $types[$index] ?? 'autre',
                        'chemin_fichier' => $path,
                        'taille_fichier' => $fileSize,
                        'type_mime' => $fileType,
                        'extension' => $extension,
                        'status' => 'pending', // En attente de validation
                        'uploaded_by' => Auth::id(),
                    ]);

                    $uploadedDocuments[] = [
                        'id' => $document->id,
                        'name' => $document->nom,
                        'type' => $document->type_document,
                        'url' => $url,
                        'size' => $fileSize,
                        'status' => $document->status,
                        'created_at' => $document->created_at->toISOString(),
                    ];
                } catch (\Exception $e) {
                    $errors[] = "Fichier {$fileName}: " . $e->getMessage();
                }
            }

            $response = [
                'success' => true,
                'message' => count($uploadedDocuments) . ' document(s) téléchargé(s) avec succès',
                'data' => [
                    'uploaded' => $uploadedDocuments,
                    'total_uploaded' => count($uploadedDocuments),
                    'total_errors' => count($errors),
                    'errors' => $errors,
                ]
            ];

            if (count($errors) > 0) {
                $response['message'] .= '. ' . count($errors) . ' erreur(s) détectée(s).';
            }

            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement multiple',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all documents for a project
     */
    public function getProjectDocuments(Request $request, $projectId)
    {
        try {
            // Vérifier que le projet appartient à l'utilisateur
            $project = Projet::where('id', $projectId)
                ->where('created_by', Auth::id())
                ->firstOrFail();

            $documents = DocumentTechnique::where('projet_id', $projectId)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'name' => $doc->nom,
                        'type' => $doc->type_document,
                        'url' => $doc->fichier_path ? url('storage/' . $doc->fichier_path) : null,
                        'size' => $doc->taille_fichier,
                        'extension' => $doc->extension,
                        'status' => $doc->status,
                        'created_at' => $doc->created_at->toISOString(),
                        'rejection_reason' => $doc->rejection_reason,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $documents
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des documents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a document
     */
    public function deleteDocument(Request $request, $documentId)
    {
        try {
            $document = DocumentTechnique::where('id', $documentId)
                ->where('uploaded_by', Auth::id())
                ->firstOrFail();

            // Supprimer le fichier physique
            if ($document->fichier_path && Storage::disk('public')->exists($document->fichier_path)) {
                Storage::disk('public')->delete($document->fichier_path);
            }

            // Supprimer l'entrée en base
            $document->delete();

            return response()->json([
                'success' => true,
                'message' => 'Document supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du document',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
