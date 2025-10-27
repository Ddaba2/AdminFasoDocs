import { Component } from '@angular/core';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

/**
 * Composant de layout principal de l'application
 *
 * Ce composant gère la structure globale de l'application après connexion:
 * - Sidebar de navigation sur la gauche
 * - Header avec le label "Admin"
 * - Zone de contenu principal pour les composants enfants
 *
 * Le composant surveille les changements de route pour mettre à jour
 * l'élément actif dans la sidebar
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  /**
   * Constructeur du composant Layout
   * @param router - Router Angular pour la navigation et le suivi des événements
   * @param authService - Service d'authentification pour la déconnexion
   */
  constructor(private router: Router, private authService: AuthService) {
    // Surveille les changements de route pour mettre à jour la page active
    // Cela permet de mettre en surbrillance l'élément de menu actif
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.url;
      // Détermine quelle page est active en fonction de l'URL
      if (url.includes('/users')) this.activePage = 'users';
      else if (url.includes('/languages')) this.activePage = 'languages';
      else if (url.includes('/categories')) this.activePage = 'categories';
      else if (url.includes('/subcategories')) this.activePage = 'subcategories';
      else if (url.includes('/procedures')) this.activePage = 'procedures';
      else if (url.includes('/downloads')) this.activePage = 'downloads';
      else this.activePage = 'users'; // Page par défaut
    });
  }

  // Page active dans la sidebar (pour la mise en surbrillance CSS)
  activePage = 'users';

  /**
   * Déconnecte l'utilisateur
   * Appelle le service d'authentification pour gérer la déconnexion
   */
  logout() {
    this.authService.logout();
  }
}

