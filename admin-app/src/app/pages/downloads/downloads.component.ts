import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Composant de gestion des téléchargements
 *
 * Ce composant affiche l'historique des téléchargements de données effectués
 * par les administrateurs. Les données incluent l'email de l'utilisateur,
 * la date du téléchargement et le statut.
 *
 * Fonctionnalités:
 * - Affichage de la liste des téléchargements
 * - Affichage du statut (Complet, En cours, Arrêté)
 *
 * À implémenter:
 * - Récupération des téléchargements depuis le backend
 * - Filtrage et recherche
 * - Actions sur les téléchargements (réessayer, arrêter)
 *
 * Note: Les données sont actuellement statiques (hard-coded)
 */
@Component({
  selector: 'app-downloads',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './downloads.component.html',
  styleUrl: './downloads.component.css'
})
export class DownloadsComponent {
  // Liste des téléchargements
  // TODO: Récupérer ces données depuis le backend API
  downloads = [
    { email: 'Issiaka@gmail.com', date: '13/10/2025', status: 'Complet' },
    { email: 'traorea12@gmail.com', date: '12/07/2025', status: 'Complet' },
    { email: 'nouu98@gmail.com', date: '08/11/2025', status: 'En cours' },
    { email: 'moussatraore@gmail.com', date: '10/09/2025', status: 'Arrêter' }
  ];

  /**
   * Retourne la classe CSS appropriée en fonction du statut du téléchargement
   * Utilisée pour styliser le badge de statut
   *
   * @param status - Statut du téléchargement ('Complet', 'En cours', 'Arrêter')
   * @returns Classe CSS pour le statut
   */
  getStatusClass(status: string): string {
    if (status === 'Complet') return 'status-complete';
    if (status === 'En cours') return 'status-progress';
    if (status === 'Arrêter') return 'status-stopped';
    return '';
  }
}



