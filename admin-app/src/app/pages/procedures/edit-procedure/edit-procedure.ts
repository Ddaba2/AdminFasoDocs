import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Router, ActivatedRoute } from '@angular/router';

/**
 * Composant pour éditer une procédure existante
 *
 * Ce composant permet de modifier toutes les informations d'une procédure:
 * - Informations générales
 * - Étapes
 * - Documents requis
 * - Centres de traitement
 * - Références légales
 */
@Component({
  selector: 'app-edit-procedure',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-procedure.html',
  styleUrl: './edit-procedure.css'
})
export class EditProcedure implements OnInit {
  // ID de la procédure à éditer
  procedureId: number | null = null;

  // Données du formulaire (identiques à add-procedure)
  nom = '';
  titre = '';
  delai = '';
  description = '';
  urlVersFormulaire = '';
  categorieId: number | null = null;
  sousCategorieId: number | null = null;
  coutId: number | null = null;
  centreTraitement = ''; // String pour le centre

  // Données pour les étapes
  stepNom = '';
  stepDescription = '';
  stepOrdre: number | null = null;
  etapes: any[] = [];

  // Données pour les documents requis
  documentNom = '';
  documentDescription = '';
  documentObligatoire = false;
  documentModeleUrl = '';
  documentsRequis: any[] = [];

  // Données pour les références légales
  referenceDescription = '';
  referenceTexte = '';
  referenceLienAudio = '';
  referencesLegales: any[] = [];

  // Indicateurs de chargement
  isLoading = false;
  isDataLoading = false;
  isCategoriesLoading = false;
  isSousCategoriesLoading = false;

  // Messages
  errorMessage = '';
  successMessage = '';

  // Listes pour les dropdowns
  categories: any[] = [];
  sousCategories: any[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Récupérer l'ID de la procédure depuis l'URL
    this.route.params.subscribe(params => {
      this.procedureId = +params['id'];
      if (this.procedureId) {
        this.loadCategories();
        this.loadSousCategories();
        this.loadProcedure();
      }
    });
  }

  /**
   * Charge la procédure à éditer
   */
  loadProcedure() {
    if (!this.procedureId) return;

    this.isDataLoading = true;
    this.apiService.getProcedures().subscribe({
      next: (procedures: any[]) => {
        const procedure = procedures.find(p => p.id === this.procedureId);
        if (procedure) {
          // Remplir le formulaire avec les données existantes
          this.nom = procedure.nom || '';
          this.titre = procedure.titre || '';
          this.delai = procedure.delai || '';
          this.description = procedure.description || '';
          this.urlVersFormulaire = procedure.urlVersFormulaire || '';
          this.categorieId = procedure.categorieId || null;
          this.sousCategorieId = procedure.sousCategorieId || null;
          this.coutId = procedure.coutId || null;
          this.centreTraitement = procedure.centreTraitement || '';
          
          // Charger les listes
          this.etapes = procedure.etapes || [];
          this.documentsRequis = procedure.documentsRequis || [];
          this.referencesLegales = procedure.referencesLegales || [];
        } else {
          this.errorMessage = 'Procédure non trouvée';
        }
        this.isDataLoading = false;
      },
      error: (error) => {
        console.error('Error loading procedure:', error);
        this.errorMessage = 'Erreur lors du chargement de la procédure';
        this.isDataLoading = false;
      }
    });
  }

  /**
   * Charge les catégories
   */
  loadCategories() {
    this.isCategoriesLoading = true;
    this.apiService.getCategories().subscribe({
      next: (response) => {
        this.categories = response;
        this.isCategoriesLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isCategoriesLoading = false;
      }
    });
  }

  /**
   * Charge les sous-catégories
   */
  loadSousCategories() {
    this.isSousCategoriesLoading = true;
    this.apiService.getSousCategories().subscribe({
      next: (response) => {
        this.sousCategories = response;
        this.isSousCategoriesLoading = false;
      },
      error: (error) => {
        console.error('Error loading sous-categories:', error);
        this.isSousCategoriesLoading = false;
      }
    });
  }

  // Méthodes pour gérer les étapes (identiques à add-procedure)
  addStep() {
    if (!this.stepNom || !this.stepDescription || this.stepOrdre === null) {
      alert('Veuillez remplir tous les champs de l\'étape');
      return;
    }

    this.etapes.push({
      nom: this.stepNom,
      description: this.stepDescription,
      ordre: this.stepOrdre
    });

    // Réinitialiser les champs
    this.stepNom = '';
    this.stepDescription = '';
    this.stepOrdre = null;
  }

  removeStep(index: number) {
    this.etapes.splice(index, 1);
  }

  // Méthodes pour gérer les documents
  addDocument() {
    if (!this.documentNom || !this.documentDescription) {
      alert('Veuillez remplir tous les champs du document');
      return;
    }

    this.documentsRequis.push({
      nom: this.documentNom,
      description: this.documentDescription,
      obligatoire: this.documentObligatoire,
      modeleUrl: this.documentModeleUrl
    });

    // Réinitialiser les champs
    this.documentNom = '';
    this.documentDescription = '';
    this.documentObligatoire = false;
    this.documentModeleUrl = '';
  }

  removeDocument(index: number) {
    this.documentsRequis.splice(index, 1);
  }

  // Méthodes pour gérer les références
  addReference() {
    if (!this.referenceDescription || !this.referenceTexte) {
      alert('Veuillez remplir tous les champs de la référence');
      return;
    }

    this.referencesLegales.push({
      description: this.referenceDescription,
      texteReference: this.referenceTexte,
      lienAudio: this.referenceLienAudio
    });

    // Réinitialiser les champs
    this.referenceDescription = '';
    this.referenceTexte = '';
    this.referenceLienAudio = '';
  }

  removeReference(index: number) {
    this.referencesLegales.splice(index, 1);
  }

  /**
   * Sauvegarde les modifications
   */
  saveProcedure() {
    // Validation
    if (!this.nom || !this.titre || !this.delai || !this.categorieId) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires (*)';
      return;
    }

    if (!this.procedureId) {
      this.errorMessage = 'ID de procédure invalide';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparation des données
    const procedureData = {
      nom: this.nom,
      titre: this.titre,
      delai: this.delai,
      description: this.description,
      urlVersFormulaire: this.urlVersFormulaire,
      categorieId: this.categorieId,
      sousCategorieId: this.sousCategorieId,
      coutId: this.coutId,
      centreTraitement: this.centreTraitement,
      etapes: this.etapes,
      documentsRequis: this.documentsRequis,
      referencesLegales: this.referencesLegales
    };

    this.apiService.updateProcedure(this.procedureId, procedureData).subscribe({
      next: (response) => {
        console.log('Procedure updated:', response);
        this.successMessage = 'Procédure mise à jour avec succès!';
        this.isLoading = false;
        
        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/procedures']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error updating procedure:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour de la procédure';
        this.isLoading = false;
      }
    });
  }

  /**
   * Annule et retourne à la liste
   */
  cancel() {
    this.router.navigate(['/procedures']);
  }
}


