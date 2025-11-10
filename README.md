# FasoDocs Admin - Application d'Administration

## 📋 Description

FasoDocs Admin est une application web d'administration pour gérer le contenu de l'application mobile FasoDocs. Cette interface permet aux administrateurs de gérer les procédures administratives, catégories, sous-catégories et utilisateurs du système.

## 🚀 Technologies Utilisées

- **Framework**: Angular 20.1.0
- **Langage**: TypeScript 5.8.2
- **Serveur de développement**: Angular CLI + Express
- **Architecture**: Standalone Components (sans NgModules)
- **Authentification**: JWT (JSON Web Tokens) + SMS OTP
- **Communication**: HTTP Client avec RxJS
- **Rendu**: Support SSR (Server-Side Rendering)

## 🏗️ Architecture de l'Application

### Structure des Dossiers

```
admin-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── layout/              # Layout principal avec sidebar
│   │   ├── pages/
│   │   │   ├── login/               # Connexion par téléphone
│   │   │   ├── code-verification/   # Vérification du code SMS
│   │   │   ├── users/               # Gestion des utilisateurs
│   │   │   ├── categories/          # Gestion des catégories
│   │   │   ├── subcategories/       # Gestion des sous-catégories
│   │   │   ├── procedures/          # Gestion des procédures
│   │   │   ├── languages/           # Gestion des langues
│   │   │   └── downloads/           # Gestion des téléchargements
│   │   ├── services/
│   │   │   ├── api.service.ts       # Service principal API
│   │   │   ├── auth.service.ts      # Service d'authentification
│   │   │   ├── storage.service.ts   # Service de stockage sécurisé
│   │   │   ├── data-cache.service.ts # Service de cache
│   │   │   └── dialog.service.ts    # Service pour les dialogues
│   │   ├── app.routes.ts            # Configuration des routes
│   │   └── app.config.ts            # Configuration globale
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── package.json
├── angular.json
├── tsconfig.json
└── start.bat                        # Script de démarrage Windows
```

## 📦 Installation

### Prérequis

- Node.js (version 18 ou supérieure)
- npm (généralement inclus avec Node.js)
- Backend Spring Boot FasoDocs démarré sur le port 8080

### Installation des dépendances

```bash
cd admin-app
npm install
```

## 🎮 Démarrage de l'Application

### Option 1: Utiliser le script de démarrage (Windows)

Depuis le dossier racine `Admin`:
```bash
start.bat
```

### Option 2: Ligne de commande

```bash
cd admin-app
npm start
```

L'application sera accessible sur: **http://localhost:4200**

### Option 3: Build de production

```bash
npm run build
```

Les fichiers de build seront générés dans le dossier `dist/`.

## 🔐 Système d'Authentification

### Flux d'Authentification

1. **Saisie du numéro de téléphone** (`/phone-input`)
   - L'utilisateur entre son numéro de téléphone
   - Requête POST à `/api/auth/connexion-telephone`
   - Le backend envoie un code SMS à 4 chiffres

2. **Vérification du code SMS** (`/sms-code`)
   - L'utilisateur entre le code reçu par SMS
   - Requête POST à `/api/auth/verifier-sms`
   - Le backend retourne un token JWT si le code est valide

3. **Accès aux ressources protégées**
   - Le token JWT est stocké dans sessionStorage
   - Toutes les requêtes API incluent le token dans le header `Authorization: Bearer {token}`
   - Le guard `AuthService.canActivate()` protège les routes

### Protection des Routes

Toutes les routes sous le `LayoutComponent` sont protégées par le guard d'authentification:
```typescript
canActivate: [() => {
  const authService = inject(AuthService);
  return authService.canActivate();
}]
```

## 🗺️ Routes de l'Application

| Route | Composant | Description | Protection |
|-------|-----------|-------------|-----------|
| `/` | - | Redirection vers `/phone-input` | ❌ |
| `/phone-input` | PhoneInputComponent | Saisie du téléphone | ❌ |
| `/sms-code` | CodeVerificationComponent | Vérification du code SMS | ❌ |
| `/users` | UsersListComponent | Liste des utilisateurs | ✅ |
| `/users/add` | AddUserComponent | Ajout d'un utilisateur | ✅ |
| `/categories` | CategoriesComponent | Gestion des catégories | ✅ |
| `/categories/add` | AddCategory | Ajout d'une catégorie | ✅ |
| `/subcategories` | SubcategoriesComponent | Gestion des sous-catégories | ✅ |
| `/subcategories/add` | AddSubcategory | Ajout d'une sous-catégorie | ✅ |
| `/procedures` | ProceduresComponent | Gestion des procédures | ✅ |
| `/procedures/add` | AddProcedure | Ajout d'une procédure | ✅ |
| `/procedures/edit/:id` | EditProcedure | Édition d'une procédure | ✅ |
| `/languages` | LanguagesComponent | Gestion des langues | ✅ |
| `/downloads` | DownloadsComponent | Gestion des téléchargements | ✅ |

## 🎨 Fonctionnalités Principales

### 1. Gestion des Utilisateurs
- ✅ Affichage de la liste des utilisateurs
- ✅ Ajout de nouveaux utilisateurs
- ✅ Modification des utilisateurs existants
- ✅ Suppression d'utilisateurs
- ✅ Attribution des rôles (ADMIN, USER)

### 2. Gestion des Catégories
- ✅ Affichage de la liste des catégories
- ✅ Ajout de nouvelles catégories
- ✅ Édition inline dans le tableau
- ✅ Suppression avec confirmation
- ✅ Affichage du nombre de sous-catégories liées

