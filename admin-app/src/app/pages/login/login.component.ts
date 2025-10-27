import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

/**
 * Composant de connexion (Login)
 *
 * Ce composant gère l'authentification des administrateurs:
 * - Affichage du formulaire de connexion
 * - Validation des champs
 * - Appel à l'API backend pour l'authentification
 * - Gestion du token JWT
 * - Redirection vers la page admin après connexion réussie
 *
 * Le composant utilise le service ApiService pour communiquer avec le backend
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Nom d'utilisateur saisi dans le formulaire
  username = '';

  // Mot de passe saisi dans le formulaire
  password = '';

  // Indicateur de chargement pendant la requête API
  isLoading = false;

  // Message d'erreur à afficher en cas d'échec de connexion
  errorMessage = '';

  /**
   * Constructeur du composant Login
   * @param router - Router Angular pour la navigation après connexion
   * @param apiService - Service API pour les appels backend
   */
  constructor(private router: Router, private apiService: ApiService) {}

  /**
   * Méthode appelée lors de la soumission du formulaire de connexion
   *
   * Flux:
   * 1. Validation des champs (username et password requis)
   * 2. Appel au service API pour l'authentification
   * 3. En cas de succès: stockage du token et redirection vers /users
   * 4. En cas d'erreur: affichage du message d'erreur
   */
  onSubmit() {
    this.errorMessage = '';

    // Validation des champs requis
    if (!this.username || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;

    // Appel API de connexion au backend Spring Boot
    this.apiService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);

        // Vérification et récupération du token JWT
        // Le backend peut retourner 'token' ou 'accessToken'
        if (response.token || response.accessToken) {
          const token = response.token || response.accessToken;

          // Stockage du token dans le service API
          this.apiService.setToken(token);

          try {
            // Stockage des informations de session dans sessionStorage
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', this.username);
          } catch (e) {
            console.warn('sessionStorage not available:', e);
          }

          // Redirection vers la page admin (utilisateurs)
          this.router.navigate(['/users']);
        } else {
          this.errorMessage = 'Réponse du serveur invalide';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        // Affichage du message d'erreur du backend ou message par défaut
        this.errorMessage = error.error?.message || 'Nom d\'utilisateur ou mot de passe incorrect';
        this.isLoading = false;
      }
    });
  }
}
