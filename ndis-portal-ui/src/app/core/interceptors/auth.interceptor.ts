import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Get token from AuthService
    const token = this.auth.getToken();

    // Clone the request and add Authorization header if token exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Handle the request and catch errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized - force logout
        if (error.status === 401) {
          console.error('❌ 401 Unauthorized - Logging out');
          this.auth.logout();
          this.router.navigate(['/login']);
        }

        // Handle other errors
        if (error.status === 403) {
          console.error('❌ 403 Forbidden - Access Denied');
        }

        if (error.status === 404) {
          console.error('❌ 404 Not Found');
        }

        if (error.status === 500) {
          console.error('❌ 500 Internal Server Error');
        }

        return throwError(() => error);
      })
    );
  }
}
