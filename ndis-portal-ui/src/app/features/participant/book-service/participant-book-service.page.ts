import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ServiceSelectComponent } from '../../../../shared/components/select/select-service/select-service.component';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { TextAreaComponent } from '../../../../shared/components/text-area/text-area.component';
import { BookButton } from '../../../../shared/components/button/book-button/book-button.component';
import { BackButton } from '../../../../shared/components/button/back-button/back-button.component';
import { BookingService } from '../../../core/services/booking.service';
import { ApiService } from '../../../core/services/api-service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-participant-book-service',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ServiceSelectComponent,
    DatePickerComponent,
    TextAreaComponent,
    BookButton,
    BackButton,
  ],
  templateUrl: './participant-book-service.page.html',
})
export class ParticipantBookServiceComponent implements OnInit, OnDestroy {
  bookingForm = {
    serviceId: '',
    preferredDate: '',
    notes: '',
  };

  // Form state
  services: { id: number; label: string; category?: string }[] = [];
  isLoading = false;
  isLoadingServices = false;
  isSubmitting = false;
  errorMessage = '';

  // Validation errors
  validationErrors = {
    serviceId: '',
    preferredDate: '',
  };

  private queryParamsSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadServices();
    // Subscribe to query params to handle navigation while already on this page
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const preselectedService = params['serviceId'];
      if (preselectedService) {
        this.bookingForm.serviceId = preselectedService;
      }
    });
  }

  ngOnDestroy() {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  loadServices() {
    this.isLoadingServices = true;
    this.apiService.getServices().subscribe({
      next: (response: any) => {
        this.isLoadingServices = false;
        const data = response.Data || response;
        if (Array.isArray(data)) {
          this.services = data.map((s: any) => ({
            id: s.id,
            label: s.name || s.title || s.label,
            category: s.categoryName || 'support',
          }));
        }
      },
      error: (error: Error) => {
        this.isLoadingServices = false;
        this.errorMessage = 'Failed to load services: ' + error.message;
      },
    });
  }

  validateForm(): boolean {
    let isValid = true;
    this.validationErrors = {
      serviceId: '',
      preferredDate: '',
    };

    // Validate service selection
    if (!this.bookingForm.serviceId) {
      this.validationErrors.serviceId = 'Service is required';
      isValid = false;
    }

    // Validate preferred date
    if (!this.bookingForm.preferredDate) {
      this.validationErrors.preferredDate = 'Preferred date is required';
      isValid = false;
    } else {
      const selectedDate = new Date(this.bookingForm.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for comparison
      
      if (selectedDate < today) {
        this.validationErrors.preferredDate = 'Preferred date cannot be in the past';
        isValid = false;
      }
    }

    return isValid;
  }

  submitBooking() {
    // Prevent duplicate submissions
    if (this.isSubmitting) {
      return;
    }

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.isLoading = true;
    this.errorMessage = '';

    // Convert to proper types for API
    const serviceId = parseInt(this.bookingForm.serviceId as string, 10);
    const preferredDate = new Date(this.bookingForm.preferredDate).toISOString();

    const bookingPayload = {
      serviceId: serviceId,
      preferredDate: preferredDate,
      notes: this.bookingForm.notes || undefined,
    };

    this.bookingService.createBooking(bookingPayload).subscribe({
      next: () => {
        // Keep loading state active until navigation completes
        setTimeout(() => {
          this.router.navigate(['/bookings']).then(() => {
            // Reset states only after navigation is complete
            this.isSubmitting = false;
            this.isLoading = false;
            this.toast.show('Booking created successfully!', 'success');
          });
        }, 1500);
      },
      error: (error: Error) => {
        // Reset loading states immediately on error
        this.isSubmitting = false;
        this.isLoading = false;
        
        // Display the error message from the service
        this.errorMessage = error.message;
        
        // Log the error for debugging
        console.error('Booking failed:', error);
      },
    });
  }

  navBack() {
    window.history.back();
  }

  // Helper method to check if field has error
  hasError(field: keyof typeof this.validationErrors): boolean {
    return !!this.validationErrors[field];
  }

  // Helper method to get error message
  getError(field: keyof typeof this.validationErrors): string {
    return this.validationErrors[field];
  }
}
