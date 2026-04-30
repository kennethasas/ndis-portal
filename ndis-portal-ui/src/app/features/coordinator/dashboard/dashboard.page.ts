import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusCardComponent } from '../../../../shared/components/card/status-card/status-card.component';
import { ApiService } from '../../../core/services/api-service';

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
      icon: 'fa-solid fa-calendar-days',
      color: '#6366f1',
      bg: '#e0e7ff',
    },
    {
      label: 'Pending',
      value: 0,
      icon: 'fa-solid fa-clock',
      color: '#f59e0b',
      bg: '#fef3c7',
    },
    {
      label: 'Approved',
      value: 0,
      icon: 'fa-solid fa-circle-check',
      color: '#10b981',
      bg: '#d1fae5',
    },
    {
      label: 'Cancelled',
      value: 0,
      icon: 'fa-solid fa-circle-xmark',
      color: '#ef4444',
      bg: '#fee2e2',
    },
  ];

  // Recent bookings data
  bookings: any[] = [];
  isLoading = true;
  isLoadingBookings = true;

  constructor(private api: ApiService) {}

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
      }
    });
  }

  loadBookings(): void {
    this.isLoadingBookings = true;
    this.api.getBookings().subscribe({
      next: (res: any) => {
        console.log('Bookings response:', res);
        const data = res.Data || res;
        this.bookings = Array.isArray(data) ? data : [];
        this.isLoadingBookings = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.isLoadingBookings = false;
      }
    });
  }

  approveBooking(booking: any): void {
    this.api.updateBookingStatus(booking.id, 'Approved').subscribe({
      next: () => {
        // Update UI immediately without reload
        booking.status = 'Approved';
        // Refresh stats to reflect the change
        this.loadStats();
      },
      error: (err) => {
        console.error('Error approving booking:', err);
        alert('Failed to approve booking. Please try again.');
      }
    });
  }

  cancelBooking(booking: any): void {
    this.api.updateBookingStatus(booking.id, 'Cancelled').subscribe({
      next: () => {
        // Update UI immediately without reload
        booking.status = 'Cancelled';
        // Refresh stats to reflect the change
        this.loadStats();
      },
      error: (err) => {
        console.error('Error cancelling booking:', err);
        alert('Failed to cancel booking. Please try again.');
      }
    });
  }

  isPending(booking: any): boolean {
    return booking.status === 'Pending';
  }
}