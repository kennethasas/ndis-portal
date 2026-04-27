import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
    return this.http.post<any>(this.apiUrl, service).pipe(
      catchError((error: any) => {
        return throwError(() => new Error('Failed to create service. Please try again.'));
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

  deleteService(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError((error: any) => {
        return throwError(() => new Error('Failed to delete service. Please try again.'));
      })
    );
  }
}
