import { FormsModule } from '@angular/forms';

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ServiceSelectComponent } from '../../../../shared/components/select/select-service/select-service.component';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { TextAreaComponent } from '../../../../shared/components/text-area/text-area.component';
import { BookingService } from '../../../core/services/booking.service';
import { ApiService } from '../../../core/services/api-service';

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
export class BookServiceComponent implements OnInit {
  bookingData = {
    serviceId: '',
    date: '',
    notes: '',
  };

  // Loaded from API
  services: { id: number; label: string }[] = [];

  isLoading = false;
  isLoadingServices = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadServices();

    const preselectedService =
      this.route.snapshot.queryParamMap.get('serviceId');
    if (preselectedService) {
      this.bookingData.serviceId = preselectedService;
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

  confirmBooking() {
    // Validate form
    if (!this.bookingData.serviceId || !this.bookingData.date) {
      this.errorMessage = 'Please select a service and date';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Convert to proper types for API
    const serviceId = parseInt(this.bookingData.serviceId as string, 10);
    const preferredDate = new Date(this.bookingData.date).toISOString();
    
    console.log('Booking payload:', {
      serviceId,
      preferredDate,
      notes: this.bookingData.notes || undefined,
    });

    const bookingPayload = {
      serviceId: serviceId,
      preferredDate: preferredDate,
      notes: this.bookingData.notes || undefined,
    };

    this.bookingService.createBooking(bookingPayload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Booking created successfully!';
        
        // Navigate to bookings page after short delay
        setTimeout(() => {
          this.router.navigate(['/bookings']);
        }, 1500);
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
      },
    });
  }
}