### 3. Gestion des Sous-Catégories
- ✅ Affichage de la liste des sous-catégories
- ✅ Ajout de nouvelles sous-catégories
- ✅ Association avec une catégorie parent
- ✅ Édition inline dans le tableau
- ✅ Suppression avec confirmation
- ✅ Affichage de la catégorie parent

### 4. Gestion des Procédures
- ✅ Affichage de la liste des procédures
- ✅ Ajout de nouvelles procédures complexes
- ✅ Modification des procédures
- ✅ Suppression avec confirmation
- ✅ Gestion des relations:
  - Sous-catégorie parent
  - Centres (multiples)
  - Coûts (multiples)
  - Délais
  - Documents nécessaires
  - Étapes de la procédure

### 5. Interface Utilisateur
- ✅ Sidebar responsive avec navigation
- ✅ Header avec information utilisateur et bouton déconnexion
- ✅ Tableaux interactifs avec édition inline
- ✅ Dialogues de confirmation pour les suppressions
- ✅ Messages d'erreur et de succès
- ✅ Design moderne et ergonomique

## 🔧 Services Principaux

### ApiService (`api.service.ts`)
Service central pour toutes les communications avec le backend.

**Endpoints disponibles:**
- Authentification: `/api/auth/*`
- Catégories: `/api/admin/categories`
- Sous-catégories: `/api/admin/sous-categories`
- Procédures: `/api/admin/procedures`
- Utilisateurs: `/api/admin/utilisateurs`
- Centres: `/api/centres`
- Coûts: `/api/couts`

### AuthService (`auth.service.ts`)
Gestion de l'authentification et de la session utilisateur.

**Méthodes principales:**
- `isLoggedIn()`: Vérifie si l'utilisateur est connecté
- `canActivate()`: Guard pour protéger les routes
- `logout()`: Déconnexion et nettoyage de la session

### StorageService (`storage.service.ts`)
Gestion sécurisée du stockage (sessionStorage).

**Caractéristiques:**
- Compatible SSR (Server-Side Rendering)
- Gestion des erreurs de stockage
- API uniforme pour toutes les opérations

### DataCacheService (`data-cache.service.ts`)
Cache des données pour optimiser les performances.

**Fonctionnalités:**
- Mise en cache des catégories
- Mise en cache des sous-catégories
- Invalidation automatique du cache

## 🔄 Flux de Données

```
┌─────────────────┐
│   Component     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐       ┌──────────────────┐
│   ApiService    │◄─────►│  Backend API     │
└────────┬────────┘       │  (Spring Boot)   │
         │                │  Port 8080       │
         ▼                └──────────────────┘
┌─────────────────┐
│ StorageService  │
│ (sessionStorage)│
└─────────────────┘
```

## ⚙️ Configuration

### URL du Backend

L'URL du backend est définie dans `api.service.ts`:
```typescript
const API_URL = 'http://localhost:8080/api';
```

Pour changer l'URL du backend, modifiez cette constante.

### CORS

Le backend Spring Boot doit être configuré pour accepter les requêtes depuis `http://localhost:4200`.

## 🐛 Débogage

### Problèmes Courants

1. **Erreur de connexion au backend**
   - Vérifiez que le backend Spring Boot est démarré sur le port 8080
   - Vérifiez la configuration CORS du backend

2. **Erreur "Token expired"**
   - Déconnectez-vous et reconnectez-vous
   - Le token JWT a une durée de validité limitée

3. **Erreur de stockage (Storage error)**
   - Vérifiez que le navigateur autorise sessionStorage
   - Mode navigation privée peut causer des problèmes

4. **Page blanche au démarrage**
   - Vérifiez la console du navigateur pour les erreurs
   - Vérifiez que toutes les dépendances sont installées (`npm install`)

## 📝 Scripts NPM Disponibles

| Script | Commande | Description |
|--------|----------|-------------|
| start | `npm start` | Démarre le serveur de développement (port 4200) |
| build | `npm run build` | Build de production |
| watch | `npm run watch` | Build en mode watch (développement) |
| serve:ssr | `npm run serve:ssr:admin-app` | Démarre le serveur SSR |

## 🔒 Sécurité

### Bonnes Pratiques Implémentées

- ✅ JWT pour l'authentification
- ✅ Authentification à deux facteurs (SMS OTP)
- ✅ Protection des routes sensibles
- ✅ Stockage sécurisé des tokens
- ✅ Headers Authorization sur toutes les requêtes API
- ✅ Vérification du rôle ADMIN pour accéder à l'interface

### Recommandations

- ⚠️ Utilisez HTTPS en production
- ⚠️ Configurez des tokens JWT avec expiration courte
- ⚠️ Implementez un refresh token en production
- ⚠️ Limitez les tentatives de connexion
- ⚠️ Validez toutes les entrées utilisateur côté backend

## 📚 Documentation Complémentaire

Pour plus de détails sur l'intégration avec le backend, consultez le fichier:
**[INTEGRATION_BACKEND.md](./INTEGRATION_BACKEND.md)**

## 🤝 Contribution

Pour contribuer au projet:
1. Respectez la structure des dossiers existante
2. Utilisez des Standalone Components
3. Commentez le code de manière claire
4. Testez vos modifications avant de commiter

## 📞 Support

Pour toute question ou problème, contactez l'équipe de développement FasoDocs.

---

**Version**: 1.0.0  
**Dernière mise à jour**: Novembre 2025  
**Développé pour**: FasoDocs Admin Platform

