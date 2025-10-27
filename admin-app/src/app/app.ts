import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Composant racine de l'application admin
 *
 * Ce composant sert de point d'entrée principal de l'application Angular.
 * Il contient le RouterOutlet qui affiche les composants selon la route active.
 *
 * Structure de l'application:
 * - LoginComponent: Page de connexion (route /login)
 * - LayoutComponent: Layout avec sidebar et header pour les pages protégées
 *   - UsersComponent (route /users)
 *   - LanguagesComponent (route /languages)
 *   - CategoriesComponent (route /categories)
 *   - SubcategoriesComponent (route /subcategories)
 *   - ProceduresComponent (route /procedures)
 *   - DownloadsComponent (route /downloads)
 *
 * Le titre de l'application est défini ici comme 'admin-app'
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Titre de l'application (signal Angular pour la réactivité)
  protected readonly title = signal('admin-app');
}
