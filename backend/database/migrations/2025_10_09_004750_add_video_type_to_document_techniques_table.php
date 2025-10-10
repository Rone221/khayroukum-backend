<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Pour SQLite, nous devons recréer la colonne avec les nouvelles valeurs enum
        // Ajouter temporairement une nouvelle colonne
        Schema::table('document_techniques', function (Blueprint $table) {
            $table->enum('type_document_new', ['devis', 'facture', 'rapport', 'photo', 'video', 'autre'])->after('type_document');
        });

        // Copier les données
        DB::statement('UPDATE document_techniques SET type_document_new = type_document');

        // Supprimer l'ancienne colonne et renommer la nouvelle
        Schema::table('document_techniques', function (Blueprint $table) {
            $table->dropColumn('type_document');
        });

        Schema::table('document_techniques', function (Blueprint $table) {
            $table->renameColumn('type_document_new', 'type_document');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Supprimer le type 'video' de l'enum
        Schema::table('document_techniques', function (Blueprint $table) {
            $table->enum('type_document_new', ['devis', 'facture', 'rapport', 'photo', 'autre'])->after('type_document');
        });

        DB::statement('UPDATE document_techniques SET type_document_new = type_document WHERE type_document != "video"');

        Schema::table('document_techniques', function (Blueprint $table) {
            $table->dropColumn('type_document');
        });

        Schema::table('document_techniques', function (Blueprint $table) {
            $table->renameColumn('type_document_new', 'type_document');
        });
    }
};
