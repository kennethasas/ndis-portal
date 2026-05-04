import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusCardComponent } from '../../../../shared/components/card/status-card/status-card.component';
import { ApiService } from '../../../core/services/api-service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatusCardComponent],
  templateUrl: './dashboard.page.html',
})
export class DashboardComponent implements OnInit {
  // Stats data - will be populated from API
  stats: any[] = [
    {
      label: 'Total Bookings',
      value: 0,
    },
    {
      label: 'Pending',
      value: 0,
    },
    {
      label: 'Approved',
      value: 0,
    },
    {
      label: 'Cancelled',
      value: 0,
    },
  ];

  // Recent bookings data
  bookings: any[] = [];
  isLoading = true;
  isLoadingBookings = true;

  // Menu state
  activeMenuId: number | null = null;

  constructor(
    private api: ApiService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadBookings();
  }

  loadStats(): void {
    this.api.getBookingStats().subscribe({
      next: (res: any) => {
        console.log('Booking stats response:', res);
        const data = res.Data || res;
        if (data) {
          this.stats[0].value = data.totalBookings || 0;
          this.stats[1].value = data.pending || 0;
          this.stats[2].value = data.approved || 0;
          this.stats[3].value = data.cancelled || 0;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading booking stats:', err);
        this.isLoading = false;
      },
    });
  }

  loadBookings(): void {
    this.isLoadingBookings = true;
    this.api.getBookings().subscribe({
      next: (res: any) => {
        console.log('Bookings response:', res);
        const data = res.Data || res;
        this.bookings = Array.isArray(data) ? data.slice(0, 5) : [];

        // Debug: Log booking details
        console.log('Bookings loaded:', this.bookings.length);
        this.bookings.forEach((booking, index) => {
          console.log(`Booking ${index}:`, {
            id: booking.id,
            status: booking.status,
            isPending: this.isPending(booking),
          });
        });

        this.isLoadingBookings = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.isLoadingBookings = false;
      },
    });
  }

  approveBooking(booking: any): void {
    // Close menu
    this.activeMenuId = null;

    this.api.updateBookingStatus(booking.id, 'Approved').subscribe({
      next: () => {
        // Update UI immediately without reload
        booking.status = 'Approved';
        // Refresh stats to reflect the change
        this.loadStats();
        this.toast.show('Booking approved successfully!', 'success');
      },
      error: (err) => {
        console.error('Error approving booking:', err);
        this.toast.show(
          'Failed to approve booking. Please try again.',
          'error',
        );
      },
    });
  }

  cancelBooking(booking: any): void {
    this.activeMenuId = null;

    this.api.updateBookingStatus(booking.id, 'Cancelled').subscribe({
      next: () => {
        booking.status = 'Cancelled';
        this.loadStats();
        this.toast.show('Booking cancelled successfully!', 'success');
      },
      error: (err) => {
        console.error('Error cancelling booking:', err);
        this.toast.show('Failed to cancel booking. Please try again.', 'error');
      },
    });
  }

  toggleMenu(booking: any): void {
    // Close menu if clicking the same booking, otherwise open new menu
    this.activeMenuId = this.activeMenuId === booking.id ? null : booking.id;
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
