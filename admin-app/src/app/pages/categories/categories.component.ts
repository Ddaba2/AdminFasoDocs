import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

/**
 * Composant de gestion des catégories
 *
 * Ce composant permet de créer de nouvelles catégories pour les procédures.
 * Les catégories permettent d'organiser les procédures administratives.
 *
 * Fonctionnalités:
 * - Création de nouvelles catégories
 * - Validation des données avant envoi
 * - Affichage des messages de succès/erreur
 *
 * À implémenter:
 * - Affichage de la liste des catégories existantes
 * - Modification des catégories
 * - Suppression des catégories
 */
@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent {
  // Nom de la catégorie saisie dans le formulaire
  categoryName = '';

  // Indicateur de chargement pendant la requête API
  isLoading = false;

  // Message de succès à afficher après création
  successMessage = '';

  // Message d'erreur à afficher en cas d'échec
  errorMessage = '';

  /**
   * Constructeur du composant Categories
   * @param apiService - Service API pour les appels backend
   */
  constructor(private apiService: ApiService) {}

  /**
   * Méthode appelée lors de la soumission du formulaire
   *
   * Flux:
   * 1. Validation du nom de catégorie (non vide)
   * 2. Appel au service API pour créer la catégorie
   * 3. En cas de succès: affichage message et réinitialisation du formulaire
   * 4. En cas d'erreur: affichage du message d'erreur
   */
  onSubmit() {
    // Validation du nom de catégorie
    if (!this.categoryName.trim()) {
      this.errorMessage = 'Veuillez entrer un nom de catégorie';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparation des données à envoyer au backend
    const categoryData = {
      nom: this.categoryName.trim()
    };

    // Appel API pour créer la catégorie
    this.apiService.createCategory(categoryData).subscribe({
      next: (response) => {
        console.log('Category created:', response);
        this.successMessage = 'Catégorie créée avec succès!';
        this.categoryName = '';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating category:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la création de la catégorie';
        this.isLoading = false;
      }
    });
  }

  /**
   * Annule la création en réinitialisant le formulaire
   * Vide tous les champs et messages
   */
  onCancel() {
    this.categoryName = '';
    this.errorMessage = '';
    this.successMessage = '';
  }
}
