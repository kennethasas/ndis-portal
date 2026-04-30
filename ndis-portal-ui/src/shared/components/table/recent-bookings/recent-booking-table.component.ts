import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AllBookingTable } from '../all-bookings/all-booking-table.component';

@Component({
  selector: 'app-recent-booking-table',
  standalone: true,
  imports: [AllBookingTable],

  template: `
    <!--
      Wrapper component:
      - Does NOT contain logic
      - Only forwards data/events to AllBookingTable
    -->

    <app-all-booking-table
      [bookings]="bookings"
      [currentFilter]="currentFilter"
      (viewBooking)="viewBooking.emit($event)"
      (cancelBooking)="cancelBooking.emit($event)"
      (approveBooking)="approveBooking.emit($event)"
    >
    </app-all-booking-table>
  `,
})
export class RecentBookingTable {
  /**
   * Bookings passed from dashboard/service
   */
  @Input() bookings: any[] = [];

  /**
   * Filter state (future use)
   */
  @Input() currentFilter: string = 'all';

  /**
   * Event outputs (just forwarded)
   */
  @Output() viewBooking = new EventEmitter<any>();
  @Output() cancelBooking = new EventEmitter<any>();
  @Output() approveBooking = new EventEmitter<any>();
}
