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

  if (authService.isAuthenticated()) {
    return true; // Allow access to MainLayout
  }

  // Redirect to login if not authenticated
  return router.parseUrl('/login');
};
