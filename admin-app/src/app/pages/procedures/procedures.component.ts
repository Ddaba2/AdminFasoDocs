import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DialogService } from '../../services/dialog.service';
import { DataCacheService } from '../../services/data-cache.service';
import { Subscription } from 'rxjs';

interface Procedure {
  id: number;
  nom: string;
  categorieId: number;
  sousCategorieId?: number;
  categorie?: {
    id: number;
    nom: string;
    titre?: string;
  };
  sousCategorie?: {
    id: number;
    nom: string;
  };
  delaiTraitement?: {
    duree: number;
    unite: string;
  };
  etapes?: any[];
  documents?: any[];
  centres?: string[];
  referenceLoi?: string;
  isEditing?: boolean;
}

/**
 * Composant de gestion des procédures
 *
 * Fonctionnalités:
 * - Liste toutes les procédures avec catégorie et sous-catégorie
 * - Édition inline simplifiée (nom, délai)
 * - Suppression avec confirmation
 * - Navigation vers l'ajout (pour création complète avec étapes, docs, etc.)
 */
@Component({
  selector: 'app-procedures',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './procedures.component.html',
  styleUrl: './procedures.component.css'
})
export class ProceduresComponent implements OnInit, OnDestroy {
  procedures: Procedure[] = [];
  categories: any[] = [];
  subcategories: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Subscriptions pour le cache
  private proceduresSubscription?: Subscription;
  private categoriesSubscription?: Subscription;
  private subcategoriesSubscription?: Subscription;

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
        this.subcategories = subcategories;
      }
    });

    this.proceduresSubscription = this.dataCache.procedures$.subscribe({
      next: (procedures) => {
        this.procedures = procedures.map(proc => ({ ...proc, isEditing: false }));
      }
    });

    // Charger les données seulement si le cache est vide
    if (this.dataCache.getCategories().length === 0) {
      this.loadCategories();
    }
    if (this.dataCache.getSubcategories().length === 0) {
      this.loadSubcategories();
    }
    if (this.dataCache.getProcedures().length === 0) {
      this.loadProcedures();
    }
  }

  ngOnDestroy() {
    this.categoriesSubscription?.unsubscribe();
    this.subcategoriesSubscription?.unsubscribe();
    this.proceduresSubscription?.unsubscribe();
  }

  /**
   * Charge la liste des catégories
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
   * Charge la liste des sous-catégories
   */
  loadSubcategories() {
    this.apiService.getSousCategories().subscribe({
      next: (response: any[]) => {
        this.dataCache.setSubcategories(response);
      },
      error: (err) => {
        console.error('Error loading subcategories:', err);
      }
    });
  }

  /**
   * Charge la liste des procédures depuis le backend
   */
  loadProcedures() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.apiService.getProcedures().subscribe({
      next: (response: any[]) => {
        this.dataCache.setProcedures(response);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading procedures:', err);
        this.errorMessage = 'Erreur lors du chargement des procédures';
        this.isLoading = false;
      }
    });
  }

  /**
   * Navigue vers la page d'ajout de procédure
   */
  addProcedure() {
    this.router.navigate(['/procedures/add']);
  }

  /**
   * Navigue vers la page d'édition d'une procédure
   */
  editProcedure(procedure: Procedure) {
    this.router.navigate(['/procedures/edit', procedure.id]);
  }

  /**
   * Supprime une procédure avec confirmation
   */
  deleteProcedure(procedure: Procedure) {
    this.dialogService.confirm({
      title: 'Confirmation de suppression',
      message: `Êtes-vous sûr de vouloir supprimer la procédure "${procedure.nom}" ?`,
      confirmText: 'Supprimer',
      type: 'delete'
    }).subscribe(result => {
      if (result.confirmed) {
        this.isLoading = true;
        this.apiService.deleteProcedure(procedure.id).subscribe({
          next: (response) => {
            console.log('Procedure deleted:', response);
            // Mettre à jour le cache (synchronisation en temps réel)
            this.dataCache.removeProcedure(procedure.id);
            this.successMessage = 'Procédure supprimée avec succès!';
            this.isLoading = false;

            // Cacher le message après 3 secondes
            setTimeout(() => {
              this.successMessage = '';
            }, 3000);
          },
          error: (error) => {
            console.error('Error deleting procedure:', error);
            this.errorMessage = error.error?.message || 'Erreur lors de la suppression de la procédure';
            this.isLoading = false;
          }
        });
      }
    });
  }


  /**
   * Récupère le nom de la catégorie
   */
  getCategoryName(categorieId: number): string {
    const category = this.categories.find(cat => cat.id === categorieId);
    return category ? (category.titre || category.nom) : 'N/A';
  }

  /**
   * Récupère le nom de la sous-catégorie
   */
  getSubcategoryName(sousCategorieId: number | undefined): string {
    if (!sousCategorieId) return '—';
    const subcategory = this.subcategories.find(sub => sub.id === sousCategorieId);
    return subcategory ? subcategory.nom : 'N/A';
  }

  /**
   * Formate le délai de traitement pour l'affichage
   */
  formatDelai(delai: any): string {
    if (!delai || !delai.duree) return '—';
    const unite = delai.unite === 'JOURS' ? 'jour(s)' :
                  delai.unite === 'SEMAINES' ? 'semaine(s)' :
                  delai.unite === 'MOIS' ? 'mois' : delai.unite;
    return `${delai.duree} ${unite}`;
  }

  /**
   * Filtre les sous-catégories selon la catégorie sélectionnée
   */
  getFilteredSubcategories(categorieId: number): any[] {
    return this.subcategories.filter(sub => sub.categorieId === categorieId);
  }
}

