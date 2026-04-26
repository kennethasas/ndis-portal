import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingTableComponent } from '../../../../shared/components/table/booking-table.component';
import { StatusDropdownComponent } from '../../../../shared/components/dropdown/status/status-dropdown.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    CommonModule,
    BookingTableComponent,
    StatusDropdownComponent,
    PaginationComponent,
  ],
  templateUrl: './my-bookings.page.html',
})
export class MyBookingsComponent implements OnInit {
  // Logic State
  bookings: any[] = [];
  totalItems = 0;
  totalPages = 1;
  currentPage = 1;
  pageSize = 10;
  activeFilter = 'all';
  isLoading = false;

  ngOnInit() {
    this.fetchBookings();
  }

  /**
   * This is where you would call your Angular Service
   * Example: this.bookingService.getBookings(page, size, filter)
   */
  fetchBookings() {
    this.isLoading = true;

    // Simulate Backend API Call
    console.log(
      `Fetching: Page ${this.currentPage}, Size ${this.pageSize}, Filter ${this.activeFilter}`,
    );

    // MOCK BACKEND RESPONSE
    // In production, replace this setTimeout with: this.http.get(...).subscribe(...)
    setTimeout(() => {
      this.bookings = [
        {
          service: 'Personal Hygiene',
          category: 'Daily Personal Activities',
          date: 'Apr 21, 2026',
          status: 'Approved',
        },
        {
          service: 'Personal Hygiene',
          category: 'Daily Personal Activities',
          date: 'Apr 21, 2026',
          status: 'Pending',
        },
        {
          service: 'Personal Hygiene',
          category: 'Daily Personal Activities',
          date: 'Apr 21, 2026',
          status: 'Cancelled',
        },
      ];

      // Backend should return total count so we can calculate pages
      this.totalItems = 50;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      this.isLoading = false;
    }, 500);
  }

  handleStatusFilter(status: string) {
    this.activeFilter = status;
    this.currentPage = 1; // Always reset to page 1 on new filter
    this.fetchBookings();
  }

  handlePageChange(page: number) {
    this.currentPage = page;
    this.fetchBookings();
  }

  handleCancel(booking: any) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      // Typically: this.bookingService.cancel(booking.id).subscribe(() => this.fetchBookings())
      booking.status = 'Cancelled';
      console.log('Cancelled:', booking);
    }
  }

  handleView(booking: any) {
    console.log('Viewing details for:', booking);
  }
}
