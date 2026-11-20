<?php

namespace App\Http\Controllers;

use App\Models\Projet;
use App\Models\Video;
use App\Services\MoneyPrinterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Génération de vidéos courtes via MoneyPrinterTurbo.
 */
class VideoController extends Controller
{
    public function __construct(private MoneyPrinterService $moneyPrinter)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Video::with('projet:id,titre')->latest();

        if (! $request->user()->hasRole('administrateur')) {
            $query->where('user_id', $request->user()->id);
        }
        if ($request->filled('projet_id')) {
            $query->where('projet_id', $request->integer('projet_id'));
        }

        $videos = $query->get()->each(fn (Video $v) => $this->moneyPrinter->refresh($v));

        return response()->json($videos->map(fn (Video $v) => $this->present($v)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'projet_id' => 'nullable|integer|exists:projets,id',
            'sujet' => 'required_without:projet_id|nullable|string|max:500',
            'script' => 'nullable|string|max:5000',
            'mots_cles' => 'nullable|array|max:20',
            'mots_cles.*' => 'string|max:100',
            'format' => 'nullable|in:9:16,16:9,1:1',
            'langue' => 'nullable|string|max:10',
            'voix' => 'nullable|string|max:100',
            'duree_clip' => 'nullable|integer|min:1|max:30',
            'sous_titres' => 'nullable|boolean',
            'options' => 'nullable|array', // paramètres MoneyPrinterTurbo bruts (avancé)
        ]);

        $projet = isset($data['projet_id']) ? Projet::find($data['projet_id']) : null;
        if ($projet && ! $request->user()->hasRole('administrateur') && $projet->created_by !== $request->user()->id) {
            return response()->json(['message' => 'Ce projet ne vous appartient pas.'], 403);
        }

        $sujet = $data['sujet'] ?? null;
        if (! $sujet && $projet) {
            $sujet = Str::limit(trim($projet->titre.'. '.($projet->description ?? '')), 500, '');
        }

        $format = $data['format'] ?? '9:16';
        $params = array_merge($data['options'] ?? [], array_filter([
            'video_subject' => $sujet,
            'video_script' => $data['script'] ?? null,
            'video_terms' => $data['mots_cles'] ?? null,
            'video_aspect' => $format,
            'video_language' => $data['langue'] ?? null,
            'voice_name' => $data['voix'] ?? null,
            'video_clip_duration' => $data['duree_clip'] ?? null,
            'subtitle_enabled' => $data['sous_titres'] ?? null,
        ], fn ($v) => $v !== null));

        try {
            $taskId = $this->moneyPrinter->createVideoTask($params);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Impossible de lancer la génération de la vidéo.',
                'error' => $e->getMessage(),
            ], 502);
        }

        $video = Video::create([
            'user_id' => $request->user()->id,
            'projet_id' => $projet?->id,
            'task_id' => $taskId,
            'sujet' => $sujet,
            'script' => $data['script'] ?? null,
            'format' => $format,
            'statut' => Video::STATUT_EN_COURS,
            'progression' => 0,
            'parametres' => $params,
        ]);

        return response()->json($this->present($video), 202);
    }

    public function show(Request $request, Video $video): JsonResponse
    {
        $this->authorizeAccess($request, $video);

        return response()->json($this->present($this->moneyPrinter->refresh($video)));
    }

    public function download(Request $request, Video $video): StreamedResponse|JsonResponse
    {
        $this->authorizeAccess($request, $video);

        $disk = Storage::disk(config('services.moneyprinter.disk', 'local'));
        if ($video->statut !== Video::STATUT_TERMINE || ! $video->fichier_path || ! $disk->exists($video->fichier_path)) {
            return response()->json(['message' => "La vidéo n'est pas encore disponible."], 409);
        }

        $nom = Str::slug(Str::limit($video->sujet, 60, '')) ?: 'video';

        return $disk->download($video->fichier_path, "{$nom}-{$video->id}.mp4", ['Content-Type' => 'video/mp4']);
    }

    public function destroy(Request $request, Video $video): JsonResponse
    {
        $this->authorizeAccess($request, $video);

        if ($video->task_id) {
            try {
                $this->moneyPrinter->deleteTask($video->task_id);
            } catch (\Throwable) {
                // Le service distant peut être arrêté : on supprime quand même localement.
            }
        }
        if ($video->fichier_path) {
            Storage::disk(config('services.moneyprinter.disk', 'local'))->delete($video->fichier_path);
        }
        $video->delete();

        return response()->json(['message' => 'Vidéo supprimée.']);
    }

    private function authorizeAccess(Request $request, Video $video): void
    {
        $user = $request->user();
        abort_unless($user->hasRole('administrateur') || $video->user_id === $user->id, 403, 'Accès refusé.');
    }

    private function present(Video $video): array
    {
        return [
            'id' => $video->id,
            'projetId' => $video->projet_id,
            'projetTitre' => $video->projet?->titre,
            'sujet' => $video->sujet,
            'script' => $video->script,
            'format' => $video->format,
            'statut' => $video->statut,
            'progression' => $video->progression,
            'erreur' => $video->erreur,
            'downloadUrl' => $video->statut === Video::STATUT_TERMINE
                ? route('api.videos.download', $video)
                : null,
            'createdAt' => $video->created_at?->toISOString(),
            'updatedAt' => $video->updated_at?->toISOString(),
        ];
    }
}
