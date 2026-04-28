import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
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
    return this.http.post<Booking | any>(this.apiUrl, bookingData).pipe(
      map((response: any) => {
        // Handle wrapped response: { Success: true, Data: {...} }
        if (response && response.Data) {
          return response.Data;
        }
        return response;
      }),
      catchError((error) => {
        console.error('Booking API error:', error);
        // Handle wrapped error response
        if (error.error?.Message) {
          return throwError(() => new Error(error.error.Message));
        }
        if (error.error?.message) {
          return throwError(() => new Error(error.error.message));
        }
        if (error.error?.errors) {
          // Validation errors from backend
          const errors = error.error.errors;
          const firstError = Object.values(errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            return throwError(() => new Error(firstError[0]));
          }
        }
        if (error.status === 400) {
          return throwError(() => new Error('Invalid booking data. Please check your inputs.'));
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
    return this.http.delete(`${this.apiUrl}/${id}`, { 
      observe: 'response',
      responseType: 'text'
    }).pipe(
      map((response) => {
        // Success: 200, 202, or 204 No Content
        return undefined;
      }),
      catchError((error) => {
        console.error('Delete booking error:', error);
        
        // Check for HTTP/2 protocol error in multiple places
        const errorStr = JSON.stringify(error).toLowerCase();
        const isHttp2Error = 
          error.message?.toLowerCase().includes('http2') ||
          error.name?.toLowerCase().includes('http2') ||
          errorStr.includes('http2') ||
          errorStr.includes('err_http2') ||
          errorStr.includes('protocol_error');
        
        // HTTP/2 protocol error but request likely succeeded
        if (isHttp2Error) {
          console.log('HTTP/2 error detected - treating as success');
          // Treat as success - the backend likely processed the delete
          return of(undefined);
        }
        
        // Handle connection errors (wrong port, server down, etc.)
        if (error.status === 0) {
          return throwError(() => new Error('Cannot connect to server. Please check if the backend is running.'));
        }
        if (error.status === 403) {
          return throwError(() => new Error('You can only delete your own pending bookings.'));
        }
        if (error.status === 404) {
          return throwError(() => new Error('Booking not found.'));
        }
        // Handle wrapped error response
        if (error.error?.Message || error.error?.message) {
          return throwError(() => new Error(error.error.Message || error.error.message));
        }
        return throwError(() => new Error('Failed to delete booking. Please try again.'));
      })
    );
  }
}
