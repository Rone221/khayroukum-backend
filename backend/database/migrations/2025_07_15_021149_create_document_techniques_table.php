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
        Schema::create('document_techniques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_id')->constrained('projets');
            $table->string('nom');
            $table->enum('type_document', ['devis', 'facture', 'rapport', 'photo', 'autre']);
            $table->string('chemin_fichier');
            $table->bigInteger('taille_fichier')->nullable();
            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_techniques');
    }
};
