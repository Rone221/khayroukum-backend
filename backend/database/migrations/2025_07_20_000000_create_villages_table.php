<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('villages', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->integer('population')->nullable();
            $table->json('coordonnees')->nullable();
            $table->string('region');
            $table->string('departement')->nullable();
            $table->string('commune')->nullable();
            $table->string('photo')->nullable();
            $table->string('telephone')->nullable();
            $table->text('description')->nullable();
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }
    public function down()
    {
        Schema::dropIfExists('villages');
    }
};
