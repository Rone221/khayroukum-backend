# Studio vidéo ALIF ACADEMIE

Sources des publicités vidéo d'ALIF ACADEMIE (format vertical 1080×1920, 30 i/s).
Les vidéos finies sont dans `../videos-test/`.

| Dossier | Vidéo | État |
|---|---|---|
| `pub-1-presentation/` | Présentation vert et or, voix femme, 57 s | ✅ `videos-test/alif-academie-presentation.mp4` |
| `pub-2-tout-commence-par-un-point/` | Film « de la nuit à l'aube », voix homme, 72 s | ✅ `videos-test/alif-academie-voix-homme.mp4` |
| `pub-3-personnages-reels/` | « Le savoir qui vient à vous », images du catalogue ALIF, voix homme, 51 s | ✅ `videos-test/alif-academie-personnages.mp4` |
| `pub-4-mots-arabes/` | « Vous parlez arabe sans le savoir », sans voix off, fond sonore ALIF, 56 s | ✅ `videos-test/alif-academie-mots-arabes.mp4` |
| `pub-5-mots-arabes-voix-off/` | Même sujet, voix off homme « professeur », fond sonore en retrait, 50 s | ✅ `videos-test/alif-academie-mots-arabes-voix-off.mp4` |
| `pub-6-racines-arabes/` | « La magie des racines » (ك ت ب), sans voix off, fond sonore ALIF, 53 s | ✅ `videos-test/alif-academie-racines-arabes.mp4` |

## Principe

