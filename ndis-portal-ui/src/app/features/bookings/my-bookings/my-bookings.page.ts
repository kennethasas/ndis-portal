import { Component } from '@angular/core';
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
  styleUrl: './my-bookings.page.css',
})
export class MyBookingsComponent {
  activeFilter = 'all';
  // Original source from your context
  allBookings = [
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

  filteredBookings = [...this.allBookings];

  handleStatusFilter(status: string) {
    this.activeFilter = status;
    if (status === 'all') {
      this.filteredBookings = [...this.allBookings];
    } else {
      this.filteredBookings = this.allBookings.filter(
        (b) => b.status.toLowerCase() === status.toLowerCase(),
      );
    }
  }

  handleCancel(booking: any) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      booking.status = 'Cancelled';
      this.handleStatusFilter('all'); // Refresh view
    }
  }
  handleView(booking: any) {
    console.log('Viewing booking:', booking);
  }

  currentPage = 1;

  handlePageChange(page: number) {
    this.currentPage = page;
    // Call your API here to fetch data for the new page
  }
}
