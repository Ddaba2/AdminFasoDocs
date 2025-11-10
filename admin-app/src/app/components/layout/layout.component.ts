import { Component, OnInit } from '@angular/core';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { DialogService, DialogData, DialogResult } from '../../services/dialog.service';
import { ConfirmDialogComponent } from './confirm-dialog.component';

/**
 * Composant de layout principal de l'application
 *
 * Ce composant gère la structure globale de l'application après connexion:
 * - Sidebar de navigation sur la gauche
 * - Header avec le label "Admin"
 * - Zone de contenu principal pour les composants enfants
 *
 * Le composant surveille les changements de route pour mettre à jour
 * l'élément actif dans la sidebar
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, ConfirmDialogComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
  dialogData: DialogData | null = null;
  private dialogResolver: ((result: DialogResult) => void) | null = null;
  showConfirmDialog = false;

  /**
   * Constructeur du composant Layout
   * @param router - Router Angular pour la navigation et le suivi des événements
   * @param authService - Service d'authentification pour la déconnexion
   * @param dialogService - Service de gestion des boîtes de dialogue
   */
  constructor(
    private router: Router, 
    private authService: AuthService,
    private dialogService: DialogService
  ) {
    // Surveille les changements de route pour mettre à jour la page active
    // Cela permet de mettre en surbrillance l'élément de menu actif
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.url;
      // Détermine quelle page est active en fonction de l'URL
      if (url.includes('/users')) this.activePage = 'users';
      else if (url.includes('/languages')) this.activePage = 'languages';
      else if (url.includes('/categories')) this.activePage = 'categories';
      else if (url.includes('/subcategories')) this.activePage = 'subcategories';
      else if (url.includes('/procedures')) this.activePage = 'procedures';
      else if (url.includes('/downloads')) this.activePage = 'downloads';
      else this.activePage = 'users'; // Page par défaut
    });
  }

  ngOnInit() {
    // Subscribe to dialog requests
    this.dialogService.dialogRequest$.subscribe(({ data, resolver }) => {
      this.dialogData = data;
      this.dialogResolver = resolver;
      this.showConfirmDialog = true;
    });
  }

  // Page active dans la sidebar (pour la mise en surbrillance CSS)
  activePage = 'users';

  /**
   * Déconnecte l'utilisateur
   * Appelle le service d'authentification pour gérer la déconnexion
   */
  logout() {
    this.authService.logout();
  }

  /**
   * Gère la confirmation du dialogue
   */
  onConfirm() {
    if (this.dialogResolver) {
      this.dialogResolver({ confirmed: true });
      this.showConfirmDialog = false;
      this.dialogData = null;
      this.dialogResolver = null;
    }
  }

  /**
   * Gère l'annulation du dialogue
   */
  onCancel() {
    if (this.dialogResolver) {
      this.dialogResolver({ confirmed: false });
      this.showConfirmDialog = false;
      this.dialogData = null;
      this.dialogResolver = null;
    }
  }
}