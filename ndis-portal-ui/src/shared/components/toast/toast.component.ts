import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // CRITICAL IMPORT
import { ToastService } from '../../../app/core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true, // Make it standalone
  imports: [CommonModule], // Add CommonModule here
  template: `
    <!-- Centering Wrapper -->
    <div
      *ngIf="(toast$ | async)?.show"
      class="fixed top-4 sm:top-6 inset-x-0 z-[400] flex justify-center px-3 sm:px-4 lg:px-6 pointer-events-none"
    >
      <!-- Toast -->
      <div
        class="pointer-events-auto flex items-start gap-3 sm:gap-4 bg-white border border-slate-200 px-4 py-4 sm:px-6 sm:py-5 rounded-xl animate-in w-full sm:w-auto min-w-0 sm:min-w-[420px] lg:min-w-[460px] 2xl:min-w-[520px] max-w-[95vw] sm:max-w-[90vw] lg:max-w-[720px] 2xl:max-w-[900px]"
      >
        <!-- Icon -->
        <div
          class="mt-0.5 flex-shrink-0"
          [ngClass]="{
            'text-emerald-500': (toast$ | async)?.type === 'success',
            'text-rose-500': (toast$ | async)?.type === 'error',
            'text-blue-500': (toast$ | async)?.type === 'info',
          }"
        >
          <svg
            class="w-5 h-5 sm:w-[22px] sm:h-[22px] 2xl:w-7 2xl:h-7"
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
        <div class="flex flex-col flex-1 min-w-0">
          <p
            class="text-sm sm:text-base 2xl:text-lg font-semibold text-slate-900 leading-tight break-words"
          >
            {{ (toast$ | async)?.message }}
          </p>
          <p class="text-[11px] sm:text-xs 2xl:text-sm text-slate-400 capitalize mt-1">
            {{ (toast$ | async)?.type }}
          </p>
        </div>

        <!-- Close -->
        <button
          (click)="dismiss()"
          class="flex-shrink-0 p-1.5 sm:p-2 2xl:p-3 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <svg
            class="w-4 h-4 2xl:w-5 2xl:h-5"
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