# Guide de Test - Upload Multiple de Documents

## 📋 Résumé de la Fonctionnalité

Cette fonctionnalité permet aux prestataires d'ajouter plusieurs documents à la fois à leurs projets, avec support pour :

- **Drag & Drop** de fichiers multiples
- **Sélection de type** pour chaque document (devis, facture, rapport, photo, vidéo, autre)
- **Description optionnelle** pour chaque fichier
- **Barre de progression** pour chaque upload
- **Validation des fichiers** (taille, type, nombre maximum)

## 🚀 Instructions de Test

### 1. Prérequis

- Laravel backend démarré sur `http://127.0.0.1:8000`
- React frontend démarré sur `http://127.0.0.1:8081`
- Un compte prestataire existant
- Un projet créé par ce prestataire

### 2. Test via Interface Web (Recommandé)

1. **Connectez-vous** en tant que prestataire
2. **Naviguez** vers la page de détail d'un de vos projets
3. Dans la section **Documents**, vous verrez maintenant :
   - Bouton "Ajouter un document" (upload simple)
   - **Nouveau bouton vert "Upload multiple"**
4. **Cliquez** sur "Upload multiple"
5. **Glissez-déposez** plusieurs fichiers ou cliquez pour les sélectionner
6. **Configurez** chaque fichier :
   - Sélectionnez le type de document
   - Ajoutez une description (optionnelle)
7. **Cliquez** sur "Télécharger" pour lancer l'upload

### 3. Test via Page de Test Direct

Ouvrez : `http://127.0.0.1:8000/test-multiple-upload.html`

Cette page permet de tester directement l'API sans passer par l'interface React.

### 4. Vérifications à Effectuer

#### ✅ Fonctionnalités à Tester

- [ ] **Upload de fichiers multiples** (2-10 fichiers)
- [ ] **Différents types de fichiers** (PDF, images, vidéos)
- [ ] **Validation des tailles** (fichiers > 50MB rejetés)
- [ ] **Types de documents** (devis, facture, rapport, photo, vidéo, autre)
- [ ] **Descriptions personnalisées** pour chaque fichier
- [ ] **Gestion d'erreurs** (fichiers trop gros, formats non supportés)
- [ ] **Progression d'upload** affichée correctement
- [ ] **Rechargement de la liste** après upload réussi

#### ⚠️ Cas d'Erreurs à Tester

- [ ] Upload sans être connecté → Erreur 401
- [ ] Upload sur projet d'un autre prestataire → Erreur 403
- [ ] Fichiers trop volumineux → Erreur de validation
- [ ] Types de fichiers non supportés → Erreur de validation
- [ ] Plus de 10 fichiers → Erreur de validation

## 🛠️ Détails Techniques

### API Endpoints

```
POST /api/projects/{project}/documents/multiple
GET /api/projects/{project}/documents
DELETE /api/documents/{document}
```

### Structure des Données

```php
// Request
FormData:
- files[0] → File
- types[0] → string (devis|facture|rapport|photo|video|autre)
- descriptions[0] → string (optionnel)

// Response
{
  "message": "Documents uploaded successfully",
  "uploaded_count": 3,
  "documents": [...]
}
```

### Validation

- **Nombre maximum** : 10 fichiers par upload
- **Taille maximum** : 50MB par fichier
- **Types acceptés** : PDF, DOC, DOCX, images, vidéos
- **Authentification** : Token Bearer requis
- **Autorisation** : Propriétaire du projet uniquement

## 🗂️ Fichiers Modifiés/Créés

### Backend

- `app/Http/Controllers/Api/MultipleDocumentUploadController.php` ✨ **NOUVEAU**
- `routes/api.php` → Ajout des routes d'upload multiple
- `public/storage/uploads/documents/` → Dossier de stockage

### Frontend

- `components/MultipleDocumentUpload.tsx` ✨ **NOUVEAU**
- `pages/prestataire/PrestataireProjectDetail.tsx` → Intégration du composant

### Test

- `public/test-multiple-upload.html` ✨ **NOUVEAU** → Page de test standalone

## 📊 Scénarios de Test Détaillés

### Scénario 1 : Upload Basique

1. Sélectionner 3 fichiers PDF
2. Assigner types : devis, facture, rapport
3. Ajouter descriptions
4. Vérifier upload réussi

### Scénario 2 : Upload Mixte

1. Sélectionner : 1 PDF, 2 images, 1 vidéo
2. Types appropriés pour chaque fichier
3. Vérifier affichage correct dans la liste

### Scénario 3 : Gestion d'Erreurs

1. Tenter d'uploader 15 fichiers → Erreur
2. Fichier de 100MB → Erreur
3. Projet inexistant → Erreur 404

## 🔍 Débogage

### Logs à Vérifier

- **Laravel** : `storage/logs/laravel.log`
- **Navigateur** : Console JavaScript pour erreurs frontend
- **Réseau** : Onglet Network des DevTools pour requêtes API

### Points de Vérification

- Permissions des dossiers de stockage
- Configuration de taille d'upload PHP (`php.ini`)
- Token d'authentification valide
- CORS configuré pour les uploads

## 🎯 Critères de Succès

- ✅ Upload de plusieurs documents simultanément
- ✅ Interface intuitive avec drag & drop
- ✅ Validation robuste des fichiers
- ✅ Messages d'erreur clairs
- ✅ Intégration transparente avec la liste existante
- ✅ Performances acceptables (< 30s pour 10 fichiers de 10MB)

---

**Note** : Cette fonctionnalité étend le système d'upload existant pour répondre à la demande du client de pouvoir "ajouter plusieurs documents en même temps au projet".
