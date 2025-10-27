import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Composant de gestion des langues supportées
 *
 * Ce composant affiche la liste des langues supportées par l'application FasoDocs.
 * Actuellement, les données sont statiques (hard-coded).
 *
 * Fonctionnalités:
 * - Affichage de la liste des langues
 * - Affichage du statut (Active/Inactive)
 *
 * À implémenter:
 * - Récupération des langues depuis le backend
 * - Activation/désactivation des langues
 * - Ajout/suppression de langues
 *
 * Note: Les langues actuellement supportées sont:
 * - Français (fr) - Active
 * - Anglais (en) - Inactive
 * - Bambara (br) - Inactive
 * - Espagnol (es) - Active
 */
@Component({
  selector: 'app-languages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './languages.component.html',
  styleUrl: './languages.component.css'
})
export class LanguagesComponent {
  // Liste des langues supportées par l'application
  // TODO: Récupérer ces données depuis le backend
  languages = [
    { language: 'Français', code: 'fr', status: 'Active' },
    { language: 'Anglais', code: 'en', status: 'Inactive' },
    { language: 'Bambara', code: 'br', status: 'Inactive' },
    { language: 'Espagnole', code: 'es', status: 'Active' }
  ];

  /**
   * Retourne la classe CSS appropriée en fonction du statut
   * Utilisée pour styliser le badge de statut
   *
   * @param status - Statut de la langue ('Active' ou 'Inactive')
   * @returns Classe CSS pour le statut
   */
  getStatusClass(status: string): string {
    return status === 'Active' ? 'status-active' : 'status-inactive';
  }
}



