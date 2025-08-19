<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

echo "=== DEBUG PROJETS ===\n";

use App\Models\Projet;

$projets = Projet::all();
echo "Nombre total de projets: " . $projets->count() . "\n\n";

echo "Liste des projets avec statuts:\n";
foreach($projets as $projet) {
    echo "ID: {$projet->id} | Titre: {$projet->titre} | Statut: {$projet->statut}\n";
}

echo "\n=== GROUPEMENT PAR STATUT ===\n";
$statuts = Projet::selectRaw('statut, COUNT(*) as count')
    ->groupBy('statut')
    ->get();

foreach($statuts as $stat) {
    echo "Statut '{$stat->statut}': {$stat->count} projet(s)\n";
}

echo "\n=== PROJETS TERMINÉS (ce que l'API publique cherche) ===\n";
$projets_termines = Projet::where('statut', 'terminé')->get();
echo "Nombre de projets terminés: " . $projets_termines->count() . "\n";

if($projets_termines->count() > 0) {
    foreach($projets_termines as $projet) {
        echo "- {$projet->titre} (ID: {$projet->id})\n";
    }
} else {
    echo "PROBLÈME: Aucun projet avec le statut 'terminé' trouvé!\n";
}
