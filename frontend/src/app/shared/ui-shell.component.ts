import { Component } from '@angular/core';
import { ConfirmRequest, UiService } from './ui.service';

@Component({
  selector: 'app-ui-shell',
  template: `
    <div class="toast-stack">
      <div *ngFor="let toast of ui.toasts$ | async" class="app-toast" [class.toast-success]="toast.type === 'success'" [class.toast-error]="toast.type === 'error'" [class.toast-info]="toast.type === 'info'">
        <span>{{ toast.text }}</span>
        <button type="button" (click)="ui.dismiss(toast.id)" aria-label="Close">x</button>
      </div>
    </div>

    <div class="modal-backdrop-custom" *ngIf="confirmRequest">
      <div class="confirm-dialog">
        <h2>{{ confirmRequest.title }}</h2>
        <p>{{ confirmRequest.message }}</p>
        <div class="actions">
          <button type="button" class="btn btn-outline-secondary" (click)="answer(false)">{{ confirmRequest.cancelText }}</button>
          <button type="button" class="btn btn-primary" (click)="answer(true)">{{ confirmRequest.confirmText }}</button>
        </div>
      </div>
    </div>
  `
})
export class UiShellComponent {
  confirmRequest: ConfirmRequest | null = null;

  constructor(public ui: UiService) {
    this.ui.confirm$.subscribe(request => this.confirmRequest = request);
  }

  answer(confirmed: boolean) {
    this.confirmRequest?.resolve(confirmed);
    this.confirmRequest = null;
  }
}
