import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';

import { timeout, map, catchError } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

import { BookingTableComponent } from '../../../../shared/components/table/booking-table.component';

import { StatusDropdownComponent } from '../../../../shared/components/dropdown/status/status-dropdown.component';

import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

import { BookingService } from '../../../core/services/booking.service';

import { Booking, BookingViewModel } from '../../../core/models/booking.model';

import { Router, ActivatedRoute } from '@angular/router';

// Import the generic Smart Dialog Component

import { CancelDialogComponent } from '../../../../shared/components/dialog/cancel-dialog.component';



@Component({

  selector: 'app-my-bookings',

  standalone: true,

  imports: [

    CommonModule,

    BookingTableComponent,

    StatusDropdownComponent,

    PaginationComponent,

    CancelDialogComponent, // Integrated for responsive cancellation

  ],

  templateUrl: './my-bookings.page.html',

})

export class MyBookingsComponent implements OnInit {

  // --- Data State ---

  bookings: BookingViewModel[] = [];

  totalItems = 0;

  totalPages = 1;

  currentPage = 1;

  pageSize = 10;

  activeFilter = 'all';

  isLoading = false;

  errorMessage = '';

  successMessage = '';



  // --- Dialog State ---

  isCancelDialogOpen = false;

  selectedBookingForCancel: BookingViewModel | null = null;



  constructor(

    private bookingService: BookingService, 

    private router: Router, 

    private route: ActivatedRoute,

    private http: HttpClient

  ) {}



  ngOnInit() {

    console.log('MyBookingsComponent ngOnInit() called');

    

    // Test available endpoints first

    this.testAvailableEndpoints();

    

    // Check for success message from query parameter

    this.route.queryParams.subscribe(params => {

      if (params['success'] === 'true') {

        this.successMessage = 'Booking created successfully!';

        // Clear the success message after 5 seconds

        setTimeout(() => {

          this.successMessage = '';

        }, 5000);

        // Clear the query parameter to prevent showing message on refresh

        this.router.navigate([], { 

          relativeTo: this.route,

          queryParams: {},

          replaceUrl: true 

        });

      }

    });

    

    this.fetchBookings();

  }



  /**

   * Fetches bookings based on the active status filter

   */

  fetchBookings() {

    console.log('fetchBookings() called - loading bookings...');

    this.isLoading = true;

    this.errorMessage = '';



    const statusFilter =

      this.activeFilter === 'all' ? undefined : this.activeFilter;



    console.log('Calling bookingService.getBookings with filter:', statusFilter);

    

    // First test if the backend is reachable

    this.testBackendConnection().subscribe({

      next: (isReachable) => {

        if (!isReachable) {

          console.log('Backend not reachable, showing empty bookings');

          this.isLoading = false;

          this.bookings = [];

          this.totalItems = 0;

          this.totalPages = 1;

          return;

        }

        

        // Backend is reachable, try to get bookings

        this.bookingService.getBookings(statusFilter).subscribe({

          next: (bookings: Booking[]) => {

            this.isLoading = false;

            

            console.log('[MyBookings] Received bookings:', bookings.length);

            

            // If no bookings, check if it's due to backend issue

            if (bookings.length === 0) {

              console.log('[MyBookings] No bookings found - could be backend issue or no actual bookings');

              // Don't show error message for empty bookings - it could be legitimate

              this.bookings = [];

              this.totalItems = 0;

              this.totalPages = 1;

              return;

            }

            

            // Transform raw data to ViewModel for the table

            this.bookings = bookings.map((booking) => this.mapToViewModel(booking));

            

            // Sort bookings by created date in descending order (newest booking first)

            this.bookings.sort((a, b) => {

              const dateA = new Date(a.rawData.createdDate);

              const dateB = new Date(b.rawData.createdDate);

              

              // Debug logging to check dates

              console.log('Sorting comparison:');

              console.log('Booking A:', a.rawData.id, 'createdDate:', a.rawData.createdDate, 'parsed:', dateA, 'timestamp:', dateA.getTime());

              console.log('Booking B:', b.rawData.id, 'createdDate:', b.rawData.createdDate, 'parsed:', dateB, 'timestamp:', dateB.getTime());

              

              // If dates are equal, sort by ID (higher ID = newer booking)

              if (dateA.getTime() === dateB.getTime()) {

                console.log('Dates are equal, sorting by ID');

                console.log('ID comparison result:', b.rawData.id - a.rawData.id);

                return b.rawData.id - a.rawData.id;

              }

              

              const result = dateB.getTime() - dateA.getTime();

              console.log('Date comparison result:', result);

              return result;

            });

            

            // Debug: log final sorted order

            console.log('Final sorted order:');

            this.bookings.forEach((booking, index) => {

              console.log(`${index + 1}. ID: ${booking.rawData.id}, Preferred Date: ${booking.rawData.preferredDate}`);

            });

            

            this.totalItems = bookings.length;

            this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;

          },

          error: (error: Error) => {

            this.isLoading = false;

            this.errorMessage = error.message;

            this.bookings = [];

            this.totalItems = 0;

            this.totalPages = 1;

          },

        });

      },

      error: (error: any) => {

        console.log('Backend connection test failed:', error);

        this.isLoading = false;

        this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';

        this.bookings = [];

        this.totalItems = 0;

        this.totalPages = 1;

      }

    });

  }



