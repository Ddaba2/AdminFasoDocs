# Checklist de Tests Complets - FasoDocs Admin

## ✅ Configuration Backend

### URL de l'API
- [ ] Vérifier que l'URL dans `api.service.ts` correspond à votre backend
  - Actuelle: `http://localhost:8080/api`
  - À changer si votre backend est sur un autre port/hôte

### Endpoints Backend requis
- [ ] GET `/api/categories` - Liste des catégories
- [ ] POST `/api/categories` - Créer catégorie (Admin)
- [ ] GET `/api/sous-categories` - Liste des sous-catégories
- [ ] POST `/api/sous-categories` - Créer sous-catégorie (Admin)
- [ ] GET `/api/procedures` - Liste des procédures
- [ ] POST `/api/procedures` - Créer procédure (Admin)
- [ ] GET `/api/users` - Liste des utilisateurs **⚠️ À CRÉER dans votre backend**
- [ ] POST `/api/auth/connexion` - Connexion admin

---

## 🔐 Test 1: Page de Connexion

### 1.1 Affichage
- [ ] La page de connexion s'affiche correctement
- [ ] Le logo FasoDocs est visible
- [ ] Les champs nom d'utilisateur et mot de passe sont présents
- [ ] Le bouton "Se connecter" est présent
- [ ] Pas de couleurs vives (tout en gris/blanc/noir)

### 1.2 Fonctionnalité
- [ ] Connexion sans identifiants affiche un message d'erreur
- [ ] Connexion avec identifiants corrects redirige vers `/users`
- [ ] Le token est stocké dans sessionStorage
- [ ] Le message d'erreur s'affiche en cas de mot de passe incorrect

---

## 👥 Test 2: Page Utilisateurs

### 2.1 Affichage
- [ ] La table des utilisateurs s'affiche
- [ ] Les colonnes sont: ID, Nom, Email, Numéro, Rôle
- [ ] Les données proviennent du backend (pas de données statiques)
- [ ] Le message "Chargement..." s'affiche pendant le chargement

### 2.2 Données affichées
- [ ] Tous les utilisateurs sont affichés (y compris les admins)
- [ ] Les admins ont le rôle "ADMIN"
- [ ] Les utilisateurs normaux ont le rôle "USER" ou "Utilisateur"
- [ ] En cas d'erreur, un message d'erreur s'affiche

---

## 📋 Test 3: Page Procédures

### 3.1 Formulaire
- [ ] Tous les champs sont présents
- [ ] Les champs catégorie, sous-catégorie et centre sont en input (pas select)
- [ ] Le formulaire est fonctionnel

### 3.2 Création de procédure
- [ ] Soumission avec champs remplis envoie les données au backend
- [ ] Message de succès s'affiche après création réussie
- [ ] Message d'erreur s'affiche en cas d'échec
- [ ] Le formulaire se réinitialise après succès

### 3.3 Données envoyées
Structure JSON envoyée:
```json
{
  "nom": "Nom de la procédure",
  "titre": "Nom de la procédure",
  "description": "Description",
  "delai": "5 Jours",
  "categorieId": "ID de la catégorie",
  "sousCategorieId": "ID de la sous-catégorie",
  "centreTraitement": "Nom du centre",
  "cout": null,
  "documentsRequis": [],
  "etapes": [],
  "referencesLegales": []
}
```

---

## 🔧 Test 4: Sidebar et Navigation

### 4.1 Affichage
- [ ] Le logo FasoDocs est visible
- [ ] Le texte "FasoDocs" est visible
- [ ] Les 6 liens de navigation sont présents:
  - Utilisateurs
  - Langues
  - Catégories
  - Sous-catégories
  - Procédures
  - Téléchargement

### 4.2 Navigation
- [ ] Le lien actif est surligné en vert
- [ ] Cliquer sur un lien navigue vers la bonne page
- [ ] La sidebar reste fixe, le contenu scrollable

---

## 🎨 Test 5: Styles et Apparence

### 5.1 CSS
- [ ] Tous les fichiers sont en `.css` (pas `.scss`)
- [ ] Pas de syntaxe SCSS (imbrication, &)
- [ ] Les styles s'appliquent correctement

### 5.2 Couleurs
- [ ] Page de login: fond gris clair, bouton gris foncé
- [ ] Sidebar: fond blanc, liens en noir, actif en vert (#6CC644)
- [ ] Pas de couleurs vives

---

## 🔍 Test 6: Authentification et Sécurité

### 6.1 Token
- [ ] Le token JWT est stocké dans sessionStorage
- [ ] Le token est envoyé dans les en-têtes de toutes les requêtes API
- [ ] Format: `Authorization: Bearer <token>`

### 6.2 Protection des routes
- [ ] Sans connexion, redirection vers `/login`
- [ ] Après connexion, accès aux pages admin

---

## 📱 Test 7: Responsive (bonus)

### 7.1 Mobiles
- [ ] La sidebar s'adapte sur mobile
- [ ] Les tableaux sont scrollables horizontalement
- [ ] Les formulaires sont utilisables

---

## ⚠️ Problèmes à vérifier

### Backend
1. **Endpoint `/api/users` manquant**: Vous devez créer cet endpoint dans votre backend
2. **Format de réponse**: Vérifiez que les réponses API correspondent aux structures attendues
3. **CORS**: Assurez-vous que CORS est configuré pour autoriser `http://localhost:4200`

### Données
1. Vérifier que les champs retournés par l'API correspondent aux champs affichés
2. Gérer les cas où certains champs sont `null` ou `undefined`

---

## 🧪 Tests à exécuter

### Exécutez ces scénarios:

1. **Connexion Admin**
   - Se connecter avec un compte admin
   - Vérifier la redirection vers /users
   - Vérifier que le token est stocké

2. **Affichage des utilisateurs**
   - Vérifier que tous les utilisateurs s'affichent
   - Vérifier que les admins sont inclus

3. **Création d'une procédure**
   - Remplir le formulaire de procédure
   - Soumettre le formulaire
   - Vérifier que la procédure est créée dans le backend

4. **Navigation**
   - Naviguer entre les différentes pages
   - Vérifier que les liens actifs sont surlignés

---

## 📝 Notes importantes

1. **URL de l'API**: Modifiez `API_URL` dans `api.service.ts` selon votre backend
2. **Endpoint users**: Créez l'endpoint GET `/api/users` dans votre backend
3. **Structure des données**: Adaptez les champs selon la structure réelle de votre API

---

## ✅ Validation finale

- [ ] Application démarre sans erreur
- [ ] Connexion fonctionne
- [ ] Navigation entre les pages fonctionne
- [ ] Appels API fonctionnent
- [ ] Pas de données statiques affichées
- [ ] Toutes les couleurs vives sont supprimées
