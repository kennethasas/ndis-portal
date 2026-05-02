import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // CRITICAL IMPORT
import { ToastService } from '../../../app/core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true, // Make it standalone
  imports: [CommonModule], // Add CommonModule here
  template: `
    <!-- Centering Wrapper -->
    <!-- Centering Wrapper -->
    <div
      *ngIf="(toast$ | async)?.show"
      class="fixed top-6 inset-x-0 z-[400] flex justify-center pointer-events-none"
    >
      <!-- Toast -->
      <div
        class="pointer-events-auto flex items-start gap-4 bg-white border border-slate-200 px-6 py-5 rounded-xl animate-in min-w-[420px] max-w-[95vw]"
      >
        <!-- Icon -->
        <div
          class="mt-0.5"
          [ngClass]="{
            'text-emerald-500': (toast$ | async)?.type === 'success',
            'text-rose-500': (toast$ | async)?.type === 'error',
            'text-blue-500': (toast$ | async)?.type === 'info',
          }"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline
              *ngIf="(toast$ | async)?.type === 'success'"
              points="20 6 9 17 4 12"
            ></polyline>

            <circle
              *ngIf="(toast$ | async)?.type !== 'success'"
              cx="12"
              cy="12"
              r="10"
            ></circle>

            <line
              *ngIf="(toast$ | async)?.type === 'info'"
              x1="12"
              y1="16"
              x2="12"
              y2="12"
            ></line>

            <line
              *ngIf="(toast$ | async)?.type === 'info'"
              x1="12"
              y1="8"
              x2="12.01"
              y2="8"
            ></line>
          </svg>
        </div>

        <!-- Content -->
        <div class="flex flex-col flex-1">
          <p class="text-base font-semibold text-slate-900 leading-tight">
            {{ (toast$ | async)?.message }}
          </p>
          <p class="text-xs text-slate-400 capitalize mt-1">
            {{ (toast$ | async)?.type }}
          </p>
        </div>

        <!-- Close -->
        <button
          (click)="dismiss()"
          class="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            viewBox="0 0 24 24"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes drop-in {
        from {
          transform: translateY(-2rem);
          opacity: 0;
          filter: blur(4px);
        }
        to {
          transform: translateY(0);
          opacity: 1;
          filter: blur(0);
        }
      }
      .animate-in {
        animation: drop-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
    `,
  ],
})
export class ToastComponent {
  private toastService = inject(ToastService); // Clean, safe, reusable
  toast$ = this.toastService.toastState$;

  dismiss() {
    this.toastService.dismiss();
  }
}