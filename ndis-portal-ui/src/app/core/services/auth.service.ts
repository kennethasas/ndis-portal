import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

export interface RegisterResponse {
  status: number;
  message: string;
  user?: {
    id: number;
    role: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  message: string;
  token?: string;
  user?: {
    id: number;
    role: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private apiUrl = environment.apiUrl;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      this.isAuthenticatedSubject.next(!!token);
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/auth/register`, data)
      .pipe(
        catchError((error: any) => {
          // Pass through the complete error object to the components
          return throwError(() => error);
        }),
      );
  }

  loginApi(data: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, data)
      .pipe(
        catchError((error: any) => {
          // Pass through the complete error object to the components
          return throwError(() => error);
        }),
      );
  }

  login(token: string, userId: string, email: string, role?: string): void {
    if (!this.isBrowser()) return;

    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('email', email);
    if (role) {
      localStorage.setItem('role', role);
    }
    this.isAuthenticatedSubject.next(true);
  }

  logout(): void {
    if (!this.isBrowser()) return;

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser()) return false;
    return this.hasToken();
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('token');
  }

  getUserId(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('userId');
  }

  getEmail(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('email');
  }

  getRole(): string | null {
    const role = localStorage.getItem('role');

    if (!role) return null;

    return role.toLowerCase();
  }
}
