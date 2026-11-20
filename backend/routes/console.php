<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Synchronise les vidéos MoneyPrinterTurbo en cours (état + rapatriement du fichier).
Artisan::command('videos:sync', function (\App\Services\MoneyPrinterService $moneyPrinter) {
    $videos = \App\Models\Video::where('statut', \App\Models\Video::STATUT_EN_COURS)->get();
    foreach ($videos as $video) {
        $moneyPrinter->refresh($video);
        $this->line("Vidéo #{$video->id} : {$video->statut} ({$video->progression}%)");
    }
    $this->info($videos->count().' vidéo(s) vérifiée(s).');
})->purpose('Met à jour les vidéos en cours de génération par MoneyPrinterTurbo');

\Illuminate\Support\Facades\Schedule::command('videos:sync')->everyMinute()->withoutOverlapping();
