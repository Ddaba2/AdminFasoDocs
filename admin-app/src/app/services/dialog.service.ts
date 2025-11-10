import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface DialogData {
  title: string;
  message: string;
  confirmText: string;
  type: 'delete' | 'edit' | 'info';
}

export interface DialogResult {
  confirmed: boolean;
}

/**
 * Service de gestion des boîtes de dialogue personnalisées
 *
 * Ce service permet d'afficher des boîtes de dialogue modales personnalisées
 * pour confirmer les actions de suppression ou d'édition avec des icônes
 */
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogRequestSubject = new Subject<{ data: DialogData; resolver: (result: DialogResult) => void }>();
  dialogRequest$ = this.dialogRequestSubject.asObservable();

  /**
   * Affiche une boîte de dialogue de confirmation personnalisée
   * @param data Données de la boîte de dialogue
   * @returns Observable avec le résultat de la confirmation
   */
  confirm(data: DialogData): Observable<DialogResult> {
    return new Observable(observer => {
      const resolver = (result: DialogResult) => {
        observer.next(result);
        observer.complete();
      };
      
      this.dialogRequestSubject.next({ data, resolver });
    });
  }
}