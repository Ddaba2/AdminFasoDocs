import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

/**
 * Composant de saisie du numéro de téléphone
 *
 * Ce composant gère la première étape de l'authentification:
 * - Saisie du numéro de téléphone
 * - Envoi du numéro au backend pour recevoir un code SMS
 * - Redirection vers la page de vérification SMS
 */
@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <img src="/images/FasoDocs.png" alt="FasoDocs Logo" />
          </div>
          <p class="app-subtitle">Panneau d'Administration</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="telephone">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="margin-right: 6px;">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
              </svg>
              Numéro de téléphone
            </label>
            <input
              type="tel"
              id="telephone"
              [(ngModel)]="telephone"
              name="telephone"
              placeholder="Entrez votre numéro de téléphone"
              class="form-input"
              [disabled]="isLoading"
            />
          </div>

          <div *ngIf="errorMessage" class="error-message">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
            </svg>
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="btn-login"
            [disabled]="isLoading"
          >
            <svg *ngIf="!isLoading" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span *ngIf="isLoading" class="spinner"></span>
            <span *ngIf="!isLoading">Envoyer le code</span>
            <span *ngIf="isLoading">Envoi en cours...</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styleUrl: './phone-input.component.css'
})
export class PhoneInputComponent {
  // Le numéro de téléphone saisi dans le formulaire
  telephone = '';

  // Indicateur de chargement pendant la requête API
  isLoading = false;

  // Message d'erreur à afficher en cas d'échec
  errorMessage = '';

  /**
   * Constructeur du composant
   * @param router - Router Angular pour la navigation
   * @param apiService - Service API pour les appels backend
   */
  constructor(private router: Router, private apiService: ApiService) {}

  /**
   * Méthode appelée lors de la soumission du formulaire
   */
  onSubmit() {
    this.errorMessage = '';

    // Empêcher les soumissions multiples
    if (this.isLoading) {
      console.warn('Soumission déjà en cours, ignorée');
      return;
    }

    // Validation du champ requis
    if (!this.telephone) {
      this.errorMessage = 'Veuillez entrer votre numéro de téléphone';
      return;
    }

    // Normalize phone number (remove any non-digit characters except +)
    const normalizedPhone = this.telephone.replace(/[^+\d]/g, '');
    console.log('Normalized phone number:', normalizedPhone);
    
    this.isLoading = true;
    console.log('Envoi du numéro pour recevoir le code SMS:', normalizedPhone);

    // Send phone number to backend to receive SMS code
    this.apiService.sendSmsCode(normalizedPhone).subscribe({
      next: (response) => {
        console.log('Code SMS envoyé avec succès:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', Object.keys(response));
        
        // Stockage du numéro de téléphone temporairement
        try {
          console.log('Storing phone number in storage:', normalizedPhone);
          this.apiService.setStorageItem('pendingPhone', normalizedPhone);
          console.log('Phone number stored successfully');
        } catch (e) {
          console.warn('Storage not available:', e);
          // Continue with in-memory storage as fallback
          console.log('Proceeding with in-memory storage');
        }
        
        // Redirection vers la page de vérification SMS
        console.log('Redirecting to SMS code verification page');
        this.router.navigate(['/sms-code']).then(success => {
          console.log('Navigation successful:', success);
        }).catch(error => {
          console.error('Navigation error:', error);
          this.errorMessage = 'Impossible de naviguer vers la page de vérification. Veuillez réessayer.';
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi du code SMS:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error headers:', error.headers);
        if (error.error) {
          console.error('Error body:', error.error);
        }
        
        // Gestion des différents types d'erreurs
        if (error.status === 0) {
          // Erreur CORS ou backend non accessible
          this.errorMessage = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
        } else if (error.status === 404) {
          // Numéro non trouvé dans la base de données
          this.errorMessage = 'Ce numéro de téléphone n\'est pas enregistré dans notre base de données.';
        } else if (error.status === 500) {
          // Erreur interne du serveur
          this.errorMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
        } else if (error.status === 400) {
          // Requête mal formée
          this.errorMessage = error.error?.message || 'Numéro de téléphone invalide.';
        } else {
          // Autres erreurs
          this.errorMessage = error.error?.message || 'Une erreur est survenue lors de l\'envoi du code SMS.';
        }
        
        this.isLoading = false;
      }
    });
  }
}