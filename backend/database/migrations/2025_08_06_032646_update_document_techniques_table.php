<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('document_techniques', function (Blueprint $table) {
            // Ajouter les nouvelles colonnes si elles n'existent pas
            if (!Schema::hasColumn('document_techniques', 'nom')) {
                $table->string('nom')->nullable();
            }
            if (!Schema::hasColumn('document_techniques', 'type_document')) {
                $table->string('type_document')->default('autre');
            }
            if (!Schema::hasColumn('document_techniques', 'chemin_fichier')) {
                $table->string('chemin_fichier')->nullable();
            }
            if (!Schema::hasColumn('document_techniques', 'taille_fichier')) {
                $table->bigInteger('taille_fichier')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_techniques', function (Blueprint $table) {
            $table->dropColumn(['nom', 'type_document', 'chemin_fichier', 'taille_fichier']);
        });
    }
};
