import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Service for safely handling storage operations
 * Provides fallback mechanisms when sessionStorage is not available
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // Fallback storage for when sessionStorage is not available
  private fallbackStorage: Map<string, string> = new Map();
  
  // Track if we've already warned about storage availability
  private hasWarnedAboutStorage = false;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Check if sessionStorage is available
   */
  isStorageAvailable(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    
    try {
      return typeof sessionStorage !== 'undefined' && sessionStorage !== null;
    } catch (e) {
      return false;
    }
  }

  /**
   * Safely get item from storage
   */
  getItem(key: string): string | null {
    // Return null for server-side rendering
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    
    try {
      // Try to use sessionStorage
      if (typeof sessionStorage !== 'undefined' && sessionStorage !== null) {
        return sessionStorage.getItem(key);
      }
    } catch (e) {
      // Only warn once about storage availability
      if (!this.hasWarnedAboutStorage) {
        console.warn('⚠️ sessionStorage is not available (private browsing mode?). Using in-memory fallback.');
        this.hasWarnedAboutStorage = true;
      }
    }
    
    // Fallback to in-memory storage
    return this.fallbackStorage.get(key) || null;
  }

  /**
   * Safely set item in storage
   */
  setItem(key: string, value: string): void {
    // Do nothing for server-side rendering
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    try {
      // Try to use sessionStorage
      if (typeof sessionStorage !== 'undefined' && sessionStorage !== null) {
        sessionStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // Only warn once about storage availability
      if (!this.hasWarnedAboutStorage) {
        console.warn('⚠️ sessionStorage is not available (private browsing mode?). Using in-memory fallback.');
        this.hasWarnedAboutStorage = true;
      }
    }
    
    // Fallback to in-memory storage
    this.fallbackStorage.set(key, value);
  }

  /**
   * Safely remove item from storage
   */
  removeItem(key: string): void {
    // Do nothing for server-side rendering
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    try {
      // Try to use sessionStorage
      if (typeof sessionStorage !== 'undefined' && sessionStorage !== null) {
        sessionStorage.removeItem(key);
        return;
      }
    } catch (e) {
      // Silently use fallback - no need to warn on every removal
    }
    
    // Fallback to in-memory storage
    this.fallbackStorage.delete(key);
  }

  /**
   * Safely clear all items from storage
   */
  clear(): void {
    // Do nothing for server-side rendering
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    try {
      // Try to use sessionStorage
      if (typeof sessionStorage !== 'undefined' && sessionStorage !== null) {
        sessionStorage.clear();
        return;
      }
    } catch (e) {
      console.warn('sessionStorage not available for clear, using fallback:', e);
    }
    
    // Fallback to in-memory storage
    this.fallbackStorage.clear();
  }
}