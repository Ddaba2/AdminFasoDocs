import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogData } from '../../services/dialog.service';

/**
 * Composant de boîte de dialogue de confirmation personnalisée
 *
 * Ce composant affiche une boîte de dialogue modale pour confirmer les actions de suppression
 * avec des icônes personnalisées pour les actions de suppression et de modification
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ data.title }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ data.message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" (click)="onCancel()">Annuler</button>
          <button class="btn-confirm" (click)="onConfirm()" [ngClass]="data.type">
            <span *ngIf="data.type === 'delete'">🗑️</span>
            <span *ngIf="data.type === 'edit'">✏️</span>
            {{ data.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 400px;
      max-width: 90%;
      padding: 0;
    }

    .modal-header {
      padding: 20px 20px 10px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
    }

    .modal-body {
      padding: 20px;
    }

    .modal-body p {
      margin: 0;
      color: #666;
      font-size: 16px;
      line-height: 1.5;
    }

    .modal-footer {
      padding: 15px 20px 20px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      border-top: 1px solid #eee;
    }

    .btn-cancel {
      padding: 8px 16px;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      color: #333;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-cancel:hover {
      background-color: #e0e0e0;
    }

    .btn-confirm {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      color: white;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .btn-confirm.delete {
      background-color: #dc3545;
      border-color: #dc3545;
    }

    .btn-confirm.delete:hover {
      background-color: #c82333;
      border-color: #bd2130;
    }

    .btn-confirm.edit {
      background-color: #007bff;
      border-color: #007bff;
    }

    .btn-confirm.edit:hover {
      background-color: #0069d9;
      border-color: #0062cc;
    }

    .btn-confirm.info {
      background-color: #28a745;
      border-color: #28a745;
    }

    .btn-confirm.info:hover {
      background-color: #218838;
      border-color: #1e7e34;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() data!: DialogData;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}