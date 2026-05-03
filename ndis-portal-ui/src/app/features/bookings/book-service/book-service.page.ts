import { FormsModule } from '@angular/forms';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subscription } from 'rxjs';
import { timeout, map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

import { ServiceSelectComponent } from '../../../../shared/components/select/select-service/select-service.component';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { TextAreaComponent } from '../../../../shared/components/text-area/text-area.component';
import { BookingService } from '../../../core/services/booking.service';
import { ApiService } from '../../../core/services/api-service';
import { ToastService } from '../../../core/services/toast.service';

import { BookButton } from '../../../../shared/components/button/book-button/book-button.component';
import { BackButton } from '../../../../shared/components/button/back-button/back-button.component';
@Component({
  selector: 'app-booking-service-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ServiceSelectComponent,
    DatePickerComponent,
    TextAreaComponent,
    BookButton, // Added for the confirm action
    BackButton, // Added for navigation
  ],
  templateUrl: './book-service.page.html',
  // You can likely remove the .css file now that we are using Tailwind
})
export class BookServiceComponent implements OnInit, OnDestroy {
  bookingData = {
    serviceId: '',
    date: '',
    notes: '',
  };

  // Loaded from API
  services: { id: number; label: string }[] = [];

  // Menu state
  activeMenuId: number | null = null;

  // Duplicate submission prevention
  lastSubmissionTime = 0;
  readonly SUBMISSION_COOLDOWN = 2000; // 2 seconds

  isLoading = false;
  isLoadingServices = false;
  errorMessage = '';
  isSubmitting = false; // Prevent duplicate submissions

  private queryParamsSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private apiService: ApiService,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadServices();
    // Subscribe to query params to handle navigation while already on this page
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const preselectedService = params['serviceId'];
      if (preselectedService) {
        this.bookingData.serviceId = preselectedService;
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
            category: s.categoryName || 'support', // Include category for consistency
          }));
        }
      },
      error: (error: Error) => {
        this.isLoadingServices = false;
        this.errorMessage = 'Failed to load services: ' + error.message;
      },
    });
  }

  navBack() {
    window.history.back();
  }

  validateForm(): boolean {
    if (!this.bookingData.serviceId) {
      this.errorMessage = 'Please select a service';
      return false;
    }
    if (!this.bookingData.date) {
      this.errorMessage = 'Please select a preferred date';
      return false;
    }
    const selectedDate = new Date(this.bookingData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      this.errorMessage = 'Preferred date cannot be in the past';
      return false;
    }
    return true;
  }

  confirmBooking() {
    console.log('confirmBooking called, isSubmitting:', this.isSubmitting);
    
    // Prevent duplicate submissions with multiple checks
    const currentTime = Date.now();
    if (this.isSubmitting || (currentTime - this.lastSubmissionTime) < this.SUBMISSION_COOLDOWN) {
      return;
    }
    this.lastSubmissionTime = currentTime;

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.isLoading = true;
    this.errorMessage = '';

    // Convert to proper types for API
    const serviceId = parseInt(this.bookingData.serviceId as string, 10);
    const preferredDate = new Date(this.bookingData.date).toISOString();

    const bookingPayload = {
      serviceId: serviceId,
      preferredDate: preferredDate,
      notes: this.bookingData.notes || undefined,
    };

    console.log('Attempting to create booking with payload:', bookingPayload);

    // First check if we can reach the backend
    this.checkBackendConnection().subscribe({
      next: (isConnected) => {
        if (!isConnected) {
          console.log('Backend connection check failed');
          this.isSubmitting = false;
          this.isLoading = false;
          this.errorMessage = 'Cannot connect to server. Please check your internet connection and try again.';
          return;
        }
        
        console.log('Backend connection successful, proceeding with booking');
        this.proceedWithBooking(bookingPayload);
      },
      error: (error) => {
        console.log('Backend connection check error:', error);
        this.isSubmitting = false;
        this.isLoading = false;
        this.errorMessage = 'Cannot connect to server. Please check your internet connection and try again.';
      }
    });
  }

  checkBackendConnection(): Observable<boolean> {
    // Make a simple GET request to check if backend is reachable
    return this.http.get(`${environment.apiUrl}/bookings`, { 
      headers: { 'X-Connection-Check': 'true' }
    }).pipe(
      timeout(5000), // 5 second timeout for connection check
      map(() => true),
      catchError((error) => {
        console.log('Connection check failed:', error);
        return of(false);
      })
    );
  }

  proceedWithBooking(bookingPayload: any) {
    this.bookingService.createBooking(bookingPayload).subscribe({
      next: (response) => {
        console.log('Booking response received:', response);
        
        // Additional validation to ensure we actually got a valid response
        if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
          console.log('Invalid response detected, treating as error');
          this.isSubmitting = false;
          this.isLoading = false;
          this.errorMessage = 'Invalid response from server. Booking may not have been created.';
          return;
        }
        
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
        console.log('Booking error caught:', error);
        
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
}
