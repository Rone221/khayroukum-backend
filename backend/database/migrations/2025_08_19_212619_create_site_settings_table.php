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
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // Ex: 'site_title', 'primary_color'
            $table->json('value'); // Valeur flexible en JSON
            $table->string('type')->default('text'); // text, color, image, boolean, number
            $table->string('group')->default('general'); // general, design, contact, seo
            $table->string('label'); // Libellé pour l'interface admin
            $table->text('description')->nullable(); // Description pour l'admin
            $table->boolean('is_public')->default(false); // Visible côté public ou admin seulement
            $table->integer('sort_order')->default(0); // Ordre d'affichage
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            // Index pour les performances
            $table->index(['group', 'sort_order']);
            $table->index('is_public');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
