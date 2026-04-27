import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking } from '../models/booking.model';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  getBookings(status?: string): Observable<Booking[]> {
    let params = new HttpParams();
    if (status && status !== 'all') {
      params = params.set('status', status);
    }

    return this.http
      .get<Booking[] | any>(this.apiUrl, { params })
      .pipe(
        map((response: any) => {
          // Handle wrapped response: { Success: true, Data: [...] }
          if (response && Array.isArray(response.Data)) {
            return response.Data;
          }
          // Handle direct array response
          if (Array.isArray(response)) {
            return response;
          }
          return [];
        }),
        catchError((error) => {
          if (error.status === 401) {
            return throwError(() => new Error('Please log in to view your bookings.'));
          }
          if (error.status === 403) {
            return throwError(() => new Error('You do not have permission to view these bookings.'));
          }
          return throwError(() => new Error('Failed to load bookings. Please try again.'));
        })
      );
  }

  getBooking(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        if (error.status === 404) {
          return throwError(() => new Error('Booking not found.'));
        }
        return throwError(() => new Error('Failed to load booking details.'));
      })
    );
  }

  createBooking(bookingData: {
    serviceId: number;
    preferredDate: string;
    notes?: string;
  }): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, bookingData).pipe(
      catchError((error) => {
        if (error.error?.message) {
          return throwError(() => new Error(error.error.message));
        }
        return throwError(() => new Error('Failed to create booking. Please try again.'));
      })
    );
  }

  updateBookingStatus(
    id: number,
    status: 'Approved' | 'Cancelled'
  ): Observable<Booking> {
    return this.http
      .put<Booking>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(
        catchError((error) => {
          if (error.error?.message) {
            return throwError(() => new Error(error.error.message));
          }
          return throwError(() => new Error('Failed to update booking status.'));
        })
      );
  }

  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        if (error.status === 403) {
          return throwError(() => new Error('You can only delete your own pending bookings.'));
        }
        return throwError(() => new Error('Failed to delete booking.'));
      })
    );
  }
}
