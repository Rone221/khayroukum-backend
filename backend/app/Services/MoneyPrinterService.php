<?php

namespace App\Services;

use App\Models\Video;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * Client de l'API MoneyPrinterTurbo (https://github.com/harry0703/MoneyPrinterTurbo).
 *
 * MoneyPrinterTurbo tourne comme un service séparé (python main.py, port 8080).
 * Ce service crée les tâches de génération, suit leur état et rapatrie la vidéo
 * finale sur un disque Laravel pour qu'elle soit servie par ce backend.
 */
class MoneyPrinterService
{
    // États renvoyés par MoneyPrinterTurbo (app/models/const.py)
    private const STATE_FAILED = -1;
    private const STATE_COMPLETE = 1;

    private function client(?int $timeout = null): PendingRequest
    {
        $request = Http::baseUrl(rtrim((string) config('services.moneyprinter.url'), '/'))
            ->acceptJson()
            ->connectTimeout(5)
            ->timeout($timeout ?? (int) config('services.moneyprinter.timeout', 30));

        if ($key = config('services.moneyprinter.api_key')) {
            $request = $request->withHeaders(['x-api-key' => $key]);
        }

        return $request;
    }

    /**
     * Lance la génération et renvoie l'identifiant de tâche MoneyPrinterTurbo.
     *
     * @param  array<string, mixed>  $params  Paramètres VideoParams de MoneyPrinterTurbo
     */
    public function createVideoTask(array $params): string
    {
        try {
            $response = $this->client()->post('/api/v1/videos', $params)->throw();
        } catch (RequestException $e) {
            throw new RuntimeException($this->errorMessage($e), $e->getCode(), $e);
        }

        $taskId = $response->json('data.task_id');
        if (! $taskId) {
            throw new RuntimeException('Réponse MoneyPrinterTurbo invalide : task_id manquant.');
        }

        return $taskId;
    }

    /**
     * @return array<string, mixed>|null  Données de la tâche, ou null si inconnue
     */
    public function getTask(string $taskId): ?array
    {
        $response = $this->client()->get('/api/v1/tasks/'.rawurlencode($taskId));
        if ($response->status() === 404) {
            return null;
        }
        $response->throw();

        return $response->json('data') ?? [];
    }

    public function deleteTask(string $taskId): void
    {
        $response = $this->client()->delete('/api/v1/tasks/'.rawurlencode($taskId));
        if ($response->failed() && $response->status() !== 404) {
            $response->throw();
        }
    }

    /**
     * Met à jour la vidéo depuis l'état de sa tâche ; copie le fichier quand il est prêt.
     */
    public function refresh(Video $video): Video
    {
        if (! $video->isEnCours() || ! $video->task_id) {
            return $video;
        }

        try {
            $task = $this->getTask($video->task_id);
        } catch (\Throwable $e) {
            // Service momentanément indisponible : on garde l'état actuel.
            Log::warning('MoneyPrinterTurbo injoignable', ['video' => $video->id, 'error' => $e->getMessage()]);

            return $video;
        }

        if ($task === null) {
            $video->update(['statut' => Video::STATUT_ECHEC, 'erreur' => 'Tâche introuvable sur MoneyPrinterTurbo.']);

            return $video;
        }

        $state = (int) ($task['state'] ?? 0);
        $video->progression = min(100, max(0, (int) ($task['progress'] ?? $video->progression)));

        if ($state === self::STATE_FAILED) {
            $video->statut = Video::STATUT_ECHEC;
            $video->erreur = (string) ($task['error'] ?? 'La génération a échoué.');
        } elseif ($state === self::STATE_COMPLETE) {
            $source = ($task['combined_videos'] ?? [])[0] ?? ($task['videos'] ?? [])[0] ?? null;
            if (! $source) {
                $video->statut = Video::STATUT_ECHEC;
                $video->erreur = 'Tâche terminée sans fichier vidéo.';
            } else {
                try {
                    $video->fichier_path = $this->downloadArtifact($source, $video);
                    $video->statut = Video::STATUT_TERMINE;
                    $video->progression = 100;
                    $video->script = $task['script'] ?? $video->script;
                } catch (\Throwable $e) {
                    // On réessaiera au prochain rafraîchissement.
                    Log::warning('Téléchargement de la vidéo impossible', ['video' => $video->id, 'error' => $e->getMessage()]);
                }
            }
        }

        $video->save();

        return $video;
    }

    /**
     * Télécharge un fichier produit par MoneyPrinterTurbo (servi sous /tasks/...).
     */
    private function downloadArtifact(string $url, Video $video): string
    {
        // L'URL renvoyée dépend du paramètre `endpoint` de MoneyPrinterTurbo :
        // on ne garde que le chemin /tasks/... et on passe par l'URL configurée ici.
        $path = parse_url($url, PHP_URL_PATH) ?: $url;
        $pos = strpos($path, '/tasks/');
        if ($pos === false) {
            throw new RuntimeException("Chemin de vidéo inattendu : {$url}");
        }
        $path = substr($path, $pos);

        $disk = Storage::disk(config('services.moneyprinter.disk', 'local'));
        $target = "videos/{$video->id}.mp4";
        $tmp = tempnam(sys_get_temp_dir(), 'mpt');

        try {
            $this->client(600)->sink($tmp)->get($path)->throw();
            $stream = fopen($tmp, 'rb');
            $disk->writeStream($target, $stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
        } finally {
            @unlink($tmp);
        }

        return $target;
    }

    private function errorMessage(RequestException $e): string
    {
        $message = $e->response?->json('message');

        return 'MoneyPrinterTurbo : '.($message ?: 'erreur HTTP '.$e->response?->status());
    }
}
