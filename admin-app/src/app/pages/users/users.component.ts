import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

/**
 * Composant de gestion des utilisateurs
 *
 * Ce composant affiche la liste de tous les utilisateurs enregistrés dans le système.
 * Les données sont récupérées depuis le backend Spring Boot via l'API.
 *
 * Fonctionnalités actuelles:
 * - Affichage de la liste des utilisateurs
 *
 * À implémenter:
 * - Modification des utilisateurs
 * - Suppression des utilisateurs
 * - Filtrage et recherche
 */
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  // Liste des utilisateurs récupérés depuis le backend
  users: any[] = [];

  // Indicateur de chargement des données
  isLoading = false;

  // Message d'erreur en cas d'échec de chargement
  error = '';

  /**
   * Constructeur du composant Users
   * @param apiService - Service API pour les appels backend
   */
  constructor(private apiService: ApiService) {}

  /**
   * Lifecycle hook appelé au démarrage du composant
   * Charge automatiquement la liste des utilisateurs
   */
  ngOnInit() {
    this.loadUsers();
  }

  /**
   * Charge la liste des utilisateurs depuis le backend
   *
   * Appelle l'endpoint /api/users du backend Spring Boot
   * pour récupérer tous les utilisateurs enregistrés
   */
  loadUsers() {
    this.isLoading = true;
    this.error = '';

    this.apiService.getUsers().subscribe({
      next: (response) => {
        // Mise à jour de la liste des utilisateurs avec les données du backend
        this.users = response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error = 'Erreur lors du chargement des utilisateurs';
        this.isLoading = false;
      }
    });
  }

  // TODO: Implémenter les méthodes pour modifier/supprimer des utilisateurs
}
