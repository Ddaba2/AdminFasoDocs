import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { DialogService } from '../../../services/dialog.service';
import { DataCacheService } from '../../../services/data-cache.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

/**
 * Composant de gestion des utilisateurs
 *
 * Ce composant affiche la liste de tous les utilisateurs enregistrés dans le système.
 * Les données sont récupérées depuis le backend Spring Boot via l'API.
 *
 * Fonctionnalités:
 * - Affichage de la liste des utilisateurs
 * - Suppression des utilisateurs
 */
@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent implements OnInit, OnDestroy {
  // Liste des utilisateurs récupérés depuis le backend
  users: any[] = [];

  // Indicateur de chargement des données
  isLoading = false;

  // Message d'erreur en cas d'échec de chargement
  error = '';

  // Message de succès
  successMessage = '';

  // Retry counter to prevent infinite loops
  private retryCount = 0;
  private maxRetries = 3;
  
  // Subscription pour le cache
  private usersSubscription?: Subscription;

  /**
   * Constructeur du composant Users
   * @param apiService - Service API pour les appels backend
   * @param dialogService - Service de gestion des boîtes de dialogue
   * @param router - Service de routage
   */
  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    private router: Router,
    private dataCache: DataCacheService
  ) {}

  /**
   * Lifecycle hook appelé au démarrage du composant
   * Charge automatiquement la liste des utilisateurs
   */
  ngOnInit() {
    // S'abonner au cache pour les mises à jour en temps réel
    this.usersSubscription = this.dataCache.users$.subscribe({
      next: (users) => {
        this.users = users;
      }
    });

    // Charger les données seulement si le cache est vide
    if (this.dataCache.getUsers().length === 0) {
      this.loadUsers();
    }
  }

  ngOnDestroy() {
    this.usersSubscription?.unsubscribe();
  }

  /**
   * Charge la liste des utilisateurs depuis le backend
   *
   * Appelle l'endpoint /admin/utilisateurs du backend Spring Boot
   * pour récupérer tous les utilisateurs enregistrés
   */
  loadUsers() {
    // Prevent infinite retry loops
    if (this.retryCount >= this.maxRetries) {
      this.error = 'Impossible de charger la liste des utilisateurs après plusieurs tentatives.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.successMessage = '';

    this.apiService.getUsers().subscribe({
      next: (response: any) => {
        // Mettre à jour le cache au lieu de mettre à jour localement
        this.dataCache.setUsers(response);
        this.isLoading = false;
        this.retryCount = 0; // Reset retry counter on success
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        console.error('Error status:', err.status);
        console.error('Error details:', err.error);
        this.retryCount++;
        
        // Message d'erreur détaillé
        if (err.status === 500) {
          this.error = '❌ Erreur serveur (500) : Le backend a une erreur interne. Vérifiez les logs du serveur Spring Boot.';
        } else if (err.status === 0) {
          this.error = '❌ Impossible de contacter le serveur. Vérifiez que le backend est démarré sur http://localhost:8080';
        } else if (err.status === 401) {
          this.error = '❌ Non autorisé. Votre session a peut-être expiré. Reconnectez-vous.';
        } else {
          this.error = `❌ Erreur lors du chargement des utilisateurs (Code ${err.status})`;
        }
        
        this.isLoading = false;
      }
    });
  }

  /**
   * Navigue vers la page d'ajout d'utilisateur
   */
  addUser() {
    this.router.navigate(['/users/add']);
  }

  /**
   * Active un utilisateur
   * @param userId - ID de l'utilisateur à activer
   */
  activateUser(userId: number) {
    const user = this.users.find(u => u.id === userId);
    const userName = user ? `${user.prenom} ${user.nom}` : 'cet utilisateur';
    
    this.dialogService.confirm({
      title: '✅ Activation du compte',
      message: `Voulez-vous vraiment activer le compte de ${userName} ?\n\nL'utilisateur pourra se connecter et accéder à l'application.`,
      confirmText: 'Activer',
      type: 'info'
    }).subscribe((result: any) => {
      if (result.confirmed) {
        this.isLoading = true;
        this.apiService.activateUser(userId).subscribe({
          next: (response: any) => {
            console.log('✅ User activated successfully:', response);
            // Recharger la liste pour mettre à jour le statut
            this.loadUsers();
            this.successMessage = `✅ Le compte de ${userName} a été activé avec succès!`;
            this.isLoading = false;
            
            // Cacher le message après 5 secondes
            setTimeout(() => {
              this.successMessage = '';
            }, 5000);
          },
          error: (error: any) => {
            console.error('Error activating user:', error);
            
            if (error.status === 500) {
              this.error = '❌ Erreur serveur : Impossible d\'activer l\'utilisateur.';
            } else if (error.status === 0) {
              this.error = '❌ Backend non accessible.';
            } else {
              this.error = error.error?.message || `❌ Erreur lors de l'activation (Code ${error.status})`;
            }
            
            this.isLoading = false;
          }
        });
      }
    });
  }

  /**
   * Désactive un utilisateur
   * @param userId - ID de l'utilisateur à désactiver
   */
  deactivateUser(userId: number) {
    const user = this.users.find(u => u.id === userId);
    
    if (!user) {
      this.error = 'Utilisateur introuvable';
      return;
    }
    
    // Protection : empêcher la désactivation du dernier admin actif
    if (this.isLastActiveAdmin(user)) {
      this.error = '⚠️ Impossible de désactiver le dernier administrateur actif. Il doit y avoir au moins un administrateur actif dans le système.';
      setTimeout(() => {
        this.error = '';
      }, 5000);
      return;
    }
    
    const userName = `${user.prenom} ${user.nom}`;
    
    this.dialogService.confirm({
      title: '⚠️ Désactivation du compte',
      message: `Voulez-vous vraiment désactiver le compte de ${userName} ?\n\n⚠️ ATTENTION : L'utilisateur ne pourra plus se connecter à l'application.`,
      confirmText: 'Désactiver',
      type: 'delete'
    }).subscribe((result: any) => {
      if (result.confirmed) {
        this.isLoading = true;
        this.apiService.deactivateUser(userId).subscribe({
          next: (response: any) => {
            console.log('✅ User deactivated successfully:', response);
            // Recharger la liste pour mettre à jour le statut
            this.loadUsers();
            this.successMessage = `✅ Le compte de ${userName} a été désactivé avec succès!`;
            this.isLoading = false;
            
            // Cacher le message après 5 secondes
            setTimeout(() => {
              this.successMessage = '';
            }, 5000);
          },
          error: (error: any) => {
            console.error('Error deactivating user:', error);
            
            if (error.status === 500) {
              this.error = '❌ Erreur serveur : Impossible de désactiver l\'utilisateur.';
            } else if (error.status === 0) {
              this.error = '❌ Backend non accessible.';
            } else {
              this.error = error.error?.message || `❌ Erreur lors de la désactivation (Code ${error.status})`;
            }
            
            this.isLoading = false;
          }
        });
      }
    });
  }
  
  /**
   * Vérifie si l'utilisateur est le dernier admin actif
   * @param user - Utilisateur à vérifier
   * @returns true si c'est le dernier admin actif
   */
  isLastActiveAdmin(user: any): boolean {
    if (user.role !== 'ADMIN') {
      return false;
    }
    
    const activeAdmins = this.users.filter(u => u.role === 'ADMIN' && u.estActif);
    return activeAdmins.length <= 1;
  }
  
  /**
   * Vérifie si l'utilisateur est le dernier admin (actif ou non)
   * @param user - Utilisateur à vérifier
   * @returns true si c'est le dernier admin
   */
  isLastAdmin(user: any): boolean {
    if (user.role !== 'ADMIN') {
      return false;
    }
    
    const admins = this.users.filter(u => u.role === 'ADMIN');
    return admins.length <= 1;
  }

  /**
   * Supprime un utilisateur (avec confirmation)
   * @param userId - ID de l'utilisateur à supprimer
   */
  deleteUser(userId: number) {
    const user = this.users.find(u => u.id === userId);
    
    if (!user) {
      this.error = 'Utilisateur introuvable';
      return;
    }
    
    // Protection : empêcher la suppression du dernier admin
    if (this.isLastAdmin(user)) {
      this.error = '🚫 Impossible de supprimer le dernier administrateur. Il doit y avoir au moins un administrateur dans le système.';
      setTimeout(() => {
        this.error = '';
      }, 5000);
      return;
    }
    
    const userName = `${user.prenom} ${user.nom}`;
    
    this.dialogService.confirm({
      title: '🗑️ Suppression définitive',
      message: `Voulez-vous vraiment supprimer ${userName} ?\n\n🚨 ATTENTION : Cette action est IRRÉVERSIBLE. Toutes les données de l'utilisateur seront définitivement supprimées.`,
      confirmText: 'Supprimer',
      type: 'delete'
    }).subscribe((result: any) => {
      if (result.confirmed) {
        this.isLoading = true;
        this.apiService.deleteUser(userId).subscribe({
          next: (response: any) => {
            console.log('✅ User deleted successfully:', response);
            // Mettre à jour le cache (synchronisation en temps réel)
            this.dataCache.removeUser(userId);
            this.successMessage = `✅ ${userName} a été supprimé avec succès!`;
            this.isLoading = false;
            this.retryCount = 0; // Reset retry counter
            
            // Cacher le message après 5 secondes
            setTimeout(() => {
              this.successMessage = '';
            }, 5000);
          },
          error: (error: any) => {
            console.error('Error deleting user:', error);
            console.error('Error status:', error.status);
            console.error('Error details:', error.error);
            
            if (error.status === 500) {
              this.error = '❌ Erreur serveur (500) : Impossible de supprimer l\'utilisateur. Vérifiez les logs du backend.';
            } else if (error.status === 0) {
              this.error = '❌ Backend non accessible. Vérifiez que le serveur est démarré.';
            } else {
              this.error = error.error?.message || `❌ Erreur lors de la suppression (Code ${error.status})`;
            }
            
            this.isLoading = false;
          }
        });
      }
    });
  }
}