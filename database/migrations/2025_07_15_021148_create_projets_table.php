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
        Schema::create('projets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('village_id')->constrained('villages');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->enum('statut', ['en_attente', 'en_cours', 'termine', 'valide'])->default('en_attente');
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();
            $table->decimal('montant_total', 12, 2)->default(0);
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('validated_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projets');
    }
};
