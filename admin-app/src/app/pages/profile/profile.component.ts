import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { ApiService } from '../../services/api.service';

interface UserProfile {
  id?: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
}

/**
 * Composant de profil de l'administrateur
 *
 * Permet de visualiser et modifier les informations personnelles
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, AfterViewInit {
  userProfile: UserProfile = {
    nom: '',
    prenom: '',
    telephone: '',
    email: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;

  // Sauvegarde des données originales pour annulation
  private originalProfile: UserProfile | null = null;

  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  ngAfterViewInit() {
    // Log après le rendu de la vue
    console.log('📺 AfterViewInit - userProfile:', this.userProfile);
  }

  /**
   * Charge les informations de l'utilisateur connecté
   */
  loadUserProfile() {
    this.isLoading = true;
    this.errorMessage = '';

    // Récupérer le numéro de téléphone stocké localement
    const userPhone = this.storageService.getItem('telephone');

    if (!userPhone) {
      this.errorMessage = 'Utilisateur non connecté';
      this.router.navigate(['/phone-input']);
      return;
    }

    // Afficher le téléphone pendant le chargement
    this.userProfile.telephone = userPhone;

    // Essayer d'abord de récupérer le profil directement via l'endpoint dédié
    console.log('🔐 Fetching current user profile from backend...');
    this.apiService.getCurrentUserProfile().subscribe({
      next: (user: any) => {
        console.log('✅ User profile received from /admin/profile:', user);

        this.userProfile = {
          id: user.id,
          nom: user.nom || '',
          prenom: user.prenom || '',
          telephone: user.telephone || user.numeroTelephone || userPhone,
          email: user.email || ''
        };
        console.log('✅ User profile loaded successfully:', this.userProfile);
        this.isLoading = false;

        // Forcer la détection de changements
        this.cdr.detectChanges();
        console.log('🔄 Change detection triggered');
      },
      error: (err) => {
        console.warn('⚠️ /admin/profile endpoint not available or error occurred:', err);
        console.log('📋 Falling back to searching in users list...');

        // Fallback: Charger tous les utilisateurs et trouver celui connecté
        this.loadUserProfileFromUsersList(userPhone);
      }
    });
  }

  /**
   * Méthode de fallback: charge le profil en cherchant dans la liste des utilisateurs
   */
  private loadUserProfileFromUsersList(userPhone: string) {
    this.apiService.getUsers().subscribe({
      next: (users: any[]) => {
        console.log('📋 All users received from backend:', users);
        console.log('🔍 Looking for user with phone:', userPhone);

        // Afficher tous les numéros de téléphone disponibles pour débogage
        const usersInfo = users.map(u => ({
          id: u.id,
          telephone: u.telephone,
          numeroTelephone: u.numeroTelephone,
          nom: u.nom,
          prenom: u.prenom
        }));
        console.log('📞 All phone numbers in database:', usersInfo);
        console.table(usersInfo); // Afficher dans un tableau pour mieux visualiser

        // Normaliser le numéro de téléphone recherché (enlever espaces, tirets, préfixes, etc.)
        const normalizePhone = (phone: string) => {
          if (!phone) return '';
          // Enlever tous les caractères non-numériques sauf le +
          let normalized = phone.replace(/[\s\-()]/g, '');
          // Enlever le préfixe international (+223, +226, etc.) pour ne garder que les chiffres locaux
          // Chercher les 8 derniers chiffres (format Burkina Faso)
          const digitsOnly = normalized.replace(/\D/g, ''); // Garder que les chiffres
          // Prendre les 8 derniers chiffres
          return digitsOnly.slice(-8);
        };

        const normalizedSearchPhone = normalizePhone(userPhone);

        console.log('🔍 Normalized search phone:', normalizedSearchPhone);

        // Trouver l'utilisateur par son numéro de téléphone (essayer plusieurs champs)
        let currentUser = users.find(user => {
          const userTel = normalizePhone(user.telephone);
          const userNumeroTel = normalizePhone(user.numeroTelephone);

          console.log(`🔎 Comparing: ${normalizedSearchPhone} with ${userTel} (from ${user.telephone})`);

          return userTel === normalizedSearchPhone || userNumeroTel === normalizedSearchPhone;
        });

        console.log('👤 Found current user:', currentUser);

        if (currentUser) {
          // Afficher en détail ce qui est dans la base de données
          console.log('📊 Détails de l\'utilisateur trouvé:');
          console.log('  - ID:', currentUser.id);
          console.log('  - Nom:', currentUser.nom, '(type:', typeof currentUser.nom, ')');
          console.log('  - Prénom:', currentUser.prenom, '(type:', typeof currentUser.prenom, ')');
          console.log('  - Email:', currentUser.email, '(type:', typeof currentUser.email, ')');
          console.log('  - Téléphone:', currentUser.telephone);
          console.log('  - Objet complet:', JSON.stringify(currentUser, null, 2));

          this.userProfile = {
            id: currentUser.id,
            nom: currentUser.nom || '',
            prenom: currentUser.prenom || '',
            telephone: currentUser.telephone || currentUser.numeroTelephone || userPhone,
            email: currentUser.email || ''
          };
          console.log('✅ User profile loaded:', this.userProfile);

          // Forcer la détection de changements pour mettre à jour l'affichage
          this.cdr.detectChanges();
          console.log('🔄 Change detection triggered');

          // Vérifier si les champs sont vides
          if (!currentUser.nom || !currentUser.prenom) {
            console.warn('⚠️ ATTENTION : Le nom et/ou prénom sont vides dans la base de données !');
            console.warn('💡 Vous devez compléter votre profil en cliquant sur "Modifier"');
          }
        } else {
          // Si l'utilisateur n'est pas trouvé, afficher au moins le téléphone
          this.userProfile.telephone = userPhone;
          this.errorMessage = 'Profil utilisateur incomplet. Veuillez vérifier que vos informations sont enregistrées.';
          console.warn('⚠️ User not found in the list');
          console.warn('💡 Searched phone (original):', userPhone);
          console.warn('💡 Searched phone (normalized):', normalizedSearchPhone);

          // Afficher tous les téléphones disponibles normalisés
          const availablePhones = users.map(u => ({
            id: u.id,
            nom: u.nom,
            prenom: u.prenom,
            originalPhone: u.telephone || u.numeroTelephone,
            normalizedPhone: normalizePhone(u.telephone || u.numeroTelephone)
          }));
          console.warn('💡 Available phones in database:');
          console.table(availablePhones);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        // En cas d'erreur, afficher au moins le numéro de téléphone
        this.userProfile.telephone = userPhone;
        this.errorMessage = 'Impossible de charger toutes les informations';
        this.isLoading = false;
      }
    });
  }

  /**
   * Active le mode édition
   */
  startEdit() {
    this.originalProfile = { ...this.userProfile };
    this.isEditMode = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Annule l'édition et restaure les données originales
   */
  cancelEdit() {
    if (this.originalProfile) {
      this.userProfile = { ...this.originalProfile };
      this.originalProfile = null;
    }
    this.isEditMode = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Sauvegarde les modifications du profil
   */
  saveProfile() {
    // Validation
    if (!this.userProfile.nom || !this.userProfile.prenom || !this.userProfile.telephone) {
      this.errorMessage = 'Le nom, prénom et téléphone sont obligatoires';
      return;
    }

    // Validation de l'email si fourni
    if (this.userProfile.email && !this.isValidEmail(this.userProfile.email)) {
      this.errorMessage = 'Format d\'email invalide';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userId = this.userProfile.id;

    const profileData = {
      nom: this.userProfile.nom,
      prenom: this.userProfile.prenom,
      telephone: this.userProfile.telephone,
      email: this.userProfile.email,
      role: 'ADMIN' // L'utilisateur connecté est ADMIN
    };

    // Si l'utilisateur n'a pas d'ID, créer un nouvel utilisateur
    const request = userId
      ? this.apiService.updateUser(userId, profileData)
      : this.apiService.createUser({...profileData, motDePasse: 'temp123'}); // Mot de passe temporaire

    request.subscribe({
      next: (response: any) => {
        const wasCreation = !userId;
        console.log(wasCreation ? 'Profile created:' : 'Profile updated:', response);

        this.userProfile = {
          id: response.id,
          nom: response.nom || '',
          prenom: response.prenom || '',
          telephone: response.telephone || '',
          email: response.email || ''
        };

        // Mettre à jour le téléphone en storage si il a changé
        if (response.telephone) {
          this.storageService.setItem('telephone', response.telephone);
        }

        this.successMessage = wasCreation
          ? '✅ Profil créé avec succès!'
          : '✅ Profil mis à jour avec succès!';
        this.isEditMode = false;
        this.originalProfile = null;
        this.isLoading = false;

        // Cacher le message d'erreur s'il y en avait un
        this.errorMessage = '';

        // Cacher le message après 3 secondes
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour du profil';
        this.isLoading = false;
      }
    });
  }

  /**
   * Valide le format d'un email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Retourne aux paramètres ou à la page principale
   */
  goBack() {
    this.router.navigate(['/users']);
  }
}

