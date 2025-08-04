<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'prenom',
        'nom',
        'email',
        'password',
        'role',
        'is_verified',
        'telephone',
        'adresse',
        'date_naissance',
        'profession',
        'bio',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_naissance' => 'date',
            'is_verified' => 'boolean',
        ];
    }

    /**
     * Relation avec les villages (pour les prestataires)
     */
    public function villages()
    {
        return $this->hasMany(Village::class, 'created_by');
    }

    /**
     * Relation avec les projets (pour les prestataires)
     */
    public function projets()
    {
        return $this->hasMany(Projet::class, 'created_by');
    }

    /**
     * Relation avec les projets validés (pour les administrateurs)
     */
    public function projetsValides()
    {
        return $this->hasMany(Projet::class, 'validated_by');
    }

    /**
     * Relation avec les offres de financement (pour les donateurs)
     */
    public function offres()
    {
        return $this->hasMany(OffreFinancement::class, 'donateur_id');
    }
}
