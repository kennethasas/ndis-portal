import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

 canActivate(route: ActivatedRouteSnapshot): boolean {

  // 🔐 First: check authentication
  if (!this.auth.isAuthenticated()) {
    this.router.navigate(['/login']);
    return false;
  }

  const expectedRole = route.data?.['role'];

  // No role required → allow
  if (!expectedRole) {
    return true;
  }

  // Role check
  if (!this.auth.hasRole(expectedRole)) {
    this.router.navigate(['/services']);
    return false;
  }

  return true;
}
}
