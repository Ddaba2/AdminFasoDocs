import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * URL de base de l'API backend Spring Boot
 * Cette constante pointe vers le serveur backend qui doit être démarré sur le port 8080
 * Format: http://localhost:8080/api
 */
const API_URL = 'http://localhost:8080/api';

/**
 * Service API pour communiquer avec le backend Spring Boot
 * Ce service gère toutes les requêtes HTTP vers l'API FasoDocs
 *
 * Fonctionnalités:
 * - Authentification (login/logout)
 * - Gestion des catégories
 * - Gestion des sous-catégories
 * - Gestion des procédures
 * - Gestion des utilisateurs
 *
 * Toutes les requêtes incluent automatiquement le token JWT dans les headers
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Token JWT pour l'authentification (stocké dans sessionStorage côté navigateur)
  private token: string | null = null;

  /**
   * Constructeur du service API
   * @param http - Service HttpClient d'Angular pour les requêtes HTTP
   * @param platformId - ID de la plateforme (browser/server) pour vérifier l'environnement
   */
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Récupération du token depuis sessionStorage uniquement côté browser
    // Important pour le SSR (Server-Side Rendering)
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.token = sessionStorage.getItem('token');
      } catch (e) {
        console.warn('sessionStorage not available:', e);
        this.token = null;
      }
    }
  }

  /**
   * Crée les headers HTTP pour les requêtes authentifiées
   * Ajoute automatiquement le token JWT si disponible
   *
   * @returns HttpHeaders avec Content-Type et Authorization
   */
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Ajout du token JWT pour l'authentification
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return headers;
  }

  // ====================
  // AUTHENTIFICATION
  // ====================

  /**
   * Authentifie un utilisateur sur le backend
   * Envoie les credentials (nomUtilisateur et motDePasse) au backend Spring Boot
   *
   * @param username - Nom d'utilisateur
   * @param password - Mot de passe en clair
   * @returns Observable avec la réponse contenant le token JWT
   */
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/connexion`, {
      nomUtilisateur: username,
      motDePasse: password
    });
  }

  /**
   * Définit le token JWT et le stocke dans sessionStorage
   * Appelé après une connexion réussie
   *
   * @param token - Token JWT retourné par le backend
   */
  setToken(token: string) {
    this.token = token;
    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.setItem('token', token);
      } catch (e) {
        console.warn('sessionStorage not available:', e);
      }
    }
  }

  /**
   * Supprime le token JWT et déconnecte l'utilisateur
   * Supprime également le token du sessionStorage
   */
  logout() {
    this.token = null;
    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.removeItem('token');
      } catch (e) {
        console.warn('sessionStorage not available:', e);
      }
    }
  }

  // ====================
  // CATEGORIES
  // ====================

  /**
   * Récupère toutes les catégories depuis le backend
   * @returns Observable avec la liste des catégories
   */
  getCategories(): Observable<any> {
    return this.http.get(`${API_URL}/categories`, { headers: this.getHeaders() });
  }

  /**
   * Crée une nouvelle catégorie
   * @param category - Objet catégorie contenant le nom et autres propriétés
   * @returns Observable avec la catégorie créée
   */
  createCategory(category: any): Observable<any> {
    return this.http.post(`${API_URL}/categories`, category, { headers: this.getHeaders() });
  }

  /**
   * Met à jour une catégorie existante
   * @param id - ID de la catégorie à mettre à jour
   * @param category - Objet catégorie avec les nouvelles données
   * @returns Observable avec la catégorie mise à jour
   */
  updateCategory(id: number, category: any): Observable<any> {
    return this.http.put(`${API_URL}/categories/${id}`, category, { headers: this.getHeaders() });
  }

  /**
   * Supprime une catégorie
   * @param id - ID de la catégorie à supprimer
   * @returns Observable avec la réponse de suppression
   */
  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/categories/${id}`, { headers: this.getHeaders() });
  }

  // ====================
  // SOUS-CATEGORIES
  // ====================

  /**
   * Récupère toutes les sous-catégories depuis le backend
   * @returns Observable avec la liste des sous-catégories
   */
  getSousCategories(): Observable<any> {
    return this.http.get(`${API_URL}/sous-categories`, { headers: this.getHeaders() });
  }

  /**
   * Crée une nouvelle sous-catégorie
   * @param sousCategorie - Objet sous-catégorie contenant le nom et l'ID de la catégorie parent
   * @returns Observable avec la sous-catégorie créée
   */
  createSousCategorie(sousCategorie: any): Observable<any> {
    return this.http.post(`${API_URL}/sous-categories`, sousCategorie, { headers: this.getHeaders() });
  }

  /**
   * Met à jour une sous-catégorie existante
   * @param id - ID de la sous-catégorie à mettre à jour
   * @param sousCategorie - Objet sous-catégorie avec les nouvelles données
   * @returns Observable avec la sous-catégorie mise à jour
   */
  updateSousCategorie(id: number, sousCategorie: any): Observable<any> {
    return this.http.put(`${API_URL}/sous-categories/${id}`, sousCategorie, { headers: this.getHeaders() });
  }

  /**
   * Supprime une sous-catégorie
   * @param id - ID de la sous-catégorie à supprimer
   * @returns Observable avec la réponse de suppression
   */
  deleteSousCategorie(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/sous-categories/${id}`, { headers: this.getHeaders() });
  }

  // ====================
  // PROCEDURES
  // ====================

  /**
   * Récupère toutes les procédures depuis le backend
   * @returns Observable avec la liste des procédures
   */
  getProcedures(): Observable<any> {
    return this.http.get(`${API_URL}/procedures`, { headers: this.getHeaders() });
  }

  /**
   * Crée une nouvelle procédure
   * @param procedure - Objet procédure contenant toutes les informations
   * @returns Observable avec la procédure créée
   */
  createProcedure(procedure: any): Observable<any> {
    return this.http.post(`${API_URL}/procedures`, procedure, { headers: this.getHeaders() });
  }

  /**
   * Met à jour une procédure existante
   * @param id - ID de la procédure à mettre à jour
   * @param procedure - Objet procédure avec les nouvelles données
   * @returns Observable avec la procédure mise à jour
   */
  updateProcedure(id: number, procedure: any): Observable<any> {
    return this.http.put(`${API_URL}/procedures/${id}`, procedure, { headers: this.getHeaders() });
  }

  /**
   * Supprime une procédure
   * @param id - ID de la procédure à supprimer
   * @returns Observable avec la réponse de suppression
   */
  deleteProcedure(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/procedures/${id}`, { headers: this.getHeaders() });
  }

  // ====================
  // UTILISATEURS
  // ====================

  /**
   * Récupère la liste de tous les utilisateurs
   * @returns Observable avec la liste des utilisateurs
   */
  getUsers(): Observable<any> {
    return this.http.get(`${API_URL}/users`, { headers: this.getHeaders() });
  }
}
