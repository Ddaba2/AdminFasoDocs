import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service de cache et de synchronisation des données en temps réel
 * 
 * Ce service permet d'éviter les rechargements inutiles en maintenant
 * un cache local et en notifiant tous les composants des changements
 */
@Injectable({
  providedIn: 'root'
})
export class DataCacheService {
  // Cache pour les catégories
  private categoriesSubject = new BehaviorSubject<any[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  // Cache pour les sous-catégories
  private subcategoriesSubject = new BehaviorSubject<any[]>([]);
  public subcategories$ = this.subcategoriesSubject.asObservable();

  // Cache pour les utilisateurs
  private usersSubject = new BehaviorSubject<any[]>([]);
  public users$ = this.usersSubject.asObservable();

  // Cache pour les procédures
  private proceduresSubject = new BehaviorSubject<any[]>([]);
  public procedures$ = this.proceduresSubject.asObservable();

  constructor() {}

  // ========== CATEGORIES ==========
  
  setCategories(categories: any[]) {
    this.categoriesSubject.next(categories);
  }

  getCategories(): any[] {
    return this.categoriesSubject.value;
  }

  addCategory(category: any) {
    const current = this.categoriesSubject.value;
    this.categoriesSubject.next([...current, category]);
  }

  updateCategory(updatedCategory: any) {
    const current = this.categoriesSubject.value;
    const index = current.findIndex(c => c.id === updatedCategory.id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updatedCategory };
      this.categoriesSubject.next([...current]);
    }
  }

  removeCategory(categoryId: number) {
    const current = this.categoriesSubject.value;
    this.categoriesSubject.next(current.filter(c => c.id !== categoryId));
  }

  // ========== SUBCATEGORIES ==========
  
  setSubcategories(subcategories: any[]) {
    this.subcategoriesSubject.next(subcategories);
  }

  getSubcategories(): any[] {
    return this.subcategoriesSubject.value;
  }

  addSubcategory(subcategory: any) {
    const current = this.subcategoriesSubject.value;
    this.subcategoriesSubject.next([...current, subcategory]);
  }

  updateSubcategory(updatedSubcategory: any) {
    const current = this.subcategoriesSubject.value;
    const index = current.findIndex(s => s.id === updatedSubcategory.id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updatedSubcategory };
      this.subcategoriesSubject.next([...current]);
    }
  }

  removeSubcategory(subcategoryId: number) {
    const current = this.subcategoriesSubject.value;
    this.subcategoriesSubject.next(current.filter(s => s.id !== subcategoryId));
  }

  // ========== USERS ==========
  
  setUsers(users: any[]) {
    this.usersSubject.next(users);
  }

  getUsers(): any[] {
    return this.usersSubject.value;
  }

  addUser(user: any) {
    const current = this.usersSubject.value;
    this.usersSubject.next([...current, user]);
  }

  updateUser(updatedUser: any) {
    const current = this.usersSubject.value;
    const index = current.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updatedUser };
      this.usersSubject.next([...current]);
    }
  }

  removeUser(userId: number) {
    const current = this.usersSubject.value;
    this.usersSubject.next(current.filter(u => u.id !== userId));
  }

  // ========== PROCEDURES ==========
  
  setProcedures(procedures: any[]) {
    this.proceduresSubject.next(procedures);
  }

  getProcedures(): any[] {
    return this.proceduresSubject.value;
  }

  addProcedure(procedure: any) {
    const current = this.proceduresSubject.value;
    this.proceduresSubject.next([...current, procedure]);
  }

  updateProcedure(updatedProcedure: any) {
    const current = this.proceduresSubject.value;
    const index = current.findIndex(p => p.id === updatedProcedure.id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updatedProcedure };
      this.proceduresSubject.next([...current]);
    }
  }

  removeProcedure(procedureId: number) {
    const current = this.proceduresSubject.value;
    this.proceduresSubject.next(current.filter(p => p.id !== procedureId));
  }

  // ========== UTILITIES ==========
  
  clearAllCache() {
    this.categoriesSubject.next([]);
    this.subcategoriesSubject.next([]);
    this.usersSubject.next([]);
    this.proceduresSubject.next([]);
  }
}

