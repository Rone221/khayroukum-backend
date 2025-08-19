<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description',
        'is_public',
        'sort_order',
        'updated_by'
    ];

    protected $casts = [
        'value' => 'array',
        'is_public' => 'boolean',
        'sort_order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relations
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeByGroup($query, $group)
    {
        return $query->where('group', $group);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('label');
    }

    // Méthodes statiques pour récupérer les paramètres
    public static function get($key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    public static function set($key, $value, $updatedBy = null)
    {
        return self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'updated_by' => $updatedBy
            ]
        );
    }

    public static function getPublicSettings()
    {
        return self::public()->get()->pluck('value', 'key')->toArray();
    }

    public static function getGroupedSettings()
    {
        return self::ordered()->get()->groupBy('group');
    }

    // Accesseurs pour différents types
    public function getValueFormattedAttribute()
    {
        switch ($this->type) {
            case 'boolean':
                return $this->value ? 'Oui' : 'Non';
            case 'color':
                return $this->value;
            case 'image':
                return $this->value ? asset('storage/' . $this->value) : null;
            default:
                return is_array($this->value) ? implode(', ', $this->value) : $this->value;
        }
    }
}
