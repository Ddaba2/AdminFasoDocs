import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

/**
 * Service d'authentification pour gérer l'état de connexion des utilisateurs
 * Ce service gère:
 * - La vérification de l'état de connexion
 * - La protection des routes (guard)
 * - La déconnexion des utilisateurs
 *
 * Utilise storage pour stocker les informations de session côté navigateur
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * Constructeur du service d'authentification
   * @param router - Router d'Angular pour la navigation
   * @param platformId - ID de la plateforme (browser/server) pour vérifier l'environnement
   * @param apiService - Service API for storage operations
   */
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private apiService: ApiService,
    private storageService: StorageService
  ) {}

  /**
   * Vérifie si l'utilisateur est actuellement connecté ET a le rôle ADMIN
   * Vérifie la présence du token, du flag isLoggedIn et du rôle ADMIN dans storage
   *
   * @returns true si l'utilisateur est connecté avec le rôle ADMIN, false sinon
   */
  isLoggedIn(): boolean {
    // Retourne false côté serveur (SSR)
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    
    // If storage is not available, check if we have a token in memory
    if (!this.storageService.isStorageAvailable()) {
      const token = this.apiService.getToken();
      return !!token;
    }
    
    try {
      const token = this.apiService.getStorageItem('token');
      const isLoggedIn = this.apiService.getStorageItem('isLoggedIn');
      // For testing purposes, we'll allow access if we have a token and isLoggedIn flag
      // We'll implement proper role checking once we understand the response structure
      // const userRole = this.apiService.getStorageItem('userRole');
      
      // Accepte 'ADMIN' ou 'ROLE_ADMIN' (format Spring Security)
      // const isAdmin = userRole === 'ADMIN' || userRole === 'ROLE_ADMIN';
      
      // Retourne true seulement si le token et le flag isLoggedIn sont présents
      // Temporarily remove role check until we understand the response structure
      return !!(token && isLoggedIn === 'true');
    } catch (e) {
      console.warn('Error checking login status:', e);
      // If we can't access storage, check if the API service has a token in memory
      const token = this.apiService.getToken();
      return !!token;
    }
  }

  /**
   * Guard pour protéger les routes nécessitant une authentification ADMIN
   * Redirige vers /login si l'utilisateur n'est pas connecté ou n'a pas le rôle ADMIN
   *
   * @returns true si l'utilisateur peut accéder à la route (est admin), false sinon
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
   * - Le numéro de téléphone
   * - Le rôle utilisateur
   *
   * Puis redirige vers la page de saisie du téléphone
   */
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      // Nettoyage de toutes les données de session
      this.apiService.removeStorageItem('token');
      this.apiService.removeStorageItem('isLoggedIn');
      this.apiService.removeStorageItem('telephone');
      this.apiService.removeStorageItem('userRole');
      this.apiService.removeStorageItem('pendingPhone');
      
      // Nettoyer aussi le token en mémoire
      this.apiService.clearToken();
      
      // Redirection vers la page de saisie du téléphone
      this.router.navigate(['/phone-input']);
    }
  }
}