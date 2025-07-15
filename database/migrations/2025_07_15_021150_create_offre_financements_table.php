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
        Schema::create('offre_financements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donateur_id')->constrained('users');
            $table->foreignId('projet_id')->constrained('projets');
            $table->decimal('montant', 12, 2);
            $table->string('nom_sur_tableau');
            $table->text('message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offre_financements');
    }
};
