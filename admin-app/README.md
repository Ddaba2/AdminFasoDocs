# FasoDocs Admin Panel

Application Angular pour l'administration de FasoDocs, reproduisant fidèlement les pages d'interface administratives.

## Pages implémentées

### 1. Liste des utilisateurs (`/users`)
Affiche un tableau avec tous les utilisateurs du système, incluant :
- ID
- Numéro de téléphone
- Email
- Rôle (Admin/Utilisateur)

### 2. Langues (`/languages`)
Gestion des langues disponibles dans le système :
- Liste des langues avec leur code
- Statut (Active/Inactive)
- Actions de modification et suppression
- Bouton pour ajouter une nouvelle langue

### 3. Catégories (`/categories`)
Formulaire pour ajouter une nouvelle catégorie :
- Champ de saisie pour le nom de la catégorie
- Boutons Ajouter et Annuler

### 4. Sous-catégories (`/subcategories`)
Formulaire pour ajouter une sous-catégorie :
- Sélection de la catégorie parente
- Nom de la sous-catégorie
- Bouton Ajouter

### 5. Procédures (`/procedures`)
Formulaire complet pour ajouter une nouvelle procédure, organisé en sections :
- **Information générales** : Nom, catégorie, sous-catégorie
- **Etapes à suivre** : Nom, niveau, description
- **Documents requis** : Nom, obligatoire, description
- **Délai de traitement** : Durée et unité
- **Centres de traitements** : Sélection du centre
- **Référence de loi** : Texte ou référence légale
- Bouton de sauvegarde fixe en bas à droite

### 6. Historique de téléchargement (`/downloads`)
Tableau affichant l'historique des téléchargements :
- Email de l'utilisateur
- Date de téléchargement
- Statut (Complet, En cours, Arrêter)

## Structure du projet

```
admin-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── layout/           # Composant layout avec sidebar
│   │   ├── pages/
│   │   │   ├── users/            # Page utilisateurs
│   │   │   ├── languages/        # Page langues
│   │   │   ├── categories/       # Page catégories
│   │   │   ├── subcategories/    # Page sous-catégories
│   │   │   ├── procedures/       # Page procédures
│   │   │   └── downloads/        # Page téléchargements
│   │   ├── app.routes.ts         # Configuration des routes
│   │   └── app.ts                # Composant racine
│   └── styles.scss               # Styles globaux
```

## Navigation

La sidebar de navigation inclut :
- Logo FasoDocs avec les couleurs du Mali (vert, jaune, rouge)
- Menu de navigation avec les items suivants :
  - Utilisateurs
  - Langues
  - Catégories
  - Téléchargement

## Couleurs principales

- **Vert principal** : `#6CC644` (boutons actifs, accents)
- **Fond gris clair** : `#F8F8F8`
- **Texte foncé** : `#333`
- **Bordures** : `#E0E0E0`

## Démarrage

```bash
npm start
```

L'application sera accessible sur `http://localhost:4200`

## Dépendances principales

- Angular 20.1.0
- Angular Router
- Angular Forms
- RxJS
