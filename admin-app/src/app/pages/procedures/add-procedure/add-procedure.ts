import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';

/**
 * Composant pour ajouter une nouvelle procédure
 *
 * Ce composant permet d'ajouter de nouvelles procédures au système:
 * - Formulaire pour saisir les informations de la procédure
 * - Validation des données
 * - Envoi des données au backend Spring Boot via l'API
 */
@Component({
  selector: 'app-add-procedure',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-procedure.html',
  styleUrl: './add-procedure.css'
})
export class AddProcedure implements OnInit {
  // Données du formulaire
  nom = '';
  titre = '';
  delai = '';
  description = '';
  urlVersFormulaire = '';
  categorieId: number | null = null;
  categorieNom = ''; // Nom de la catégorie pour le backend
  sousCategorieId: number | null = null;
  sousCategorieNom = ''; // Nom de la sous-catégorie pour le backend
  centreId: number | null = null;
  coutId: number | null = null;

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

  // Liste des catégories (pour le formulaire)
  categories: any[] = [];
  
  // Liste des sous-catégories (pour le formulaire)
  sousCategories: any[] = [];
  
  // Liste des centres (pour le formulaire)
  centres: any[] = [];
  
  // Liste des coûts (pour le formulaire)
  couts: any[] = [];

  // Indicateur de chargement
  isLoading = false;
  isCategoriesLoading = false;
  isSousCategoriesLoading = false;
  isCentresLoading = false;
  isCoutsLoading = false;

  // Message d'erreur
  errorMessage = '';

  // Message de succès
  successMessage = '';

