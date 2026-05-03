import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api-service';
import { StatusDropdownComponent } from '../../../../shared/components/dropdown/status/status-dropdown.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-all-bookings',
  standalone: true,
  imports: [CommonModule, StatusDropdownComponent],
  templateUrl: './all-bookings.page.html',
})
export class AllBookingsComponent implements OnInit {
  allBookings: any[] = [];
  bookings: any[] = [];
  isLoadingBookings = true;
  activeMenuId: number | null = null;
  activeFilter = 'all';
  selectedNotesBooking: any | null = null;

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoadingBookings = true;

    this.api.getBookings().subscribe({
      next: (res: any) => {
        const data = res.Data || res;
        this.allBookings = Array.isArray(data) ? data : [];
        this.applyStatusFilter();
        this.isLoadingBookings = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.allBookings = [];
        this.bookings = [];
        this.isLoadingBookings = false;
      },
    });
  }

  approveBooking(booking: any): void {
    this.activeMenuId = null;

    this.api.updateBookingStatus(booking.id, 'Approved').subscribe({
      next: () => {
        booking.status = 'Approved';
        this.applyStatusFilter();
        this.toast.show('Booking approved successfully!', 'success');
      },
      error: (err) => {
        console.error('Error approving booking:', err);
        this.toast.show('Failed to approve booking. Please try again.', 'error');
      },
    });
  }

  cancelBooking(booking: any): void {
    this.activeMenuId = null;

    this.api.updateBookingStatus(booking.id, 'Cancelled').subscribe({
      next: () => {
        booking.status = 'Cancelled';
        this.applyStatusFilter();
        this.toast.show('Booking cancelled successfully!', 'success');
      },
      error: (err) => {
        console.error('Error cancelling booking:', err);
        this.toast.show('Failed to cancel booking. Please try again.', 'error');
      },
    });
  }

  viewNotes(booking: any): void {
    this.selectedNotesBooking = booking;
    this.activeMenuId = null;
  }

  closeNotes(): void {
    this.selectedNotesBooking = null;
  }

  toggleMenu(booking: any): void {
    this.activeMenuId = this.activeMenuId === booking.id ? null : booking.id;
  }

  handleStatusFilter(status: string): void {
    this.activeFilter = status;
    this.activeMenuId = null;
    this.applyStatusFilter();
  }

  private applyStatusFilter(): void {
    if (this.activeFilter === 'all') {
      this.bookings = [...this.allBookings];
      return;
    }

    this.bookings = this.allBookings.filter(
      booking => booking.status?.toLowerCase() === this.activeFilter
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedMenu = target.closest('[data-testid="menu-btn"]');

    if (!clickedMenu) {
      this.activeMenuId = null;
    }
  }

  isPending(booking: any): boolean {
    return booking.status === 'Pending';
  }
}
