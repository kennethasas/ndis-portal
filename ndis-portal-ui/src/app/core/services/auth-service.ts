import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * User model for type safety
 */
export interface User {
  userId: string;
  email: string;
  role: string;
}

/**
 * AuthService - The Single Source of Truth
 * Manages authentication state and user data reactively
 * All components subscribe to observables, ensuring real-time consistency
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // ========================
  // 🔐 PRIVATE STATE
  // ========================
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasToken(),
  );
  private userSubject = new BehaviorSubject<User | null>(this.getUserData());

  // ========================
  // 📡 PUBLIC OBSERVABLES
  // ========================
  /** Observable for authentication status - components subscribe to stay updated */
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  /** Observable for user data - Navbar, Sidebar, etc. can subscribe for real-time user info */
  public user$ = this.userSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Initialize state if in browser
    if (isPlatformBrowser(this.platformId)) {
      this.isAuthenticatedSubject.next(this.hasToken());
      this.userSubject.next(this.getUserData());
    }
  }

  // ========================
  // 🔍 PRIVATE HELPERS
  // ========================
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private hasToken(): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    return !!localStorage.getItem('token');
  }

  private getUserData(): User | null {
    if (!this.isBrowser()) {
      return null;
    }

    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');

    if (userId && email && role) {
      return { userId, email, role };
    }

    return null;
  }

  // ========================
  // 🔓 PUBLIC METHODS
  // ========================

  /**
   * Login - Store token and user data, update observables
   * All components subscribed to user$ and isAuthenticated$ will be notified
   */
  login(token: string, userId: string, email: string, role: string): void {
    if (!this.isBrowser()) return;

    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('email', email);
    localStorage.setItem('role', role);

    // Update observables - triggers updates in all subscribed components
    this.isAuthenticatedSubject.next(true);
    this.userSubject.next({ userId, email, role });

    console.log('✅ User logged in:', { userId, email, role });
  }

  /**
   * Logout - Clear all auth data, update observables
   * All components will automatically reflect logout state
   */
  logout(): void {
    if (!this.isBrowser()) return;

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('role');

    // Update observables - triggers updates in all subscribed components
    this.isAuthenticatedSubject.next(false);
    this.userSubject.next(null);

    console.log('✅ User logged out');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /**
   * Get JWT token
   */
  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem('token');
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem('userId');
  }

  /**
   * Get current user email
   */
  getEmail(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem('email');
  }

  /**
   * Get current user role
   */
  getRole(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem('role');
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    return this.getRole() === role;
  }
}
