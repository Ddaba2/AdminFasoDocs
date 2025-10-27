import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

/**
 * Composant de gestion des procédures administratives
 *
 * Ce composant permet de créer et gérer les procédures administratives du système FasoDocs.
 * Une procédure contient:
 * - Informations générales (nom, titre, description)
 * - Catégorie et sous-catégorie
 * - Délai de traitement
 * - Centre de traitement
 * - Documents requis
 * - Étapes à suivre
 * - Références légales
 *
 * Fonctionnalités:
 * - Création de nouvelles procédures
 *
 * À implémenter:
 * - Ajout dynamique d'étapes (addStep)
 * - Ajout dynamique de documents (addDocument)
 * - Affichage de la liste des procédures existantes
 * - Modification des procédures
 * - Suppression des procédures
 */
@Component({
  selector: 'app-procedures',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './procedures.component.html',
  styleUrl: './procedures.component.css'
})
export class ProceduresComponent {
  // ====================
  // Champs du formulaire de procédure
  // ====================

  // Nom/titre de la procédure
  procedureName = '';

  // ID de la catégorie sélectionnée
  selectedCategory = '';

  // ID de la sous-catégorie sélectionnée (optionnel)
  selectedSubCategory = '';

  // Informations pour les étapes de la procédure
  stepName = '';
  stepLevel = '';
  stepDescription = '';

  // Informations pour les documents requis
  documentName = '';
  documentRequired = false;
  documentDescription = '';

  // Délai de traitement
  processingTime = '';
  selectedTimeUnit = 'Jours';

  // Centre de traitement de la procédure
  selectedCenter = '';

  // Références légales
  lawReference = '';

  // ====================
  // États de l'interface
  // ====================

  // Indicateur de chargement pendant la requête API
  isLoading = false;

  // Message de succès à afficher après création
  successMessage = '';

  // Message d'erreur à afficher en cas d'échec
  errorMessage = '';

  /**
   * Constructeur du composant Procedures
   * @param apiService - Service API pour les appels backend
   */
  constructor(private apiService: ApiService) {}

  /**
   * Méthode appelée lors de la soumission du formulaire de procédure
   *
   * Flux:
   * 1. Validation des champs requis (nom et catégorie)
   * 2. Préparation des données au format attendu par le backend
   * 3. Appel au service API pour créer la procédure
   * 4. En cas de succès: affichage message et réinitialisation du formulaire
   * 5. En cas d'erreur: affichage du message d'erreur
   */
  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validation des champs requis
    if (!this.procedureName || !this.selectedCategory) {
      this.errorMessage = 'Veuillez remplir tous les champs requis';
      return;
    }

    this.isLoading = true;

    // Préparation des données au format attendu par le backend
    const procedureData = {
      nom: this.procedureName,
      titre: this.procedureName,
      description: this.lawReference || '',
      delai: `${this.processingTime} ${this.selectedTimeUnit}`,
      categorieId: this.selectedCategory,
      sousCategorieId: this.selectedSubCategory || null,
      centreTraitement: this.selectedCenter || '',
      cout: null,
      documentsRequis: [], // Liste vide pour l'instant (à implémenter)
      etapes: [], // Liste vide pour l'instant (à implémenter)
      referencesLegales: []
    };

    // Appel API pour créer la procédure
    this.apiService.createProcedure(procedureData).subscribe({
      next: (response) => {
        console.log('Procedure created:', response);
        this.successMessage = 'Procédure créée avec succès!';
        this.isLoading = false;
        // Réinitialisation du formulaire après succès
        this.resetForm();
      },
      error: (error) => {
        console.error('Error creating procedure:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la création de la procédure';
        this.isLoading = false;
      }
    });
  }

  /**
   * Réinitialise tous les champs du formulaire
   * Utilisé après une création réussie ou en cas d'annulation
   */
  resetForm() {
    this.procedureName = '';
    this.selectedCategory = '';
    this.selectedSubCategory = '';
    this.lawReference = '';
    this.processingTime = '';
    this.selectedCenter = '';
    this.selectedTimeUnit = 'Jours';
  }

  /**
   * Ajoute une étape à la procédure
   *
   * TODO: Implémenter la logique pour gérer les étapes dynamiquement
   * Les étapes doivent être stockées dans un tableau et ajoutées à procedureData
   */
  addStep() {
    // TODO: Implémenter la logique pour ajouter des étapes
    console.log('Add step');
  }

  /**
   * Ajoute un document requis à la procédure
   *
   * TODO: Implémenter la logique pour gérer les documents requis dynamiquement
   * Les documents doivent être stockés dans un tableau et ajoutés à procedureData
   */
  addDocument() {
    // TODO: Implémenter la logique pour ajouter des documents
    console.log('Add document');
  }
}
