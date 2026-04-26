import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth-service'; 

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:5002/api';

  constructor(
    private http: HttpClient,
    private auth: AuthService 
  ) {}

  // ========================
  // 🔓 PUBLIC
  // ========================

  getServices() {
    return this.http.get(`${this.baseUrl}/services`);
  }

  getServiceById(id: number) {
    return this.http.get(`${this.baseUrl}/services/${id}`);
  }

  // ========================
  // 🔐 PROTECTED
  // ========================

  private getAuthHeaders() {
    const token = this.auth.getToken(); // ✅ use AuthService

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  createService(data: any) {
    return this.http.post(
      `${this.baseUrl}/services`,
      data,
      this.getAuthHeaders()
    );
  }

  updateService(id: number, data: any) {
    return this.http.put(
      `${this.baseUrl}/services/${id}`,
      data,
      this.getAuthHeaders()
    );
  }

  deleteService(id: number) {
    return this.http.delete(
      `${this.baseUrl}/services/${id}`,
      this.getAuthHeaders()
    );
  }
}