1. **Voix off** : texte → [Piper](https://github.com/rhasspy/piper) (synthèse vocale française hors ligne).
2. **Minutage** : [faster-whisper](https://github.com/SYSTRAN/faster-whisper) retranscrit la voix avec l'horodatage
   de chaque mot ; `timeline.py` aligne ces mots sur le script et produit `timeline.json` + `narration.m4a`.
3. **Animation** : `index.html` dessine chaque image en fonction du temps (`render(t)`), calée sur les mots prononcés.
4. **Rendu** : `render.js` (Playwright + Chromium) capture les 30 images/seconde et les encode avec ffmpeg, avec la voix.

Choix éditoriaux : **pas de musique** (voix seule, par respect pour le public de l'école) et
**pas de tarifs** (la brochure avec tarifs est réservée aux envois privés ; elle n'est pas dans ce dépôt).

## Prérequis

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install piper-tts faster-whisper numpy
npm install playwright && npx playwright install chromium   # ou un Chromium déjà installé
# ffmpeg doit être installé

# Voix (Hugging Face, rhasspy/piper-voices)
mkdir -p models && cd models
base=https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR
curl -LO $base/tom/medium/fr_FR-tom-medium.onnx -LO $base/tom/medium/fr_FR-tom-medium.onnx.json      # homme
curl -LO $base/siwis/medium/fr_FR-siwis-medium.onnx -LO $base/siwis/medium/fr_FR-siwis-medium.onnx.json # femme
```

## Refaire une vidéo

```bash
cd video-studio/pub-2-tout-commence-par-un-point
# 1. voix off (une piste par scène dans vo/)
mkdir -p vo && PIPER_MODEL=../../models/fr_FR-tom-medium.onnx python ../tools/tts.py script.json vo
# 2. minutage mot à mot (10 = nombre de scènes)
python ../tools/words.py small vo 10
# 3. timeline + piste audio (LEAD/GAP/TAIL : silences avant, entre et après les phrases)
LEAD=1.3 GAP=0.75 TAIL=3.2 python ../tools/timeline.py .
echo "window.TL = $(cat timeline.json);" > timeline.js
# 4. aperçu de quelques instants, puis rendu complet
node ../tools/preview.js "$PWD" /tmp 5 30 60
node ../tools/render.js "$PWD" "$PWD/narration.m4a" "$PWD/video.mp4" 30
```

Réglages utilisés : pub 1 `LEAD=0.5 GAP=0.5 TAIL=2.6` (voix siwis), pub 2 `1.3 / 0.75 / 3.2`, pub 3 `0.6 / 0.55 / 3.5`.

Astuces de prononciation (le texte lu peut différer du texte affiché) :
- « WhatsApp » est mal lu : écrire **« Ouatsappe »** dans le texte lu (`tts_script.json` de la pub 3).
- « Alif » et « Coran » sont bien prononcés (Whisper les retranscrit « à l'if » / « courant », c'est normal).

## Pub 3 — « Le savoir qui vient à vous » (personnages réels)

Réalisée avec les images du catalogue envoyé par ALIF (`Catalogue_images_envoyees_ALIF.pdf`, non versionné) :
`tools/crop.py` découpe chaque miniature du catalogue, `tools/upscale.py` les agrandit ×4 avec Real-ESRGAN
(modèle ONNX `Meeperomi/RealESRGAN_x4-onnx` sur Hugging Face). Les 20 images retenues sont dans `img/`
(nom = page et position dans le catalogue). Exclues volontairement : captures de conversations WhatsApp
(données personnelles), visuels d'autres écoles, captures d'écran. Pour une netteté maximale, refaire
le découpage à partir des fichiers originaux.

Plan d'origine prévu avec Pexels (non utilisé, la clé API était refusée) :

Voix off prête (`pub-3-personnages-reels/narration.m4a`, minutage dans `timeline.json`). Plan des images :

| Scène | Texte | Images recherchées (Pexels) |
|---|---|---|
| 1 | Apprendre le Coran ? On se le promet chaque année. | Coran posé sur une étagère, adulte pensif |
| 2 | Entre le travail, la distance et les embouteillages… | embouteillage en ville, travail tard sur ordinateur |
| 3 | Et si c'était le savoir qui venait à vous ? | porte d'entrée qui s'ouvre, accueil |
| 4 | Un enseignant vient chez vous, à Dakar… | enfant qui lit avec un enseignant, cours à la maison |
| 5 | Le cours se fait en ligne, depuis n'importe quel pays | appel vidéo, cours en ligne sur ordinateur/tablette |
| 6 | Lecture, tajwid, mémorisation, langue arabe | gros plans : lecture du Coran, écriture arabe |
| 7 | Une vague de connaissances, sur votre canapé | famille au salon, moment chaleureux |
| 8 | Écrivez-nous sur WhatsApp | téléphone / message ; logo + numéro + QR code |

Recherche avec planche d'aperçus (la clé Pexels est injectée par le proxy de l'environnement cloud ;
en local, remplacer `proxy-injected` par la clé dans `tools/search.py`) :

```bash
python tools/search.py /tmp/pexels "quran reading" "traffic jam" "video call online class"
```

Règles : figurants de banque d'images uniquement (ne jamais les présenter comme élèves ou enseignants d'Alif),
tenues et cadres sobres, crédits Pexels respectés.

## Outils (`tools/`)

- `tts.py` — voix off par scène (Piper, pauses entre les phrases) ; modèle via `PIPER_MODEL`.
- `words.py` — horodatage mot à mot (faster-whisper).
- `timeline.py` — alignement script/voix, `timeline.json`, `narration.m4a` (compression + normalisation -15 LUFS).
- `preview.js` / `render.js` — aperçus PNG / rendu MP4 avec Playwright + ffmpeg.
- `search.py` — recherche Pexels + planche d'aperçus numérotés.
- `piper_tts_server.py` — petit serveur compatible OpenAI `/v1/audio/speech` pour brancher Piper sur
  MoneyPrinterTurbo (fournisseur « kokoro », `base_url = http://127.0.0.1:8880/v1`).

## Pub 4 — « Vous parlez arabe sans le savoir » (sans voix off)

Texte à l'écran seulement, sur le fond sonore fourni par ALIF (`fond-sonore-56s.m4a` : boucle de 60 s coupée à 56 s,
fondus d'entrée/sortie). Les changements de texte sont calés sur les respirations de la piste (pics mesurés toutes les
3,3 s / 4 s : 2.3, 5.6, 9.6, 12.9 … s, constante `P` dans `index.html`). Les fonds (particules dorées, vapeur de café,
rayons de lumière, motif géométrique, bokeh) sont générés en temps réel sur canvas, sans images d'archive.

```bash
node ../tools/render.js "$PWD" "$PWD/fond-sonore-56s.m4a" "$PWD/video.mp4" 30
```

## Pub 5 — « Vous parlez arabe sans le savoir », voix off « professeur »

Même animation que la pub 4, recalée sur une voix off (Piper Tom, `tts_voix_prof.py` : débit un peu plus lent,
pauses de 0,45 s). Traitement de la voix (ffmpeg) : -4 % de hauteur sans changer le débit, chaleur dans les graves,
présence vers 3 kHz, compression légère et petite réverbération de pièce :

```
aresample=48000,asetrate=48000*0.96,aresample=48000,atempo=1.0416667,lowshelf=f=140:g=3.5,
equalizer=f=320:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1.5:g=2.5,highshelf=f=9000:g=-2,
acompressor=threshold=-22dB:ratio=3:attack=8:release=150:makeup=2,aecho=0.85:0.6:38|67:0.12|0.07
```

Les mots arabes sont écrits phonétiquement pour la voix (`tts_script.json` : soukkar, kahwa, koutn, makhazine,
Ouatsappe) et correctement à l'écran. Le fond sonore ALIF passe sous la voix (`mix.m4a`, compression déclenchée
par la voix + volume 55 %).

## Pub 6 — « La magie des racines » (sans voix off)

Racine ك ت ب (K-T-B) et cinq mots : kataba, kitâb, kâtib, maktab, maktaba. Dans chaque mot, les lettres de la racine
sont en or (`<b>` dans le texte arabe, la liaison des lettres est conservée par Chromium) et les lettres ajoutées en crème.
Fonds générés sur canvas : gouttes d'encre qui éclosent dans l'eau (ralenti), fumée verte, particules dorées,
texture papier (séquence « plus vite qu'on ne croit »). Rythme calé sur les respirations du fond sonore (constante `P`).
