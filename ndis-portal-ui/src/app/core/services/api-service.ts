import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient) {}

  getServices(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response: any) => {
        // Handle wrapped response: { Success: true, Data: [...] }
        if (response && response.Data) {
          return response;
        }
        // Handle direct response
        return response;
      }),
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('Please log in to view services.'));
        }
        if (error.status === 403) {
          return throwError(() => new Error('You do not have permission to view services.'));
        }
        return throwError(() => new Error('Failed to load services. Please try again.'));
      })
    );
  }

  getServiceById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((response: any) => {
        // Handle wrapped response: { Success: true, Data: {...} }
        if (response && response.Data) {
          return response;
        }
        // Handle direct response
        return response;
      }),
      catchError((error: any) => {
        if (error.status === 404) {
          return throwError(() => new Error('Service not found.'));
        }
        if (error.status === 401) {
          return throwError(() => new Error('Please log in to view this service.'));
        }
        return throwError(() => new Error('Failed to load service. Please try again.'));
      })
    );
  }

  createService(service: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(this.apiUrl, service, { headers }).pipe(
      catchError((error: any) => {
        return throwError(() => new Error('Failed to create service. Please try again.'));
      })
    );
  }

  // Helper to include Authorization header if token is present
  // Returns HttpHeaders with Authorization if token exists
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  // Get service categories for dropdown
  getServiceCategories(): Observable<any> {
    // Assuming the API exposes /service-categories endpoint
    return this.http.get<any>(`${environment.apiUrl}/service-categories`).pipe(
      catchError((error: any) => {
        return throwError(() => new Error('Failed to load service categories.'));
      })
    );
  }

  updateService(id: number, service: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, service).pipe(
      catchError((error: any) => {
        return throwError(() => new Error('Failed to update service. Please try again.'));
      })
    );
  }

  // Decode JWT token to see claims
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  // Get all services including inactive (coordinator only)
  getAllServices(): Observable<any> {
    const headers = this.getAuthHeaders();
    const token = localStorage.getItem('token');
    console.log('getAllServices - Token:', token);
    
    // Decode and log the token claims
    if (token) {
      const decoded = this.decodeToken(token);
      console.log('Decoded JWT claims:', decoded);
      console.log('Role claim:', decoded?.role || decoded?.Role || decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
    }
    
    return this.http.get<any>(`${this.apiUrl}/all`, { headers }).pipe(
      map((response: any) => {
        if (response && response.Data) {
          return response;
        }
        return response;
      }),
      catchError((error: any) => {
        console.error('getAllServices - Error:', error);
        console.error('getAllServices - Error status:', error.status);
        console.error('getAllServices - Error body:', error.error);
        return throwError(() => new Error('Failed to load all services.'));
      })
    );
  }

  // Toggle service active status (coordinator only)
  toggleServiceActive(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch<any>(`${this.apiUrl}/${id}/toggle-active`, {}, { headers }).pipe(
      catchError((error: any) => {
        return throwError(() => new Error('Failed to toggle service status.'));
      })
    );
  }

  deleteService(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError((error: any) => {
        return throwError(() => new Error('Failed to delete service. Please try again.'));
      })
    );
  }
}
