// FILE: toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastState = new BehaviorSubject<{
    message: string;
    type: string;
    show: boolean;
  }>({
    message: '',
    type: 'success',
    show: false,
  });

  toastState$ = this.toastState.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastState.next({ message, type, show: true });

    // Auto-dismissal logic
    setTimeout(() => {
      this.dismiss();
    }, 3000);
  }

  dismiss() {
    this.toastState.next({ ...this.toastState.value, show: false });
  }
}
