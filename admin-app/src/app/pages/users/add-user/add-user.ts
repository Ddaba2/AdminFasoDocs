import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { DataCacheService } from '../../../services/data-cache.service';
import { Router } from '@angular/router';

/**
 * Composant pour ajouter un nouvel utilisateur
 *
 * Ce composant permet d'ajouter de nouveaux utilisateurs au système:
 * - Formulaire pour saisir les informations de l'utilisateur
 * - Validation des données
 * - Envoi des données au backend Spring Boot via l'API
 */
@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-user.html',
  styleUrls: ['./add-user.css']
})
export class AddUserComponent {
  // Données du formulaire
  userForm = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    motDePasse: '',
    role: ''
  };

  // Indicateur de chargement
  isLoading = false;

  // Message d'erreur
  errorMessage = '';

  // Message de succès
  successMessage = '';

  /**
   * Constructeur du composant AddUser
   * @param apiService - Service API pour les appels backend
   * @param router - Service de routage
   */
  constructor(
    private apiService: ApiService,
    private router: Router,
    private dataCache: DataCacheService
  ) {}

  /**
   * Annule l'opération et retourne à la liste des utilisateurs
   */
  cancel() {
    this.router.navigate(['/users']);
  }

  /**
   * Enregistre un nouvel utilisateur
   */
  saveUser() {
    // Validation simple du formulaire
    if (!this.userForm.nom || !this.userForm.prenom || !this.userForm.email || 
        !this.userForm.telephone || !this.userForm.motDePasse || !this.userForm.role) {
      this.errorMessage = 'Tous les champs sont obligatoires';
      return;
    }

    // Validation du mot de passe (minimum 6 caractères)
    if (this.userForm.motDePasse.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparation des données à envoyer (format attendu par le backend)
    const userData = {
      nom: this.userForm.nom,
      prenom: this.userForm.prenom,
      email: this.userForm.email,
      telephone: this.userForm.telephone,
      motDePasse: this.userForm.motDePasse,
      role: this.userForm.role
    };

    // Création - Using the API service instead of placeholder
    this.apiService.createUser(userData).subscribe({
      next: (response: any) => {
        console.log('User created:', response);
        // Ajouter au cache (synchronisation en temps réel)
        this.dataCache.addUser(response);
        this.successMessage = 'Utilisateur créé avec succès!';
        this.isLoading = false;
        // Redirection immédiate
        setTimeout(() => {
          this.router.navigate(['/users']);
        }, 1000);
      },
      error: (error: any) => {
        console.error('Error creating user:', error);
        console.error('Error status:', error.status);
        console.error('Error details:', error.error);
        
        if (error.status === 500) {
          this.errorMessage = '❌ Erreur serveur (500) : Le backend a rencontré une erreur. Vérifiez les logs du serveur Spring Boot.';
        } else if (error.status === 0) {
          this.errorMessage = '❌ Backend non accessible. Vérifiez que le serveur est démarré sur http://localhost:8080';
        } else if (error.status === 409) {
          this.errorMessage = '❌ Un utilisateur avec cet email ou ce numéro existe déjà.';
        } else {
          this.errorMessage = error.error?.message || `❌ Erreur lors de la création (Code ${error.status})`;
        }
        
        this.isLoading = false;
      }
    });
  }
}