  /**
   * Constructeur du composant AddProcedure
   * @param apiService - Service API pour les appels backend
   * @param router - Service de routage
   */
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  /**
   * Lifecycle hook appelé au démarrage du composant
   * Charge automatiquement les catégories, sous-catégories, centres et coûts
   */
  ngOnInit() {
    this.loadCategories();
    this.loadSousCategories();
    this.loadCentres();
    this.loadCouts();
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
      next: (response: any) => {
        // Mise à jour de la liste des catégories
        this.categories = response;
        this.isCategoriesLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading categories for form:', err);
        this.errorMessage = 'Erreur lors du chargement des catégories pour le formulaire';
        this.isCategoriesLoading = false;
      }
    });
  }

  /**
   * Charge la liste des sous-catégories depuis le backend
   */
  loadSousCategories() {
    this.isSousCategoriesLoading = true;
    this.apiService.getSousCategories().subscribe({
      next: (response: any) => {
        this.sousCategories = response;
        this.isSousCategoriesLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading subcategories:', err);
        this.errorMessage = 'Erreur lors du chargement des sous-catégories';
        this.isSousCategoriesLoading = false;
      }
    });
  }

  /**
   * Charge la liste des centres depuis le backend
   */
  loadCentres() {
    this.isCentresLoading = true;
    this.apiService.getCentres().subscribe({
      next: (response: any) => {
        this.centres = response;
        this.isCentresLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading centres:', err);
        this.errorMessage = 'Erreur lors du chargement des centres';
        this.isCentresLoading = false;
      }
    });
  }

  /**
   * Charge la liste des coûts depuis le backend
   */
  loadCouts() {
    this.isCoutsLoading = true;
    this.apiService.getCouts().subscribe({
      next: (response: any) => {
        this.couts = response;
        this.isCoutsLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading couts:', err);
        this.errorMessage = 'Erreur lors du chargement des coûts';
        this.isCoutsLoading = false;
      }
    });
  }

  /**
   * Met à jour le nom de la catégorie quand l'ID change
   */
  onCategorieChange() {
    if (this.categorieId) {
      const categorie = this.categories.find(c => c.id === Number(this.categorieId));
      this.categorieNom = categorie ? categorie.titre : '';
      console.log('Catégorie sélectionnée:', this.categorieNom);
    }
  }

  /**
   * Met à jour le nom de la sous-catégorie quand la sélection change
   */
  onSousCategorieChange() {
    if (this.sousCategorieId) {
      const sousCategorie = this.sousCategories.find(sc => sc.id === Number(this.sousCategorieId));
      this.sousCategorieNom = sousCategorie ? (sousCategorie.nom || sousCategorie.titre || '') : '';
      console.log('Sous-catégorie sélectionnée:', this.sousCategorieNom);
    } else {
      this.sousCategorieNom = '';
    }
  }

  /**
   * Annule l'opération et retourne à la liste des procédures
   */
  cancel() {
    this.router.navigate(['/procedures']);
  }

  /**
   * Ajoute une étape à la liste
   */
  addStep() {
    if (this.stepNom && this.stepDescription && this.stepOrdre !== null) {
      this.etapes.push({
        nom: this.stepNom,
        description: this.stepDescription,
        ordre: this.stepOrdre
      });

      // Réinitialiser les champs d'étape
      this.stepNom = '';
      this.stepDescription = '';
      this.stepOrdre = null;
    }
  }

  /**
   * Supprime une étape de la liste
   * @param index Index de l'étape à supprimer
   */
  removeStep(index: number) {
    this.etapes.splice(index, 1);
  }

  /**
   * Ajoute un document requis à la liste
   */
  addDocument() {
    if (this.documentNom && this.documentDescription) {
      this.documentsRequis.push({
        nom: this.documentNom,
        description: this.documentDescription,
        obligatoire: this.documentObligatoire,
        modeleUrl: this.documentModeleUrl || null
      });

      // Réinitialiser les champs de document
      this.documentNom = '';
      this.documentDescription = '';
      this.documentObligatoire = false;
      this.documentModeleUrl = '';
    }
  }

  /**
   * Supprime un document requis de la liste
   * @param index Index du document à supprimer
   */
  removeDocument(index: number) {
    this.documentsRequis.splice(index, 1);
  }

  /**
   * Ajoute une référence légale à la liste
   */
  addReference() {
    if (this.referenceDescription && this.referenceTexte) {
      this.referencesLegales.push({
        description: this.referenceDescription,
        texteReference: this.referenceTexte,
        lienAudio: this.referenceLienAudio || null
      });

      // Réinitialiser les champs de référence
      this.referenceDescription = '';
      this.referenceTexte = '';
      this.referenceLienAudio = '';
    }
  }

  /**
   * Supprime une référence légale de la liste
   * @param index Index de la référence à supprimer
   */
  removeReference(index: number) {
    this.referencesLegales.splice(index, 1);
  }

  /**
   * Enregistre une nouvelle procédure
   */
  saveProcedure() {
    // Validation simple du formulaire
    if (!this.nom || !this.titre || !this.delai || !this.categorieNom) {
      this.errorMessage = 'Les champs Nom, Titre, Délai et Catégorie sont obligatoires';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Convertir les étapes en tableau de strings simples (format attendu par le backend)
    const etapesSimples = this.etapes.map(e => e.description || e.nom || '');

    // Préparation des données selon le format attendu par le backend
    const procedureData = {
      nom: this.nom,
      titre: this.titre,
      delai: this.delai,
      description: this.description || '',
      urlVersFormulaire: this.urlVersFormulaire || '',
      categorieNom: this.categorieNom,  // Nom de la catégorie (pas l'ID)
      sousCategorieNom: this.sousCategorieNom || '',  // Nom de la sous-catégorie (optionnel)
      centreId: this.centreId ? Number(this.centreId) : undefined,  // ID du centre (optionnel)
      coutId: this.coutId ? Number(this.coutId) : undefined,  // ID du coût (optionnel)
      etapes: etapesSimples  // Tableau simple de strings
    };
    
    // Log pour debugging
    console.log('📤 Données envoyées au backend:', JSON.stringify(procedureData, null, 2));

    // Création
    this.apiService.createProcedure(procedureData).subscribe({
      next: (response: any) => {
        console.log('Procedure created:', response);
        this.successMessage = 'Procédure créée avec succès!';
        this.isLoading = false;
        // Redirection vers la liste après succès
        setTimeout(() => {
          this.router.navigate(['/procedures']);
        }, 2000);
      },
      error: (error: any) => {
        console.error('Error creating procedure:', error);
        console.error('Error status:', error.status);
        console.error('Error details:', error.error);
        console.error('Data sent:', procedureData);
        
        // Message d'erreur détaillé selon le type d'erreur
        if (error.status === 400) {
          this.errorMessage = error.error?.message || 
            'Erreur de validation : Vérifiez que tous les champs obligatoires sont remplis correctement';
        } else if (error.status === 500) {
          this.errorMessage = 'Erreur serveur : Le backend a rencontré une erreur. Vérifiez les logs du serveur.';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
        } else {
          this.errorMessage = error.error?.message || 'Erreur lors de la création de la procédure';
        }
        
        this.isLoading = false;
      }
    });
  }
}