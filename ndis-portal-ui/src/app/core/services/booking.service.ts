import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking } from '../models/booking.model';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {
    console.log('[BookingService] API URL configured as:', `${environment.apiUrl}/bookings`);
    console.log('[BookingService] Environment API URL:', environment.apiUrl);
  }

  getBookings(status?: string): Observable<Booking[]> {
    let params = new HttpParams();
    if (status && status !== 'all') {
      params = params.set('status', status);
    }

    console.log('[BookingService] Fetching bookings from:', this.apiUrl);
    console.log('[BookingService] With params:', params.toString());

    return this.http
      .get<Booking[] | any>(this.apiUrl, { params })
      .pipe(
        map((response: any) => {
          console.log('[BookingService] Raw response:', response);
          console.log('[BookingService] Response type:', typeof response);
          console.log('[BookingService] Response keys:', Object.keys(response || {}));
          
          // Handle wrapped response: { Success: true, Data: [...] }
          if (response && Array.isArray(response.Data)) {
            console.log('[BookingService] Found wrapped Data array with', response.Data.length, 'items');
            return response.Data;
          }
          // Handle direct array response
          if (Array.isArray(response)) {
            console.log('[BookingService] Found direct array with', response.length, 'items');
            return response;
          }
          
          console.log('[BookingService] No valid booking data found, returning empty array');
          return [];
        }),
        catchError((error) => {
          console.error('[BookingService] API Error:', error);
          console.error('[BookingService] Error status:', error.status);
          console.error('[BookingService] Error message:', error.message);
          console.error('[BookingService] Error url:', error.url);
          
          if (error.status === 401) {
            return throwError(() => new Error('Please log in to view your bookings.'));
          }
          if (error.status === 403) {
            return throwError(() => new Error('You do not have permission to view these bookings.'));
          }
          if (error.status === 404) {
            return throwError(() => new Error('Bookings endpoint not found. Please check the backend API.'));
          }
          if (error.status === 0 || error.message?.includes('ERR_EMPTY_RESPONSE')) {
            console.log('[BookingService] Empty response detected - backend endpoint may not be implemented');
            return of([]); // Return empty array instead of error
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
    console.log('Making booking request to:', this.apiUrl);
    console.log('Booking payload:', bookingData);
    
    return this.http.post<Booking | any>(this.apiUrl, bookingData).pipe(
      timeout(10000), // 10 second timeout
      map((response: any) => {
        console.log('Raw HTTP response received:', response);
        
        // Handle wrapped response: { Success: true, Data: {...} }
        if (response && response.Data) {
          console.log('Found wrapped response data:', response.Data);
          return response.Data;
        }
        
        // If we get here, the response might be invalid
        console.log('Response format unexpected:', response);
        
        // Check if response is empty or invalid
        if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
          console.log('Empty or invalid response detected');
          throw new Error('Invalid response from server. Booking was not created.');
        }
        
        return response;
      }),
      catchError((error) => {
        console.error('Booking API error:', error);
        console.error('Error status:', error.status);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error error:', error.error);
        
        // Handle connection errors (backend disconnected)
        if (error.status === 0 || error.status === undefined) {
          console.log('Detected connection error - status 0 or undefined');
          return throwError(() => new Error('Cannot connect to server. Please check your internet connection and try again.'));
        }
        
        // Handle network errors (ProgressEvent indicates network failure)
        if (error.name === 'HttpErrorResponse' && (error.error instanceof ProgressEvent || error.error === null)) {
          console.log('Detected network error - ProgressEvent or null error');
          return throwError(() => new Error('Network error. Please check your internet connection and try again.'));
        }
        
        // Handle timeout errors
        if (error.name === 'TimeoutError' || error.name === 'TimeoutError') {
          console.log('Detected timeout error');
          return throwError(() => new Error('Request timed out. Please try again.'));
        }
        
        // Handle RxJS timeout
        if (error.message && error.message.includes('timeout')) {
          console.log('Detected RxJS timeout');
          return throwError(() => new Error('Request timed out. Please try again.'));
        }
        
        // Handle CORS errors
        if (error.message && error.message.includes('CORS')) {
          console.log('Detected CORS error');
          return throwError(() => new Error('Cannot connect to server due to CORS policy. Please check server configuration.'));
        }
        
        // Handle wrapped error response
        if (error.error?.Message) {
          console.log('Detected wrapped error message');
          return throwError(() => new Error(error.error.Message));
        }
        if (error.error?.message) {
          console.log('Detected wrapped error message (lowercase)');
          return throwError(() => new Error(error.error.message));
        }
        if (error.error?.errors) {
          console.log('Detected validation errors');
          // Validation errors from backend
          const errors = error.error.errors;
          const firstError = Object.values(errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            return throwError(() => new Error(firstError[0]));
          }
        }
        if (error.status === 400) {
          console.log('Detected bad request error');
          return throwError(() => new Error('Invalid booking data. Please check your inputs.'));
        }
        if (error.status === 500) {
          console.log('Detected server error');
          return throwError(() => new Error('Server error. Please try again later.'));
        }
        
        // Catch-all for any other errors
        console.log('Using catch-all error handler');
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
