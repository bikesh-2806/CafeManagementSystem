import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info';
}

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  resolve: (confirmed: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class UiService {
  private nextId = 1;
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  private confirmSubject = new Subject<ConfirmRequest>();

  toasts$ = this.toastsSubject.asObservable();
  confirm$ = this.confirmSubject.asObservable();

  toast(text: string, type: ToastMessage['type'] = 'success') {
    const toast = { id: this.nextId++, text, type };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    window.setTimeout(() => this.dismiss(toast.id), 3500);
  }

  dismiss(id: number) {
    this.toastsSubject.next(this.toastsSubject.value.filter(item => item.id !== id));
  }

  confirm(message: string, title = 'Please confirm', confirmText = 'Confirm', cancelText = 'Cancel') {
    return new Promise<boolean>(resolve => {
      this.confirmSubject.next({ title, message, confirmText, cancelText, resolve });
    });
  }
}