  testAvailableEndpoints() {

    console.log('Testing available endpoints...');

    

    // Test common endpoint patterns

    const endpoints = [

      `${environment.apiUrl}/bookings`,

      `${environment.apiUrl}/booking`,

      `${environment.apiUrl}/api/bookings`,

      `${environment.apiUrl}/api/booking`,

      `${environment.apiUrl}`,

    ];

    

    endpoints.forEach(endpoint => {

      console.log(`Testing endpoint: ${endpoint}`);

      this.http.get(endpoint, { 

        headers: { 'X-Test-Endpoint': 'true' },

        responseType: 'text'

      }).pipe(

        timeout(3000),

        catchError((error) => {

          console.log(`❌ ${endpoint} - Error:`, error.status || error.message);

          return of(null);

        })

      ).subscribe(response => {

        if (response) {

          console.log(`✅ ${endpoint} - Response:`, response);

        }

      });

    });

  }



  testBackendConnection(): Observable<boolean> {

    return this.http.get(`${environment.apiUrl}/bookings`, { 

      headers: { 'X-Connection-Check': 'true' },

      responseType: 'text'

    }).pipe(

      timeout(5000),

      map(() => true),

      catchError((error) => {

        console.log('Backend connection check failed:', error);

        return of(false);

      })

    );

  }



  mapToViewModel(booking: Booking): BookingViewModel {

    return {

      id: booking.id,

      name: booking.participantName,

      service: booking.serviceName,

      category: this.getServiceCategory(booking),

      date: this.formatBookingDate(booking.preferredDate),

      status: booking.status,

      notes: booking.notes,

      rawData: booking,

    };

  }



  private getServiceCategory(
    booking: Booking & {
      ServiceCategory?: string;
      categoryName?: string;
      CategoryName?: string;
    }
  ): string {
    const category =
      booking.serviceCategory ??
      booking.ServiceCategory ??
      booking.categoryName ??
      booking.CategoryName;

    return category?.trim() || 'Uncategorized';
  }



  private formatBookingDate(dateValue: string): string {

    const match = dateValue?.match(/^(\d{4})-(\d{2})-(\d{2})/);

    const date = match

      ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))

      : new Date(dateValue);

    if (Number.isNaN(date.getTime())) {

      return dateValue || '';

    }

    return date.toLocaleDateString('en-US', {

      year: 'numeric',

      month: 'short',

      day: 'numeric',

    });

  }



  // --- Event Handlers ---



  /**

   * Triggered by the table action. Opens our custom responsive dialog.

   */

  handleCancel(booking: BookingViewModel) {

    this.selectedBookingForCancel = booking;

    this.isCancelDialogOpen = true;

  }



  /**

   * Resets the dialog state and closes it

   */

  closeCancelDialog() {

    this.isCancelDialogOpen = false;

    // Delay nulling to prevent content flashing during close animation

    setTimeout(() => {

      this.selectedBookingForCancel = null;

    }, 200);

  }



  /**

   * Performs the API call to delete the booking after user confirms in the Dialog

   */

  confirmCancellation() {

    if (!this.selectedBookingForCancel) return;



    const idToDelete = this.selectedBookingForCancel.id;



    // Close UI immediately for snappy feel

    this.isCancelDialogOpen = false;

    this.isLoading = true;



    this.bookingService.deleteBooking(idToDelete).subscribe({

      next: () => {

        this.selectedBookingForCancel = null;

        this.fetchBookings(); // Refresh the data list

      },

      error: (error: Error) => {

        this.isLoading = false;

        this.errorMessage = error.message;

      },

    });

  }



  handleStatusFilter(status: string) {

    this.activeFilter = status;

    this.currentPage = 1;

    this.fetchBookings();

  }



  handlePageChange(page: number) {

    this.currentPage = page;

    this.fetchBookings();

  }



  handleView(booking: BookingViewModel) {

    console.log('Viewing booking details:', booking.rawData);

  }



  // --- Mapping & Data Logic ---



  /**

   * Maps service names to display categories for the Table Badge

   */

  private deriveCategory(serviceName: string): string {

    const name = serviceName.toLowerCase();

    if (name.includes('hygiene') || name.includes('personal'))

      return 'Daily Personal Activities';

    if (name.includes('community') || name.includes('social') || name.includes('transport') || name.includes('drive'))

      return 'Community Access';

    if (name.includes('therapy') || name.includes('occupational') || name.includes('speech'))

      return 'Therapy Supports';

    if (name.includes('respite'))

      return 'Respite Care';

    return 'Support Coordination';

  }

}

