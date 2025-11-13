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
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.css']
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
        } else if (error.status === 403) {
          // Non autorisé - Pas un administrateur
          this.errorMessage = error.error?.message || 'Vous n\'êtes pas autorisé à accéder à cette partie. Accès réservé aux administrateurs.';
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
