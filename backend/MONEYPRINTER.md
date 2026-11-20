# Génération de vidéos avec MoneyPrinterTurbo

Le backend peut générer des vidéos courtes (script, voix off, sous-titres, images d'illustration)
en appelant [MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo), qui tourne comme
**service séparé**. Laravel crée les tâches, suit leur avancement, puis copie la vidéo finale
dans son propre stockage pour la servir aux utilisateurs authentifiés.

```
Frontend ──► Laravel /api/videos ──► MoneyPrinterTurbo :8080 /api/v1/videos
                    ▲                         │
                    └── copie du .mp4 ◄───────┘  (storage/app/private/videos)
```

## 1. Installer et lancer MoneyPrinterTurbo

```bash
git clone https://github.com/harry0703/MoneyPrinterTurbo.git
cd MoneyPrinterTurbo
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp config.example.toml config.toml
python main.py          # API sur http://127.0.0.1:8080 (docs : /docs)
```

Ou avec Docker : `docker compose up -d` dans le dossier de MoneyPrinterTurbo.

Dans `config.toml`, renseignez au minimum :

- un fournisseur de LLM (`llm_provider` + sa clé, ex. OpenAI, DeepSeek, Gemini) pour écrire le script ;
- `pexels_api_keys` (gratuit sur pexels.com/api) ou `pixabay_api_keys` pour les vidéos d'illustration ;
- **recommandé** : `api_key = "une-valeur-secrete"` pour que seul ce backend puisse appeler le service.

## 2. Configurer Laravel

Dans `.env` :

```dotenv
MONEYPRINTER_URL=http://127.0.0.1:8080
MONEYPRINTER_API_KEY=une-valeur-secrete   # identique à api_key de config.toml
MONEYPRINTER_TIMEOUT=30
MONEYPRINTER_DISK=local                   # disque Laravel où sont copiées les vidéos
```

Puis :

```bash
php artisan migrate
php artisan schedule:work   # ou cron `* * * * * php artisan schedule:run`
```

Le planificateur lance `videos:sync` chaque minute pour finaliser les vidéos même si personne
ne consulte leur statut. La commande peut aussi être lancée à la main : `php artisan videos:sync`.

## 3. API

Toutes les routes exigent un jeton Sanctum et le rôle `administrateur` ou `prestataire`.
Un prestataire ne voit que ses propres vidéos et ne peut utiliser que ses propres projets ;
un administrateur voit tout.

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/videos?projet_id=` | Liste (statuts mis à jour à la volée) |
| `POST` | `/api/videos` | Lance une génération → `202` |
| `GET` | `/api/videos/{id}` | Statut et progression (à interroger toutes les ~5 s) |
| `GET` | `/api/videos/{id}/download` | Fichier MP4 (`409` tant qu'il n'est pas prêt) |
| `DELETE` | `/api/videos/{id}` | Supprime la vidéo ici et la tâche côté MoneyPrinterTurbo |

### Corps de `POST /api/videos`

| Champ | Type | Description |
|---|---|---|
| `projet_id` | int | Projet lié ; si `sujet` est absent, le titre et la description du projet servent de sujet |
| `sujet` | string | Sujet de la vidéo (obligatoire sans `projet_id`) |
| `script` | string | Script imposé (sinon écrit par le LLM) |
| `mots_cles` | string[] | Mots-clés de recherche des images d'illustration |
| `format` | `9:16` \| `16:9` \| `1:1` | Défaut `9:16` (vertical) |
| `langue` | string | Ex. `fr-FR` (défaut : détection automatique) |
| `voix` | string | Voix TTS, ex. `fr-FR-DeniseNeural-Female` |
| `duree_clip` | int | Durée de chaque plan en secondes |
| `sous_titres` | bool | Active les sous-titres (défaut côté MoneyPrinterTurbo : oui) |
| `options` | object | Paramètres bruts `VideoParams` de MoneyPrinterTurbo (avancé) |

Exemple :

```bash
curl -X POST http://localhost:8000/api/videos \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"projet_id": 3, "format": "9:16", "langue": "fr-FR", "voix": "fr-FR-DeniseNeural-Female"}'
```

Réponse :

```json
{
  "id": 12, "projetId": 3, "projetTitre": "Forage à Ndiaye",
  "sujet": "Forage à Ndiaye. …", "format": "9:16",
  "statut": "en_cours", "progression": 0, "erreur": null,
  "downloadUrl": null, "createdAt": "…", "updatedAt": "…"
}
```

`statut` vaut `en_cours`, puis `termine` (avec `downloadUrl`) ou `echec` (avec `erreur`).
Si MoneyPrinterTurbo est injoignable au lancement, l'API répond `502`.

## Fichiers concernés

- `app/Services/MoneyPrinterService.php` — client HTTP de MoneyPrinterTurbo
- `app/Http/Controllers/VideoController.php` — endpoints `/api/videos`
- `app/Models/Video.php`, migration `create_videos_table`
- `routes/console.php` — commande `videos:sync` et planification
- `tests/Feature/VideoTest.php` — tests (MoneyPrinterTurbo simulé avec `Http::fake`)
