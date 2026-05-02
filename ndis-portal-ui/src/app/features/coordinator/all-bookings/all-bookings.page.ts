import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api-service';

@Component({
  selector: 'app-all-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-bookings.page.html',
})
export class AllBookingsComponent implements OnInit {
  bookings: any[] = [];
  isLoadingBookings = true;
  activeMenuId: number | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoadingBookings = true;

    this.api.getBookings().subscribe({
      next: (res: any) => {
        const data = res.Data || res;
        this.bookings = Array.isArray(data) ? data : [];
        this.isLoadingBookings = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
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
      },
      error: (err) => {
        console.error('Error approving booking:', err);
        alert('Failed to approve booking. Please try again.');
      },
    });
  }

  toggleMenu(booking: any): void {
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
