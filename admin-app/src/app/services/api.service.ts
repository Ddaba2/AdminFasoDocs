import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { StorageService } from './storage.service';

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
   * @param storageService - Service for safe storage operations
   */
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private storageService: StorageService
  ) {
    // Récupération du token depuis storage uniquement côté browser
    // Important pour le SSR (Server-Side Rendering)
    this.initializeToken();
  }

  /**
   * Initialize token from storage safely
   */
  private initializeToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.token = this.storageService.getItem('token');
      } catch (e) {
        console.warn('Could not initialize token from storage:', e);
        // Token will remain null, which is safe
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
   * Send phone number to receive SMS code
   * @param phoneNumber - Phone number to send verification code to
   * @returns Observable with the response
   */
  sendSmsCode(phoneNumber: string): Observable<any> {
    console.log('📞 Sending ADMIN SMS code request for phone number:', phoneNumber);
    const request = {
      telephone: phoneNumber
    };
    console.log('Request body:', request);

    const observable = this.http.post(`${API_URL}/auth/connexion-admin`, request).pipe(
      tap({
        next: (response) => {
          console.log('SMS code request successful, response:', response);
        },
        error: (error) => {
          console.error('SMS code request failed, error:', error);
        }
      })
    );
    console.log('Created HTTP observable for SMS code request');

    return observable;
  }

  /**
   * Verify SMS code for authentication
   * @param phoneNumber - Phone number that received the code
   * @param code - 4-digit verification code
   * @returns Observable with the authentication response containing token
   */
  verifySmsCode(phoneNumber: string, code: string): Observable<any> {
    console.log('🔐 Verifying ADMIN SMS code for phone number:', phoneNumber, 'with code:', code);
    const request = {
      telephone: phoneNumber,
      code: code
    };
    console.log('Request body:', request);

    const observable = this.http.post(`${API_URL}/auth/verifier-sms-admin`, request).pipe(
      tap({
        next: (response) => {
          console.log('SMS verification request successful, response:', response);
        },
        error: (error) => {
          console.error('SMS verification request failed, error:', error);
        }
      })
    );
    console.log('Created HTTP observable for SMS verification request');

    return observable;
  }

  /**
   * Définit le token JWT et le stocke dans storage
   * Appelé après une connexion réussie
   *
   * @param token - Token JWT retourné par le backend
   */
  setToken(token: string) {
    this.token = token;
    if (isPlatformBrowser(this.platformId)) {
      this.storageService.setItem('token', token);
    }
  }

  /**
   * Get the current JWT token
   * @returns The current token or null if not set
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Clear the current JWT token
   */
  clearToken() {
    this.token = null;
    if (isPlatformBrowser(this.platformId)) {
      this.storageService.removeItem('token');
    }
  }

  /**
   * Supprime le token JWT et déconnecte l'utilisateur
   * Supprime également le token du storage
   */
  logout() {
    this.clearToken();
  }

  // ====================
  // CATEGORIES
  // ====================

  /**
   * Récupère toutes les catégories depuis le backend
   * @returns Observable avec la liste des catégories
   */
  getCategories(): Observable<any> {
    return this.http.get(`${API_URL}/admin/categories`, { headers: this.getHeaders() });
  }

  /**
   * Crée une nouvelle catégorie
   * @param category - Objet catégorie contenant le nom et autres propriétés
   * @returns Observable avec la catégorie créée
   */
  createCategory(category: any): Observable<any> {
    return this.http.post(`${API_URL}/admin/categories`, category, { headers: this.getHeaders() });
  }

  /**
   * Met à jour une catégorie existante
   * @param id - ID de la catégorie à mettre à jour
   * @param category - Objet catégorie avec les nouvelles données
   * @returns Observable avec la catégorie mise à jour
   */
  updateCategory(id: number, category: any): Observable<any> {
    return this.http.put(`${API_URL}/admin/categories/${id}`, category, { headers: this.getHeaders() });
  }

  /**
   * Supprime une catégorie
   * @param id - ID de la catégorie à supprimer
   * @returns Observable avec la réponse de suppression
   */
  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/admin/categories/${id}`, { headers: this.getHeaders() });
  }

  // ====================
  // SOUS-CATEGORIES
  // ====================

  /**
   * Récupère toutes les sous-catégories depuis le backend
   * @returns Observable avec la liste des sous-catégories
   */
  getSousCategories(): Observable<any> {
    return this.http.get(`${API_URL}/admin/sous-categories`, { headers: this.getHeaders() });
  }

  /**
   * Crée une nouvelle sous-catégorie
   * @param sousCategorie - Objet sous-catégorie contenant le nom et l'ID de la catégorie parent
   * @returns Observable avec la sous-catégorie créée
   */
  createSousCategorie(sousCategorie: any): Observable<any> {
    return this.http.post(`${API_URL}/admin/sous-categories`, sousCategorie, { headers: this.getHeaders() });
  }

  /**
   * Met à jour une sous-catégorie existante
   * @param id - ID de la sous-catégorie à mettre à jour
   * @param sousCategorie - Objet sous-catégorie avec les nouvelles données
   * @returns Observable avec la sous-catégorie mise à jour
   */
  updateSousCategorie(id: number, sousCategorie: any): Observable<any> {
    return this.http.put(`${API_URL}/admin/sous-categories/${id}`, sousCategorie, { headers: this.getHeaders() });
  }

  /**
   * Supprime une sous-catégorie
   * @param id - ID de la sous-catégorie à supprimer
   * @returns Observable avec la réponse de suppression
   */
  deleteSousCategorie(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/admin/sous-categories/${id}`, { headers: this.getHeaders() });
  }

  // ====================
  // CENTRES
  // ====================

  /**
   * Récupère tous les centres depuis le backend
   * @returns Observable avec la liste des centres
   */
  getCentres(): Observable<any> {
    return this.http.get(`${API_URL}/centres`);
  }

  // ====================
  // COUTS
  // ====================

  /**
   * Récupère tous les coûts depuis le backend
   * @returns Observable avec la liste des coûts
   */
  getCouts(): Observable<any> {
    return this.http.get(`${API_URL}/couts`);
  }

  // ====================
  // PROCEDURES
  // ====================

  /**
   * Récupère toutes les procédures depuis le backend
   * @returns Observable avec la liste des procédures
   */
  getProcedures(): Observable<any> {
    return this.http.get(`${API_URL}/admin/procedures`, { headers: this.getHeaders() });
  }

  /**
   * Crée une nouvelle procédure
   * @param procedure - Objet procédure contenant toutes les informations
   * @returns Observable avec la procédure créée
   */
  createProcedure(procedure: any): Observable<any> {
    return this.http.post(`${API_URL}/admin/procedures`, procedure, { headers: this.getHeaders() });
  }

  /**
   * Met à jour une procédure existante
   * @param id - ID de la procédure à mettre à jour
   * @param procedure - Objet procédure avec les nouvelles données
   * @returns Observable avec la procédure mise à jour
   */
  updateProcedure(id: number, procedure: any): Observable<any> {
    return this.http.put(`${API_URL}/admin/procedures/${id}`, procedure, { headers: this.getHeaders() });
  }

  /**
   * Supprime une procédure
   * @param id - ID de la procédure à supprimer
   * @returns Observable avec la réponse de suppression
   */
  deleteProcedure(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/admin/procedures/${id}`, { headers: this.getHeaders() });
  }

  // ====================
  // UTILISATEURS
  // ====================

  /**
   * Récupère la liste de tous les utilisateurs
   * @returns Observable avec la liste des utilisateurs
   */
  getUsers(): Observable<any> {
    return this.http.get(`${API_URL}/admin/utilisateurs`, { headers: this.getHeaders() });
  }

  /**
   * Récupère le profil de l'utilisateur actuellement connecté
   * Utilise le token JWT pour identifier l'utilisateur
   * @returns Observable avec les informations de l'utilisateur connecté
   */
  getCurrentUserProfile(): Observable<any> {
    return this.http.get(`${API_URL}/auth/profil`, { headers: this.getHeaders() });
  }

  /**
   * Récupère un utilisateur par son ID
   * @param id - ID de l'utilisateur
   * @returns Observable avec les informations de l'utilisateur
   */
  getUserById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/admin/utilisateurs/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Crée un nouvel utilisateur
   * @param user - Objet utilisateur contenant les informations
   * @returns Observable avec l'utilisateur créé
   */
  createUser(user: any): Observable<any> {
    return this.http.post(`${API_URL}/admin/utilisateurs`, user, { headers: this.getHeaders() });
  }

  /**
   * Met à jour un utilisateur existant
   * @param id - ID de l'utilisateur à mettre à jour
   * @param user - Objet utilisateur avec les nouvelles données
   * @returns Observable avec l'utilisateur mis à jour
   */
  updateUser(id: number, user: any): Observable<any> {
    return this.http.put(`${API_URL}/admin/utilisateurs/${id}`, user, { headers: this.getHeaders() });
  }

  /**
   * Supprime un utilisateur
   * @param id - ID de l'utilisateur à supprimer
   * @returns Observable avec la réponse de suppression
   */
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/admin/utilisateurs/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Active un utilisateur
   * @param id - ID de l'utilisateur à activer
   * @returns Observable avec la réponse d'activation
   */
  activateUser(id: number): Observable<any> {
    return this.http.put(`${API_URL}/admin/utilisateurs/${id}/activer`, {}, { headers: this.getHeaders() });
  }

  /**
   * Désactive un utilisateur
   * @param id - ID de l'utilisateur à désactiver
   * @returns Observable avec la réponse de désactivation
   */
  deactivateUser(id: number): Observable<any> {
    return this.http.put(`${API_URL}/admin/utilisateurs/${id}/desactiver`, {}, { headers: this.getHeaders() });
  }

  /**
   * Helper methods for storage operations
   */
  setStorageItem(key: string, value: string): void {
    this.storageService.setItem(key, value);
  }

  getStorageItem(key: string): string | null {
    return this.storageService.getItem(key);
  }

  removeStorageItem(key: string): void {
    this.storageService.removeItem(key);
  }
}
