import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

/**
 * Composant de gestion des sous-catégories
 *
 * Ce composant permet de créer de nouvelles sous-catégories qui sont liées à une catégorie parente.
 * Les sous-catégories permettent un niveau supplémentaire d'organisation des procédures.
 *
 * Fonctionnalités:
 * - Sélection de la catégorie parente
 * - Création de nouvelles sous-catégories
 * - Validation des données avant envoi
 * - Affichage des messages de succès/erreur
 *
 * À implémenter:
 * - Affichage de la liste des sous-catégories existantes
 * - Modification des sous-catégories
 * - Suppression des sous-catégories
 */
@Component({
  selector: 'app-subcategories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subcategories.component.html',
  styleUrl: './subcategories.component.css'
})
export class SubcategoriesComponent {
  // ID de la catégorie parente sélectionnée
  selectedCategory = '';

  // Nom de la sous-catégorie saisie dans le formulaire
  subcategoryName = '';

  // Indicateur de chargement pendant la requête API
  isLoading = false;

  // Message de succès à afficher après création
  successMessage = '';

  // Message d'erreur à afficher en cas d'échec
  errorMessage = '';

  /**
   * Constructeur du composant Subcategories
   * @param apiService - Service API pour les appels backend
   */
  constructor(private apiService: ApiService) {}

  /**
   * Méthode appelée lors de la soumission du formulaire
   *
   * Flux:
   * 1. Validation des champs (catégorie parente et nom requis)
   * 2. Appel au service API pour créer la sous-catégorie
   * 3. En cas de succès: affichage message et réinitialisation du formulaire
   * 4. En cas d'erreur: affichage du message d'erreur
   */
  onSubmit() {
    // Validation des champs requis
    if (!this.selectedCategory || !this.subcategoryName.trim()) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparation des données à envoyer au backend
    const sousCategorieData = {
      nom: this.subcategoryName.trim(),
      categorieId: this.selectedCategory
    };

    // Appel API pour créer la sous-catégorie
    this.apiService.createSousCategorie(sousCategorieData).subscribe({
      next: (response) => {
        console.log('Subcategory created:', response);
        this.successMessage = 'Sous-catégorie créée avec succès!';
        this.selectedCategory = '';
        this.subcategoryName = '';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating subcategory:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la création de la sous-catégorie';
        this.isLoading = false;
      }
    });
  }
}
