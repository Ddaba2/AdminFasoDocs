import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DialogService } from '../../services/dialog.service';
import { DataCacheService } from '../../services/data-cache.service';
import { Subscription } from 'rxjs';

interface SubCategory {
  id: number;
  nom: string;
  description?: string;
  categorieId: number;
  categorie?: {
    id: number;
    nom: string;
    titre?: string;
  };
  isEditing?: boolean;
}

/**
 * Composant de gestion des sous-catégories
 *
 * Fonctionnalités:
 * - Liste toutes les sous-catégories avec leur catégorie parente
 * - Édition inline (directement dans le tableau)
 * - Suppression avec confirmation
 * - Navigation vers l'ajout
 */
@Component({
  selector: 'app-subcategories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subcategories.component.html',
  styleUrl: './subcategories.component.css'
})
export class SubcategoriesComponent implements OnInit, OnDestroy {
  subcategories: SubCategory[] = [];
  categories: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Sauvegarde des données originales pour annulation
  private originalData = new Map<number, SubCategory>();
  
  // Subscriptions pour le cache
  private subcategoriesSubscription?: Subscription;
  private categoriesSubscription?: Subscription;

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    private router: Router,
    private dataCache: DataCacheService
  ) {}

  ngOnInit() {
    // S'abonner au cache pour les mises à jour en temps réel
    this.categoriesSubscription = this.dataCache.categories$.subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });

    this.subcategoriesSubscription = this.dataCache.subcategories$.subscribe({
      next: (subcategories) => {
        this.subcategories = subcategories.map(subcat => ({ ...subcat, isEditing: false }));
      }
    });

    // Charger les données seulement si le cache est vide
    if (this.dataCache.getCategories().length === 0) {
      this.loadCategories();
    }
    if (this.dataCache.getSubcategories().length === 0) {
      this.loadSubcategories();
    }
  }

  ngOnDestroy() {
    this.categoriesSubscription?.unsubscribe();
    this.subcategoriesSubscription?.unsubscribe();
  }

  /**
   * Charge la liste des catégories pour le dropdown
   */
  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (response: any[]) => {
        this.dataCache.setCategories(response);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  /**
   * Charge la liste des sous-catégories depuis le backend
   */
  loadSubcategories() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.apiService.getSousCategories().subscribe({
      next: (response: any[]) => {
        this.dataCache.setSubcategories(response);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading subcategories:', err);
        this.errorMessage = 'Erreur lors du chargement des sous-catégories';
        this.isLoading = false;
      }
    });
  }

  /**
   * Navigue vers la page d'ajout de sous-catégorie
   */
  addSubcategory() {
    this.router.navigate(['/subcategories/add']);
  }

  /**
   * Active le mode édition pour une sous-catégorie
   */
  startEdit(subcategory: SubCategory) {
    // Annuler toute autre édition en cours
    this.cancelAllEdits();

    // Sauvegarder les données originales
    this.originalData.set(subcategory.id, { ...subcategory });

    // Activer le mode édition
    subcategory.isEditing = true;
  }

  /**
   * Annule l'édition d'une sous-catégorie et restaure les données originales
   */
  cancelEdit(subcategory: SubCategory) {
    const original = this.originalData.get(subcategory.id);
    if (original) {
      Object.assign(subcategory, original);
      this.originalData.delete(subcategory.id);
    }
    subcategory.isEditing = false;
  }

  /**
   * Annule toutes les éditions en cours
   */
  private cancelAllEdits() {
    this.subcategories.forEach(subcat => {
      if (subcat.isEditing) {
        this.cancelEdit(subcat);
      }
    });
  }

  /**
   * Sauvegarde les modifications d'une sous-catégorie
   */
  saveSubcategory(subcategory: SubCategory) {
    // Validation
    if (!subcategory.nom || !subcategory.categorieId) {
      this.errorMessage = 'Le nom et la catégorie sont obligatoires';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const subcategoryData = {
      nom: subcategory.nom,
      description: subcategory.description || '',
      categorieId: subcategory.categorieId
    };

    this.apiService.updateSousCategorie(subcategory.id, subcategoryData).subscribe({
      next: (response: any) => {
        console.log('Subcategory updated:', response);
        // Mettre à jour le cache (synchronisation en temps réel)
        this.dataCache.updateSubcategory(response);
        subcategory.isEditing = false;
        this.successMessage = 'Sous-catégorie mise à jour avec succès!';
        this.originalData.delete(subcategory.id);
        this.isLoading = false;

        // Cacher le message après 3 secondes
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating subcategory:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour de la sous-catégorie';
        this.isLoading = false;
      }
    });
  }

  /**
   * Supprime une sous-catégorie avec confirmation
   */
  deleteSubcategory(subcategory: SubCategory) {
    this.dialogService.confirm({
      title: 'Confirmation de suppression',
      message: `Êtes-vous sûr de vouloir supprimer la sous-catégorie "${subcategory.nom}" ?`,
      confirmText: 'Supprimer',
      type: 'delete'
    }).subscribe(result => {
      if (result.confirmed) {
        this.isLoading = true;
        this.apiService.deleteSousCategorie(subcategory.id).subscribe({
          next: (response) => {
            console.log('Subcategory deleted:', response);
            // Mettre à jour le cache (synchronisation en temps réel)
            this.dataCache.removeSubcategory(subcategory.id);
            this.successMessage = 'Sous-catégorie supprimée avec succès!';
            this.isLoading = false;

            // Cacher le message après 3 secondes
            setTimeout(() => {
              this.successMessage = '';
            }, 3000);
          },
          error: (error) => {
            console.error('Error deleting subcategory:', error);
            this.errorMessage = error.error?.message || 'Erreur lors de la suppression de la sous-catégorie';
            this.isLoading = false;
          }
        });
      }
    });
  }

  /**
   * Vérifie si une édition est en cours
   */
  hasActiveEdit(): boolean {
    return this.subcategories.some(subcat => subcat.isEditing);
  }

  /**
   * Récupère le nom de la catégorie parente
   */
  getCategoryName(categorieId: number): string {
    const category = this.categories.find(cat => cat.id === categorieId);
    return category ? (category.titre || category.nom) : 'N/A';
  }
}

