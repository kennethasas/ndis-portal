import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  /**
   * TEMP MOCK DATA
   * Replace this later with API call using HttpClient
   */
  private bookings = [
    {
      name: 'John Doe',
      service: 'Haircut',
      category: 'A',
      date: '2026-04-29',
      status: 'pending',
    },
    {
      name: 'Anna Smith',
      service: 'Spa',
      category: 'B',
      date: '2026-04-28',
      status: 'approved',
    },
    {
      name: 'Mike Ross',
      service: 'Massage',
      category: 'A',
      date: '2026-04-27',
      status: 'cancelled',
    },
    {
      name: 'Sarah Lee',
      service: 'Nails',
      category: 'C',
      date: '2026-04-26',
      status: 'pending',
    },
    {
      name: 'James Bond',
      service: 'Facial',
      category: 'B',
      date: '2026-04-25',
      status: 'approved',
    },
    {
      name: 'Tony Stark',
      service: 'Haircut',
      category: 'A',
      date: '2026-04-24',
      status: 'approved',
    },
  ];

  /**
   * Get ALL bookings (future API replacement point)
   */
  getAllBookings(): any[] {
    return this.bookings;
  }

  /**
   * Get RECENT bookings
   * - Sort by latest date
   * - Limit results (default = 5)
   */
  getRecentBookings(limit: number = 5): any[] {
    return [...this.bookings]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }
}
