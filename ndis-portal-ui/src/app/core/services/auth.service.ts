import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // 1. Force the initial state to 'true' so the UI thinks we are logged in
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(true);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      // 2. Keep this as true for now to allow sidebar/navbar to render
      this.isAuthenticatedSubject.next(true);
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // 3. Temporarily bypass token check
  private hasToken(): boolean {
    // return !!localStorage.getItem('token'); // Original logic
    return true; // Bypass: Always returns true
  }

  login(token: string, userId: string, email: string): void {
    if (!this.isBrowser()) return;

    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('email', email);
    this.isAuthenticatedSubject.next(true);
  }

  logout(): void {
    if (!this.isBrowser()) return;

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    this.isAuthenticatedSubject.next(false);
  }

  // 4. Force this to return true so Guards and Templates allow access
  isAuthenticated(): boolean {
    return true; // Bypass: Always allow entry to the dashboard
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
}
