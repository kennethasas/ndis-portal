import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingTableComponent } from '../../../../shared/components/table/booking-table.component';
import { StatusDropdownComponent } from '../../../../shared/components/dropdown/status/status-dropdown.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BookingService } from '../../../core/services/booking.service';
import { Booking, BookingViewModel } from '../../../core/models/booking.model';

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
  bookings: BookingViewModel[] = [];
  totalItems = 0;
  totalPages = 1;
  currentPage = 1;
  pageSize = 10;
  activeFilter = 'all';
  isLoading = false;
  errorMessage = '';

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.fetchBookings();
  }

  fetchBookings() {
    this.isLoading = true;
    this.errorMessage = '';

    const statusFilter = this.activeFilter === 'all' ? undefined : this.activeFilter;

    this.bookingService.getBookings(statusFilter).subscribe({
      next: (bookings: Booking[]) => {
        this.isLoading = false;
        
        this.bookings = bookings.map(booking => this.mapToViewModel(booking));
        this.totalItems = bookings.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
        this.bookings = [];
        this.totalItems = 0;
        this.totalPages = 1;
      }
    });
  }

  private mapToViewModel(booking: Booking): BookingViewModel {
    const dateObj = new Date(booking.preferredDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const category = this.deriveCategory(booking.serviceName);

    return {
      id: booking.id,
      service: booking.serviceName,
      category: category,
      date: formattedDate,
      status: booking.status,
      notes: booking.notes,
      rawData: booking
    };
  }

  private deriveCategory(serviceName: string): string {
    const name = serviceName.toLowerCase();
    if (name.includes('hygiene') || name.includes('personal') || name.includes('grooming')) {
      return 'Daily Personal Activities';
    }
    if (name.includes('transport') || name.includes('travel') || name.includes('drive')) {
      return 'Transportation';
    }
    if (name.includes('meal') || name.includes('food') || name.includes('cook')) {
      return 'Meal Preparation';
    }
    if (name.includes('social') || name.includes('community') || name.includes('recreation')) {
      return 'Social Participation';
    }
    if (name.includes('home') || name.includes('house') || name.includes('cleaning')) {
      return 'Home Maintenance';
    }
    return 'Support Services';
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

  handleCancel(booking: BookingViewModel) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.deleteBooking(booking.id).subscribe({
        next: () => {
          this.fetchBookings();
        },
        error: (error: Error) => {
          alert(error.message);
        }
      });
    }
  }

  handleView(booking: BookingViewModel) {
    console.log('Viewing booking details:', booking.rawData);
  }
}
