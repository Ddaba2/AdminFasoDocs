import { Routes } from '@angular/router';

/**
 * Configuration des routes de l'application admin
 *
 * Structure:
 * - Route racine (/) redirige vers /login
 * - Route /login charge le composant de connexion
 * - Routes protégées sous le LayoutComponent (sidebar + header)
 *   - /users : Gestion des utilisateurs
 *   - /languages : Gestion des langues
 *   - /categories : Gestion des catégories
 *   - /subcategories : Gestion des sous-catégories
 *   - /procedures : Gestion des procédures
 *   - /downloads : Gestion des téléchargements
 *
 * Note: Les routes enfants utilisent le lazy loading pour optimiser les performances
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'languages',
        loadComponent: () => import('./pages/languages/languages.component').then(m => m.LanguagesComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'subcategories',
        loadComponent: () => import('./pages/subcategories/subcategories.component').then(m => m.SubcategoriesComponent)
      },
      {
        path: 'procedures',
        loadComponent: () => import('./pages/procedures/procedures.component').then(m => m.ProceduresComponent)
      },
      {
        path: 'downloads',
        loadComponent: () => import('./pages/downloads/downloads.component').then(m => m.DownloadsComponent)
      }
    ]
  }
];
