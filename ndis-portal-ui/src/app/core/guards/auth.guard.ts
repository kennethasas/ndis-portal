import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  const requiredRole = route.data?.['role'];
  const userRole = authService.getRole();

  console.log('AuthGuard checking... URL:', state.url);
  console.log('Is authenticated:', isAuthenticated);
  console.log('Required role:', requiredRole);
  console.log('User role:', userRole);

  if (!isAuthenticated) {
    console.log('AuthGuard: DENY access, user is not authenticated');
    return router.parseUrl('/forbidden');
  }

  console.log(`AuthGuard: Role check - Required: ${requiredRole}, User: ${userRole}`);

  if (requiredRole && userRole?.toLowerCase() !== requiredRole.toLowerCase()) {
    console.log(
      `AuthGuard: ROLE DENIED - Needed ${requiredRole}, but user is ${userRole}`,
    );
    return router.parseUrl('/forbidden');
  }

  console.log('AuthGuard: ALLOW access');
  return true;
};
