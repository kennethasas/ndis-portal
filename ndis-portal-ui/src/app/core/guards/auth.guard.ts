import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional Guard to protect dashboard routes.
 * It checks the AuthService to see if a valid session exists.
 */
export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard checking... URL:', state.url);
  console.log('isAuthenticated:', authService.isAuthenticated());
  console.log('token:', authService.getToken());

  if (authService.isAuthenticated()) {
    console.log('AuthGuard: ALLOW access');
    return true; // Allow access to MainLayout
  }

  console.log('AuthGuard: DENY access, redirecting to /login');
  // Redirect to login if not authenticated
  return router.parseUrl('/login');
};
