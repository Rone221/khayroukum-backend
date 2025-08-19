<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:admin');
    }

    /**
     * Récupérer tous les médias avec pagination et filtres
     */
    public function index(Request $request)
    {
        try {
            $query = SiteMedia::with('uploadedBy')
                ->orderBy('created_at', 'desc');

            // Filtrer par type
            if ($request->has('type') && $request->type !== 'all') {
                $query->where('type', $request->type);
            }

            // Filtrer par section
            if ($request->has('section') && $request->section !== 'all') {
                $query->where('section', $request->section);
            }

            // Recherche par nom de fichier
            if ($request->has('search') && !empty($request->search)) {
                $query->where('filename', 'like', '%' . $request->search . '%');
            }

            $perPage = min($request->get('per_page', 20), 100);
            $media = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $media
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des médias: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des médias'
            ], 500);
        }
    }

    /**
     * Récupérer un média spécifique
     */
    public function show($id)
    {
        try {
            $media = SiteMedia::with('uploadedBy')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $media
            ]);

        } catch (\Exception $e) {
            \Log::error("Erreur lors de la récupération du média {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Média non trouvé'
            ], 404);
        }
    }

    /**
     * Uploader un nouveau média
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:jpeg,jpg,png,gif,webp,pdf,doc,docx,xls,xlsx,ppt,pptx|max:10240',
            'section' => 'required|string|max:255',
            'description' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Fichier invalide',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $section = $request->section;

            // Générer un nom unique
            $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            
            // Déterminer le répertoire en fonction de la section
            $directory = 'site-media/' . $section;
            
            // Stocker le fichier
            $path = $file->storeAs($directory, $filename, 'public');

            // Déterminer le type de fichier
            $type = $this->getFileType($file->getMimeType());

            // Créer l'enregistrement
            $media = SiteMedia::create([
                'filename' => $file->getClientOriginalName(),
                'path' => $path,
                'url' => Storage::disk('public')->url($path),
                'type' => $type,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'section' => $section,
                'description' => $request->description,
                'uploaded_by' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Média uploadé avec succès',
                'data' => $media->load('uploadedBy')
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de l\'upload du média: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload du média'
            ], 500);
        }
    }

    /**
     * Mettre à jour les métadonnées d'un média
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'section' => 'required|string|max:255',
            'description' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $media = SiteMedia::findOrFail($id);

            $media->update([
                'section' => $request->section,
                'description' => $request->description
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Média mis à jour avec succès',
                'data' => $media->load('uploadedBy')
            ]);

        } catch (\Exception $e) {
            \Log::error("Erreur lors de la mise à jour du média {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du média'
            ], 500);
        }
    }

    /**
     * Supprimer un média
     */
    public function destroy($id)
    {
        try {
            $media = SiteMedia::findOrFail($id);
            
            // Supprimer le fichier physique
            if (Storage::disk('public')->exists($media->path)) {
                Storage::disk('public')->delete($media->path);
            }

            // Supprimer l'enregistrement
            $media->delete();

            return response()->json([
                'success' => true,
                'message' => 'Média supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            \Log::error("Erreur lors de la suppression du média {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du média'
            ], 500);
        }
    }

    /**
     * Upload multiple pour un lot de fichiers
     */
    public function bulkStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'files' => 'required|array|max:10',
            'files.*' => 'file|mimes:jpeg,jpg,png,gif,webp,pdf,doc,docx,xls,xlsx,ppt,pptx|max:10240',
            'section' => 'required|string|max:255',
            'description' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Fichiers invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $uploadedMedia = [];
            $section = $request->section;
            $directory = 'site-media/' . $section;

            foreach ($request->file('files') as $file) {
                // Générer un nom unique
                $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                
                // Stocker le fichier
                $path = $file->storeAs($directory, $filename, 'public');

                // Déterminer le type de fichier
                $type = $this->getFileType($file->getMimeType());

                // Créer l'enregistrement
                $media = SiteMedia::create([
                    'filename' => $file->getClientOriginalName(),
                    'path' => $path,
                    'url' => Storage::disk('public')->url($path),
                    'type' => $type,
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'section' => $section,
                    'description' => $request->description,
                    'uploaded_by' => Auth::id()
                ]);

                $uploadedMedia[] = $media->load('uploadedBy');
            }

            return response()->json([
                'success' => true,
                'message' => count($uploadedMedia) . ' médias uploadés avec succès',
                'data' => $uploadedMedia
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de l\'upload en lot des médias: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload des médias'
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques des médias
     */
    public function stats()
    {
        try {
            $stats = [
                'total' => SiteMedia::count(),
                'by_type' => SiteMedia::selectRaw('type, COUNT(*) as count')
                    ->groupBy('type')
                    ->pluck('count', 'type')
                    ->toArray(),
                'by_section' => SiteMedia::selectRaw('section, COUNT(*) as count')
                    ->groupBy('section')
                    ->pluck('count', 'section')
                    ->toArray(),
                'total_size' => SiteMedia::sum('size'),
                'recent' => SiteMedia::with('uploadedBy')
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des statistiques des médias: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques'
            ], 500);
        }
    }

    /**
     * Déterminer le type de fichier basé sur le mime type
     */
    private function getFileType($mimeType)
    {
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        } elseif (str_starts_with($mimeType, 'video/')) {
            return 'video';
        } elseif (str_starts_with($mimeType, 'audio/')) {
            return 'audio';
        } elseif (in_array($mimeType, ['application/pdf'])) {
            return 'document';
        } elseif (in_array($mimeType, [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ])) {
            return 'document';
        }

        return 'other';
    }
}
