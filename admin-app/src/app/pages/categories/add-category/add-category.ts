import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { DataCacheService } from '../../../services/data-cache.service';
import { Router } from '@angular/router';

/**
 * Composant pour ajouter une nouvelle catégorie
 *
 * Ce composant permet d'ajouter de nouvelles catégories au système:
 * - Formulaire pour saisir les informations de la catégorie
 * - Validation des données
 * - Envoi des données au backend Spring Boot via l'API
 */
@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-category.html',
  styleUrl: './add-category.css'
})
export class AddCategory implements OnInit {
  // Données du formulaire
  categoryForm = {
    titre: '',
    nomCategorie: '',
    description: '',
    iconeUrl: ''
  };

  // Indicateur de chargement
  isLoading = false;

  // Message d'erreur
  errorMessage = '';

  // Message de succès
  successMessage = '';

  // Énumération des catégories
  categoryEnumEntries = [
    ['SANTE', 'Santé'],
    ['EDUCATION', 'Éducation'],
    ['JUSTICE', 'Justice'],
    ['TRANSPORT', 'Transport'],
    ['COMMUNICATION', 'Communication']
  ];

  /**
   * Constructeur du composant AddCategory
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
   */
  ngOnInit() {
    // Initialisation si nécessaire
  }

  /**
   * Annule l'opération et retourne à la liste des catégories
   */
  cancel() {
    this.router.navigate(['/categories']);
  }

  /**
   * Enregistre une nouvelle catégorie
   */
  saveCategory() {
    // Validation simple du formulaire
    if (!this.categoryForm.titre || !this.categoryForm.nomCategorie) {
      this.errorMessage = 'Le titre et le nom de catégorie sont obligatoires';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparation des données à envoyer
    const categoryData = {
      titre: this.categoryForm.titre,
      nomCategorie: this.categoryForm.nomCategorie,
      description: this.categoryForm.description,
      iconeUrl: this.categoryForm.iconeUrl
    };

    // Création
    this.apiService.createCategory(categoryData).subscribe({
      next: (response) => {
        console.log('Category created:', response);
        // Ajouter au cache (synchronisation en temps réel, pas de rechargement)
        this.dataCache.addCategory(response);
        this.successMessage = 'Catégorie créée avec succès!';
        this.isLoading = false;
        // Redirection immédiate (les données sont déjà dans le cache)
        setTimeout(() => {
          this.router.navigate(['/categories']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error creating category:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la création de la catégorie';
        this.isLoading = false;
      }
    });
  }
}
