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
            $table->enum('type', ['devis', 'contrat', 'plan', 'rapport']);
            $table->string('fichier_path');
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
