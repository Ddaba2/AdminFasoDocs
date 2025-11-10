import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { DataCacheService } from '../../../services/data-cache.service';
import { Router } from '@angular/router';

/**
 * Composant pour ajouter une nouvelle sous-catégorie
 *
 * Ce composant permet d'ajouter de nouvelles sous-catégories au système:
 * - Formulaire pour saisir les informations de la sous-catégorie
 * - Validation des données
 * - Envoi des données au backend Spring Boot via l'API
 */
@Component({
  selector: 'app-add-subcategory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-subcategory.html',
  styleUrl: './add-subcategory.css'
})
export class AddSubcategory implements OnInit {
  // Données du formulaire
  subcategoryForm = {
    titre: '',
    categorieId: null as number | null,
    description: '',
    iconeUrl: ''
  };

  // Liste des catégories parentes
  categories: any[] = [];

  // Indicateur de chargement
  isLoading = false;
  isCategoriesLoading = false;

  // Message d'erreur
  errorMessage = '';

  // Message de succès
  successMessage = '';

  /**
   * Constructeur du composant AddSubcategory
   * @param apiService - Service API pour les appels backend
   * @param router - Service de routage
   */
  constructor(
    private apiService: ApiService,
    private router: Router,
    private dataCache: DataCacheService
  ) {}

  /**
   * Lifecycle hook appelé au démarrage du composant
   * Charge automatiquement la liste des catégories
   */
  ngOnInit() {
    this.loadCategories();
  }

  /**
   * Charge la liste des catégories depuis le backend
   *
   * Appelle l'endpoint /admin/categories du backend Spring Boot
   * pour récupérer toutes les catégories enregistrées
   * Utilisé pour le champ de sélection dans le formulaire
   */
  loadCategories() {
    this.isCategoriesLoading = true;
    this.apiService.getCategories().subscribe({
      next: (response) => {
        // Mise à jour de la liste des catégories
        this.categories = response;
        this.isCategoriesLoading = false;
      },
      error: (err) => {
        console.error('Error loading categories for form:', err);
        this.errorMessage = 'Erreur lors du chargement des catégories pour le formulaire';
        this.isCategoriesLoading = false;
      }
    });
  }

  /**
   * Annule l'opération et retourne à la liste des sous-catégories
   */
  cancel() {
    this.router.navigate(['/subcategories']);
  }

  /**
   * Enregistre une nouvelle sous-catégorie
   */
  saveSubcategory() {
    // Validation simple du formulaire
    if (!this.subcategoryForm.titre || !this.subcategoryForm.categorieId) {
      this.errorMessage = 'Le titre et la catégorie parente sont obligatoires';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparation des données à envoyer
    const subcategoryData = {
      titre: this.subcategoryForm.titre,
      categorieId: this.subcategoryForm.categorieId,
      description: this.subcategoryForm.description,
      iconeUrl: this.subcategoryForm.iconeUrl
    };

    // Création
    this.apiService.createSousCategorie(subcategoryData).subscribe({
      next: (response) => {
        console.log('Subcategory created:', response);
        // Ajouter au cache (synchronisation en temps réel)
        this.dataCache.addSubcategory(response);
        this.successMessage = 'Sous-catégorie créée avec succès!';
        this.isLoading = false;
        // Redirection immédiate
        setTimeout(() => {
          this.router.navigate(['/subcategories']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error creating subcategory:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la création de la sous-catégorie';
        this.isLoading = false;
      }
    });
  }
}
