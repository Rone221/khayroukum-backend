# Publicité vidéo — « Fragments d'un rescapé » (YassMina)

Deux versions (1080×1920, 65 s, mêmes images) :
- `videos-test/fragments-d-un-rescape-voix-off.mp4` — voix off masculine de bande-annonce + musique ;
- `videos-test/fragments-d-un-rescape-musique.mp4` — musique seule.

Concept : la fragmentation de la couverture. Les phrases du 4e de couverture se fissurent puis volent en éclats ;
l'illustration (agrandie ×4 avec Real-ESRGAN) s'anime, des fragments se détachent du corps de l'homme ;
les éclats se rassemblent pour former le titre au moment de l'impact musical ; maquette du livre (face avant
seulement — la tranche de la maquette contient la coquille « MCCAPÉ »), photo réelle, appel à précommander.

- `index.html` : animation (canvas 2D), calée sur `timeline.json` (horodatage Whisper de la voix off).
- `score.py` : musique originale synthétisée (ré mineur : battements de cœur, nappes, piano, montée, impact sur le titre).
- `tts.py` / `retake.py` : voix off (Piper « tom », plus grave, réverbération) ; `retake.py` refait une prise tant que
  la transcription ne contient pas les mots attendus (« avoir mal », « indemne », « Yass Mina »).
- Rendu : servir le dossier en http (lecture des pixels de l'image), puis
  `node ../tools/gl.js render http://127.0.0.1:8770/index.html video.mp4 x 30` et assembler avec `mix_vo.m4a` ou `mix_music.m4a`.

À vérifier avant diffusion : numéro de contact (75 635 30 60 lu sur la photo du dos du livre ; une autre photo
semble indiquer 75 835 30 60) et date de clôture des précommandes (5 décembre).
