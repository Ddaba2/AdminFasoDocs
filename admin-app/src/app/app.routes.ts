import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

/**
 * Configuration des routes de l'application admin
 *
 * Structure:
 * - Route racine (/) redirige vers /phone-input
 * - Route /phone-input charge le composant de saisie du numéro de téléphone
 * - Route /sms-code charge le composant de saisie du code SMS
 * - Routes protégées sous le LayoutComponent (sidebar + header)
 *   - /users : Gestion des utilisateurs
 *   - /users/add : Ajout d'un utilisateur
 *   - /languages : Gestion des langues
 *   - /categories : Liste + Édition inline + Suppression des catégories
 *   - /categories/add : Ajout d'une catégorie
 *   - /subcategories : Liste + Édition inline + Suppression des sous-catégories
 *   - /subcategories/add : Ajout d'une sous-catégorie
 *   - /procedures : Liste + Édition inline + Suppression des procédures
 *   - /procedures/add : Ajout d'une procédure
 *   - /downloads : Gestion des téléchargements
 *
 * Note: Les routes enfants utilisent le lazy loading pour optimiser les performances
 * Note: L'édition se fait désormais inline dans les tableaux (pas de page edit séparée)
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/phone-input',
    pathMatch: 'full'
  },
  {
    path: 'phone-input',
    loadComponent: () => import('./pages/login/phone-input.component').then(m => m.PhoneInputComponent)
  },
  {
    path: 'sms-code',
    loadComponent: () => import('./pages/code-verification/code-verification.component').then(m => m.CodeVerificationComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [() => {
      const authService = inject(AuthService);
      return authService.canActivate();
    }],
    children: [
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users-list/users-list.component').then(m => m.UsersListComponent)
      },
      {
        path: 'users/add',
        loadComponent: () => import('./pages/users/add-user/add-user').then(m => m.AddUserComponent)
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
        path: 'categories/add',
        loadComponent: () => import('./pages/categories/add-category/add-category').then(m => m.AddCategory)
      },
      {
        path: 'subcategories',
        loadComponent: () => import('./pages/subcategories/subcategories.component').then(m => m.SubcategoriesComponent)
      },
      {
        path: 'subcategories/add',
        loadComponent: () => import('./pages/subcategories/add-subcategory/add-subcategory').then(m => m.AddSubcategory)
      },
      {
        path: 'procedures',
        loadComponent: () => import('./pages/procedures/procedures.component').then(m => m.ProceduresComponent)
      },
      {
        path: 'procedures/add',
        loadComponent: () => import('./pages/procedures/add-procedure/add-procedure').then(m => m.AddProcedure)
      },
      {
        path: 'downloads',
        loadComponent: () => import('./pages/downloads/downloads.component').then(m => m.DownloadsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  }
];
