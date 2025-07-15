<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Projet;
use App\Models\DocumentTechnique;
use App\Models\OffreFinancement;
use App\Policies\ProjetPolicy;
use App\Policies\DocumentTechniquePolicy;
use App\Policies\OffreFinancementPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Projet::class => ProjetPolicy::class,
        DocumentTechnique::class => DocumentTechniquePolicy::class,
        OffreFinancement::class => OffreFinancementPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
