import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Existing Logic: Check if user is logged in
  console.log('AuthGuard checking... URL:', state.url);
  if (!authService.isAuthenticated()) {
    console.log('AuthGuard: DENY access, redirecting to /forbidden');
    return router.parseUrl('/forbidden');
  }

  // 2. New Logic: Check for specific role requirement
  // We look for 'role' inside the route data we define in the routes file
  const requiredRole = route.data?.['role'];
  const userRole = authService.getRole(); // Calls the method in your AuthService

  // If the route requires a role, but the user's role doesn't match, block them
  // Case-insensitive comparison to handle both 'Coordinator' and 'coordinator'
  if (requiredRole && userRole?.toLowerCase() !== requiredRole.toLowerCase()) {
    console.log(
      `AuthGuard: ROLE DENIED - Needed ${requiredRole}, but user is ${userRole}`,
    );
    return router.parseUrl('/forbidden'); // Redirect to a 'no access' page
  }

  console.log('AuthGuard: ALLOW access');
  return true;
};
