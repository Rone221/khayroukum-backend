<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('projet_id')->nullable()->constrained('projets')->nullOnDelete();
            $table->string('task_id')->nullable()->unique();
            $table->string('sujet');
            $table->text('script')->nullable();
            $table->string('format', 8)->default('9:16');
            $table->enum('statut', ['en_cours', 'termine', 'echec'])->default('en_cours');
            $table->unsignedTinyInteger('progression')->default(0);
            $table->string('fichier_path')->nullable();
            $table->text('erreur')->nullable();
            $table->json('parametres')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};
