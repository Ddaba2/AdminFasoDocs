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
  // Données de base
  nom = '';  // Nom de la procédure (max 200 caractères) - OBLIGATOIRE
  titre = '';  // Titre de la procédure (max 100 caractères) - OBLIGATOIRE
  description = '';
  categorieId: number | null = null;
  sousCategorieId: number | null = null;
  delai = '';  // Délai d'exécution (max 500 caractères) - OBLIGATOIRE
  urlVersFormulaire = '';  // URL vers formulaire en ligne (optionnel)
  coutId: number | null = null;  // ID du coût associé (optionnel)
  centreId: number | null = null;  // ID du centre de traitement (optionnel)
  cout: number | null = null;
  typeMonnaie = 'FCFA';

  // Tableaux de données
  prerequis: string[] = [];
  etapes: any[] = [];
  documentsRequis: any[] = [];
  centres: any[] = [];
  loisArticles: any[] = [];
  conseils: string[] = [];
  piecesJustificatives: string[] = [];
  urlReferences: string[] = [];

  // Champs temporaires pour l'ajout
  newPrerequis = '';
  newConseil = '';
  newPieceJustificative = '';
  newUrlReference = '';

  // Données pour les étapes
  stepNumero: number | null = null;
  stepTitre = '';
  stepDescription = '';
  stepDuree = '';
  stepCout: number | null = null;
  stepTypeMonnaie = 'FCFA';

  // Données pour les documents requis
  documentNom = '';
  documentDescription = '';
  documentObligatoire = false;

  // Données pour les centres
  centreNom = '';
  centreAdresse = '';
  centreTelephone = '';
  centreEmail = '';
  centreHoraires = '';
  centreLatitude: number | null = null;
  centreLongitude: number | null = null;

  // Données pour les lois/articles
  loiTitre = '';
  loiContenu = '';
  loiUrl = '';

  // Liste des catégories et sous-catégories
  categories: any[] = [];
  sousCategories: any[] = [];

  // Indicateur de chargement
  isLoading = false;
  isCategoriesLoading = false;
  isSousCategoriesLoading = false;

  // Messages
  errorMessage = '';
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


  // === MÉTHODES POUR AJOUTER DES ÉLÉMENTS AUX TABLEAUX ===

  addPrerequis() {
    if (this.newPrerequis.trim()) {
      this.prerequis.push(this.newPrerequis.trim());
      this.newPrerequis = '';
    }
  }

  removePrerequis(index: number) {
    this.prerequis.splice(index, 1);
  }

  addConseil() {
    if (this.newConseil.trim()) {
      this.conseils.push(this.newConseil.trim());
      this.newConseil = '';
    }
  }

  removeConseil(index: number) {
    this.conseils.splice(index, 1);
  }

  addPieceJustificative() {
    if (this.newPieceJustificative.trim()) {
      this.piecesJustificatives.push(this.newPieceJustificative.trim());
      this.newPieceJustificative = '';
    }
  }

  removePieceJustificative(index: number) {
    this.piecesJustificatives.splice(index, 1);
  }

  addUrlReference() {
    if (this.newUrlReference.trim()) {
      this.urlReferences.push(this.newUrlReference.trim());
      this.newUrlReference = '';
    }
  }

  removeUrlReference(index: number) {
    this.urlReferences.splice(index, 1);
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
    if (this.stepTitre && this.stepDescription && this.stepNumero !== null) {
      this.etapes.push({
        numero: this.stepNumero,
        titre: this.stepTitre,
        description: this.stepDescription,
        duree: this.stepDuree || '',
        cout: this.stepCout || 0,
        typeMonnaie: this.stepTypeMonnaie
      });

      // Réinitialiser les champs
      this.stepNumero = null;
      this.stepTitre = '';
      this.stepDescription = '';
      this.stepDuree = '';
      this.stepCout = null;
      this.stepTypeMonnaie = 'FCFA';
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
        obligatoire: this.documentObligatoire
      });

      // Réinitialiser les champs
      this.documentNom = '';
      this.documentDescription = '';
      this.documentObligatoire = false;
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
   * Ajoute un centre à la liste
   */
  addCentre() {
    if (this.centreNom && this.centreAdresse) {
      this.centres.push({
        nom: this.centreNom,
        adresse: this.centreAdresse,
        telephone: this.centreTelephone || '',
        email: this.centreEmail || '',
        horaires: this.centreHoraires || '',
        latitude: this.centreLatitude || 0,
        longitude: this.centreLongitude || 0
      });

      // Réinitialiser les champs
      this.centreNom = '';
      this.centreAdresse = '';
      this.centreTelephone = '';
      this.centreEmail = '';
      this.centreHoraires = '';
      this.centreLatitude = null;
      this.centreLongitude = null;
    }
  }

  removeCentre(index: number) {
    this.centres.splice(index, 1);
  }

  /**
   * Ajoute une loi/article à la liste
   */
  addLoi() {
    if (this.loiTitre && this.loiContenu) {
      this.loisArticles.push({
        titre: this.loiTitre,
        contenu: this.loiContenu,
        url: this.loiUrl || ''
      });

      // Réinitialiser les champs
      this.loiTitre = '';
      this.loiContenu = '';
      this.loiUrl = '';
    }
  }

  removeLoi(index: number) {
    this.loisArticles.splice(index, 1);
  }

  /**
   * Enregistre une nouvelle procédure
   */
  saveProcedure() {
    // Validation des champs obligatoires
    if (!this.nom || !this.titre || !this.delai || !this.categorieId) {
      this.errorMessage = 'Les champs Nom, Titre, Délai et Catégorie sont obligatoires';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparation des données selon le format complet du backend
    const procedureData: any = {
      // Champs obligatoires
      nom: this.nom,
      titre: this.titre,
      delai: this.delai,
      categorieId: Number(this.categorieId),
      
      // Champs optionnels de base
      description: this.description || '',
      urlVersFormulaire: this.urlVersFormulaire || undefined,
      sousCategorieId: this.sousCategorieId ? Number(this.sousCategorieId) : undefined,
      
      // IDs optionnels
      coutId: this.coutId ? Number(this.coutId) : undefined,
      centreId: this.centreId ? Number(this.centreId) : undefined,
      
      // Étapes (tableau de strings selon la spec)
      etapes: this.etapes.map(e => e.description || e.titre || '').filter(e => e),
      
      // Anciens champs (à conserver pour compatibilité si nécessaire)
      cout: this.cout || 0,
      typeMonnaie: this.typeMonnaie,
      prerequis: this.prerequis,
      documentsRequis: this.documentsRequis,
      centres: this.centres,
      loisArticles: this.loisArticles,
      conseils: this.conseils,
      piecesJustificatives: this.piecesJustificatives,
      urlReferences: this.urlReferences
    };
    
    // Supprimer les propriétés undefined pour un JSON plus propre
    Object.keys(procedureData).forEach(key => 
      procedureData[key] === undefined && delete procedureData[key]
    );
    
    console.log('📤 Procédure complète envoyée:', JSON.stringify(procedureData, null, 2));

    this.apiService.createProcedure(procedureData).subscribe({
      next: (response: any) => {
        console.log('✅ Procedure created:', response);
        this.successMessage = 'Procédure créée avec succès!';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/procedures']);
        }, 2000);
      },
      error: (error: any) => {
        console.error('❌ Error creating procedure:', error);
        
        if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Erreur de validation des données';
        } else if (error.status === 500) {
          this.errorMessage = 'Erreur serveur. Vérifiez les logs du serveur.';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur.';
        } else {
          this.errorMessage = error.error?.message || 'Erreur lors de la création';
        }
        
        this.isLoading = false;
      }
    });
  }
}