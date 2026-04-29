import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllBookingTable } from '../../../../shared/components/table/all-bookings/all-booking-table.component';
import { StatusDropdownComponent } from '../../../../shared/components/dropdown/status/status-dropdown.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BookingService } from '../../../core/services/booking.service';
import { Booking, BookingViewModel } from '../../../core/models/booking.model';
// Import the generic Smart Dialog Component
import { CancelDialogComponent } from '../../../../shared/components/dialog/cancel-dialog.component';

@Component({
  selector: 'app-all-bookings',
  standalone: true,
  imports: [
    CommonModule,
    AllBookingTable,
    StatusDropdownComponent,
    PaginationComponent,
    CancelDialogComponent, // Integrated for responsive cancellation
  ],
  templateUrl: './all-bookings.page.html',
})
export class AllBookingsComponent implements OnInit {
  // --- Data State ---
  bookings: BookingViewModel[] = [];
  totalItems = 0;
  totalPages = 1;
  currentPage = 1;
  pageSize = 10;
  activeFilter = 'all';
  isLoading = false;
  errorMessage = '';

  // --- Dialog State ---
  isCancelDialogOpen = false;
  selectedBookingForCancel: BookingViewModel | null = null;

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.fetchBookings();
  }

  /**
   * Fetches bookings based on the active status filter
   */
  fetchBookings() {
    this.isLoading = true;
    this.errorMessage = '';

    const statusFilter =
      this.activeFilter === 'all' ? undefined : this.activeFilter;

    this.bookingService.getBookings(statusFilter).subscribe({
      next: (bookings: Booking[]) => {
        this.isLoading = false;
        // Transform raw data to ViewModel for the table
        this.bookings = bookings.map((booking) => this.mapToViewModel(booking));
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
   * Approves a pending booking (Coordinator only)
   */
  handleApprove(booking: BookingViewModel) {
    this.isLoading = true;
    this.errorMessage = '';

    this.bookingService.updateBookingStatus(booking.id, 'Approved').subscribe({
      next: () => {
        this.isLoading = false;
        this.fetchBookings(); // Refresh the data list
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
      },
    });
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

  private mapToViewModel(booking: Booking): BookingViewModel {
    const dateObj = new Date(booking.preferredDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return {
      id: booking.id,
      name: booking.participantName,
      service: booking.serviceName,
      category: this.deriveCategory(booking.serviceName),
      date: formattedDate,
      status: booking.status,
      notes: booking.notes,
      rawData: booking,
    };
  }

  /**
   * Maps service names to display categories for the Table Badge
   */
  private deriveCategory(serviceName: string): string {
    const name = serviceName.toLowerCase();
    if (name.includes('hygiene') || name.includes('personal'))
      return 'Daily Personal Activities';
    if (name.includes('transport') || name.includes('drive'))
      return 'Transportation';
    if (name.includes('meal') || name.includes('cook'))
      return 'Meal Preparation';
    if (name.includes('social') || name.includes('community'))
      return 'Social Participation';
    if (name.includes('home') || name.includes('cleaning'))
      return 'Home Maintenance';
    return 'Support Services';
  }
}
