import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DialogService } from '../../services/dialog.service';
import { DataCacheService } from '../../services/data-cache.service';
import { Subscription } from 'rxjs';

interface Category {
  id: number;
  titre: string;
  nomCategorie: string;
  description?: string;
  iconeUrl?: string;
  isEditing?: boolean;
}

/**
 * Composant de gestion des catégories
 *
 * Fonctionnalités:
 * - Liste toutes les catégories
 * - Édition inline (directement dans le tableau)
 * - Suppression avec confirmation
 * - Navigation vers l'ajout
 */
@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Sauvegarde des données originales pour annulation
  private originalData = new Map<number, Category>();
  
  // Subscription pour le cache
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
        this.categories = categories.map(cat => ({ ...cat, isEditing: false }));
      }
    });

    // Charger les données seulement si le cache est vide
    if (this.dataCache.getCategories().length === 0) {
      this.loadCategories();
    }
  }

  ngOnDestroy() {
    // Se désabonner pour éviter les fuites mémoire
    this.categoriesSubscription?.unsubscribe();
  }

  /**
   * Charge la liste des catégories depuis le backend
   */
  loadCategories() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.apiService.getCategories().subscribe({
      next: (response: any[]) => {
        // Mettre à jour le cache au lieu de mettre à jour localement
        this.dataCache.setCategories(response);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.errorMessage = 'Erreur lors du chargement des catégories';
        this.isLoading = false;
      }
    });
  }

  /**
   * Navigue vers la page d'ajout de catégorie
   */
  addCategory() {
    this.router.navigate(['/categories/add']);
  }

  /**
   * Active le mode édition pour une catégorie
   */
  startEdit(category: Category) {
    // Annuler toute autre édition en cours
    this.cancelAllEdits();

    // Sauvegarder les données originales
    this.originalData.set(category.id, { ...category });

    // Activer le mode édition
    category.isEditing = true;
  }

  /**
   * Annule l'édition d'une catégorie et restaure les données originales
   */
  cancelEdit(category: Category) {
    const original = this.originalData.get(category.id);
    if (original) {
      Object.assign(category, original);
      this.originalData.delete(category.id);
    }
    category.isEditing = false;
  }

  /**
   * Annule toutes les éditions en cours
   */
  private cancelAllEdits() {
    this.categories.forEach(cat => {
      if (cat.isEditing) {
        this.cancelEdit(cat);
      }
    });
  }

  /**
   * Sauvegarde les modifications d'une catégorie
   */
  saveCategory(category: Category) {
    // Validation
    if (!category.titre || !category.nomCategorie) {
      this.errorMessage = 'Le titre et le nom de catégorie sont obligatoires';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const categoryData = {
      titre: category.titre,
      nomCategorie: category.nomCategorie,
      description: category.description || '',
      iconeUrl: category.iconeUrl || ''
    };

    this.apiService.updateCategory(category.id, categoryData).subscribe({
      next: (response: any) => {
        console.log('Category updated:', response);
        // Mettre à jour le cache (synchronisation en temps réel)
        this.dataCache.updateCategory(response);
        category.isEditing = false;
        this.successMessage = 'Catégorie mise à jour avec succès!';
        this.originalData.delete(category.id);
        this.isLoading = false;

        // Cacher le message après 3 secondes
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating category:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour de la catégorie';
        this.isLoading = false;
      }
    });
  }

  /**
   * Supprime une catégorie avec confirmation
   */
  deleteCategory(category: Category) {
    this.dialogService.confirm({
      title: 'Confirmation de suppression',
      message: `Êtes-vous sûr de vouloir supprimer la catégorie "${category.titre}" ?`,
      confirmText: 'Supprimer',
      type: 'delete'
    }).subscribe(result => {
      if (result.confirmed) {
        this.isLoading = true;
        this.apiService.deleteCategory(category.id).subscribe({
          next: (response) => {
            console.log('Category deleted:', response);
            // Mettre à jour le cache (synchronisation en temps réel)
            this.dataCache.removeCategory(category.id);
            this.successMessage = 'Catégorie supprimée avec succès!';
            this.isLoading = false;

            // Cacher le message après 3 secondes
            setTimeout(() => {
              this.successMessage = '';
            }, 3000);
          },
          error: (error) => {
            console.error('Error deleting category:', error);
            this.errorMessage = error.error?.message || 'Erreur lors de la suppression de la catégorie';
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
    return this.categories.some(cat => cat.isEditing);
  }
}


