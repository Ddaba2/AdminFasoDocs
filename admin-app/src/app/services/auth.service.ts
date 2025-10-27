import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Service d'authentification pour gérer l'état de connexion des utilisateurs
 * Ce service gère:
 * - La vérification de l'état de connexion
 * - La protection des routes (guard)
 * - La déconnexion des utilisateurs
 *
 * Utilise sessionStorage pour stocker les informations de session côté navigateur
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * Constructeur du service d'authentification
   * @param router - Router d'Angular pour la navigation
   * @param platformId - ID de la plateforme (browser/server) pour vérifier l'environnement
   */
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Vérifie si l'utilisateur est actuellement connecté
   * Vérifie la présence du token et du flag isLoggedIn dans sessionStorage
   *
   * @returns true si l'utilisateur est connecté, false sinon
   */
  isLoggedIn(): boolean {
    // Retourne false côté serveur (SSR)
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    try {
      const token = sessionStorage.getItem('token');
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      // Retourne true seulement si le token ET le flag isLoggedIn sont présents
      return !!(token && isLoggedIn === 'true');
    } catch (e) {
      console.warn('sessionStorage not available:', e);
      return false;
    }
  }

  /**
   * Guard pour protéger les routes nécessitant une authentification
   * Redirige vers /login si l'utilisateur n'est pas connecté
   *
   * @returns true si l'utilisateur peut accéder à la route, false sinon
   */
  canActivate(): boolean {
    if (this.isLoggedIn()) {
      return true;
    } else {
      // Redirection vers la page de login uniquement côté browser
      if (isPlatformBrowser(this.platformId)) {
        this.router.navigate(['/login']);
      }
      return false;
    }
  }

  /**
   * Déconnecte l'utilisateur en supprimant toutes les données de session
   * Supprime:
   * - Le token JWT
   * - Le flag isLoggedIn
   * - Le nom d'utilisateur
   *
   * Puis redirige vers la page de login
   */
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        // Nettoyage de toutes les données de session
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('username');
      } catch (e) {
        console.warn('sessionStorage not available:', e);
      }
      // Redirection vers la page de login
      this.router.navigate(['/login']);
    }
  }
}
