import { Injectable } from '@angular/core';



import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';



import { Observable, catchError, map, throwError } from 'rxjs';



import { environment } from '../../../environments/environment';







@Injectable({



  providedIn: 'root',



})



export class ApiService {



  private apiUrl = `${environment.apiUrl}/services`;



  private bookingsApiUrl = `${environment.apiUrl}/bookings`;







  constructor(private http: HttpClient) {}







  getServices(): Observable<any> {



    const headers = this.getAuthHeaders();



    



    // Check user role to determine which endpoint to use



    const userRole = this.getStoredValue('role') || '';



    



    // Participants get only active services, Coordinators get all services



    const endpointUrl = userRole.toLowerCase() === 'coordinator' 



      ? `${this.apiUrl}/coordinator` 



      : `${this.apiUrl}`;



    



    return this.http.get<any>(endpointUrl, { headers }).pipe(



      map((response: any) => {



        console.log('Raw API response:', response); // Debug log



        // Handle wrapped response: { Success: true, Data: [...] }



        if (response && response.Data) {



          return response;



        }



        // Handle direct response - wrap it for consistency



        return { Data: response };



      }),



      catchError((error) => {



        console.error('API Error:', error); // Debug log



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







  getCoordinatorServices(): Observable<any> {

    const headers = this.getAuthHeaders();

    return this.http.get<any>(`${this.apiUrl}/coordinator`, { headers }).pipe(

      map((response: any) => {

        if (response && Array.isArray(response.Data)) {

          return response;

        }

        if (Array.isArray(response)) {

          return { Data: response };

        }

        return { Data: [] };

      }),

      catchError((error: any) => {

        console.error('Coordinator services API error:', error);

        return throwError(() => new Error('Failed to load coordinator services.'));

      })

    );

  }



  getServiceById(id: number): Observable<any> {



    const headers = this.getAuthHeaders();



    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers }).pipe(



      map((response: any) => {



        // Handle wrapped response: { Success: true, Data: {...} }



        if (response && response.Data) {



          return response;



        }



        // Handle direct response - wrap it for consistency



        return { Data: response };



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



    const token = this.getStoredValue('token');



    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();



  }



  private getStoredValue(key: string): string | null {



    if (typeof window === 'undefined') {
      return null;
    }



    return localStorage.getItem(key);



  }







  // Get service categories for dropdown



  getServiceCategories(): Observable<any> {



    const headers = this.getAuthHeaders();



    // Assuming the API exposes /service-categories endpoint



    return this.http.get<any>(`${environment.apiUrl}/service-categories`, { headers }).pipe(



      map((response: any) => {



        // Handle wrapped response: { Success: true, Data: [...] }



        if (response && response.Data) {



          return response;



        }



        // Handle direct response - wrap it for consistency



        return { Data: response };



      }),



      catchError((error: any) => {



        return throwError(() => new Error('Failed to load service categories.'));



      })



    );



  }







  updateService(id: number, service: any): Observable<any> {



    const headers = this.getAuthHeaders();



    return this.http.put<any>(`${this.apiUrl}/${id}`, service, { headers }).pipe(



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







  // Get booking stats (coordinator only)



  getBookingStats(): Observable<any> {



    const headers = this.getAuthHeaders();



    return this.http.get<any>(`${this.bookingsApiUrl}/stats`, { headers }).pipe(



      catchError((error: any) => {



        return throwError(() => new Error('Failed to load booking stats.'));



      })



    );



  }







  // Get all bookings (coordinator only)



  getBookings(): Observable<any> {



    const headers = this.getAuthHeaders();



    return this.http.get<any>(this.bookingsApiUrl, { headers }).pipe(



      catchError((error: any) => {



        return throwError(() => new Error('Failed to load bookings.'));



      })



    );



  }







  // Update booking status - Approve or Cancel (coordinator only)



  updateBookingStatus(id: number, status: 'Approved' | 'Cancelled'): Observable<any> {



    const headers = this.getAuthHeaders();



    return this.http.put<any>(`${this.bookingsApiUrl}/${id}/status`, { status }, { headers }).pipe(



      catchError((error: any) => {



        return throwError(() => new Error(`Failed to ${status.toLowerCase()} booking.`));



      })



    );



  }







  // Update service status - Activate or Deactivate (coordinator only)



  // Backend expects IsActive (boolean), not status (string)



  updateServiceStatus(id: number, status: 'Active' | 'Inactive', serviceData: any): Observable<any> {



    const headers = this.getAuthHeaders();



    // Backend expects UpdateServiceDto: Name, CategoryId, Description, IsActive



    const payload = {



      Name: serviceData.name,



      CategoryId: serviceData.categoryId || serviceData.category,



      Description: serviceData.description || '',



      IsActive: status === 'Active'



    };



    return this.http.put<any>(`${this.apiUrl}/${id}`, payload, { headers }).pipe(



      catchError((error: any) => {



        return throwError(() => new Error(`Failed to update service status.`));



      })



    );



  }



}



