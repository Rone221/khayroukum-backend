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
        Schema::create('site_media', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nom original du fichier
            $table->string('filename'); // Nom du fichier sur le serveur
            $table->string('path'); // Chemin complet du fichier
            $table->string('type'); // image, video, document
            $table->string('mime_type'); // image/jpeg, video/mp4, etc.
            $table->integer('size'); // Taille en bytes
            $table->string('alt_text')->nullable(); // Texte alternatif pour les images
            $table->json('metadata')->nullable(); // Dimensions, durée, etc.
            $table->json('used_in_sections')->nullable(); // Sections où ce média est utilisé
            $table->boolean('is_active')->default(true);
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            // Index pour les recherches
            $table->index('type');
            $table->index('is_active');
            $table->index('uploaded_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_media');
    }
};
