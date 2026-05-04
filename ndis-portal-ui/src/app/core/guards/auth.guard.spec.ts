/// <reference types="jasmine" />
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard - Protected Routes', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: jasmine.createSpy('isAuthenticated'),
            getToken: jasmine.createSpy('getToken'),
            getRole: jasmine.createSpy('getRole'),
          },
        },
        {
          provide: Router,
          useValue: {
            parseUrl: jasmine.createSpy('parseUrl').and.returnValue('/forbidden'),
          },
        },
      ],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  describe('TC-A09: Access protected page without token', () => {
    it('Should redirect to forbidden when accessing /services without token', () => {
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(false);
      (authService.getToken as jasmine.Spy).and.returnValue(null);

      const mockRoute = {} as any;
      const mockState = { url: '/services' } as any;

      const result = AuthGuard(mockRoute, mockState);

      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(router.parseUrl).toHaveBeenCalledWith('/forbidden');
    });

    it('Should redirect to forbidden when accessing /bookings without token', () => {
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(false);

      const mockRoute = {} as any;
      const mockState = { url: '/bookings' } as any;

      const result = AuthGuard(mockRoute, mockState);

      expect(router.parseUrl).toHaveBeenCalledWith('/forbidden');
    });

    it('Should deny access when token is not in localStorage', () => {
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(false);

      const mockRoute = {} as any;
      const mockState = { url: '/services' } as any;

      AuthGuard(mockRoute, mockState);

      expect(router.parseUrl).toHaveBeenCalled();
    });

    it('Should return UrlTree (redirect) when not authenticated', () => {
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(false);
      (router.parseUrl as jasmine.Spy).and.returnValue('/forbidden' as any);

      const mockRoute = {} as any;
      const mockState = { url: '/services' } as any;

      const result = AuthGuard(mockRoute, mockState);

      expect(result).toBeTruthy();
      expect(router.parseUrl).toHaveBeenCalledWith('/forbidden');
    });
  });

  describe('Authenticated Access', () => {
    it('Should allow access to /services when authenticated', () => {
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(true);
      (authService.getToken as jasmine.Spy).and.returnValue('test-token');

      const mockRoute = {} as any;
      const mockState = { url: '/services' } as any;

      const result = AuthGuard(mockRoute, mockState);

      expect(result).toBe(true);
    });

    it('Should allow access to /bookings when authenticated', () => {
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(true);

      const mockRoute = {} as any;
      const mockState = { url: '/bookings' } as any;

      const result = AuthGuard(mockRoute, mockState);

      expect(result).toBe(true);
    });

    it('Should allow access to all protected routes when authenticated', () => {
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(true);

      const protectedRoutes = ['/services', '/bookings', '/services/1', '/book-new'];

      protectedRoutes.forEach((route) => {
        const mockRoute = {} as any;
        const mockState = { url: route } as any;

        const result = AuthGuard(mockRoute, mockState);

        expect(result).toBe(true);
      });
    });
  });

  describe('Token Expiration', () => {
    it('Should redirect to forbidden if token becomes invalid', () => {
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(false);

      const mockRoute = {} as any;
      const mockState = { url: '/services' } as any;

      AuthGuard(mockRoute, mockState);

      expect(router.parseUrl).toHaveBeenCalledWith('/forbidden');
    });
  });

  describe('Role-Based Access', () => {
    it('Should allow participant access to participant routes', () => {
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(true);
      (authService.getRole as jasmine.Spy).and.returnValue('Participant');

      const mockRoute = { data: { role: 'participant' } } as any;
      const mockState = { url: '/services' } as any;

      const result = AuthGuard(mockRoute, mockState);

      expect(result).toBe(true);
    });

    it('Should allow coordinator access to coordinator routes', () => {
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(true);
      (authService.getRole as jasmine.Spy).and.returnValue('Coordinator');

      const mockRoute = { data: { role: 'coordinator' } } as any;
      const mockState = { url: '/dashboard' } as any;

      const result = AuthGuard(mockRoute, mockState);

      expect(result).toBe(true);
    });

    it('Should redirect participant away from coordinator routes', () => {
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(true);
      (authService.getRole as jasmine.Spy).and.returnValue('Participant');

      const mockRoute = { data: { role: 'coordinator' } } as any;
      const mockState = { url: '/dashboard' } as any;

      const result = AuthGuard(mockRoute, mockState);

      expect(result).toBe('/forbidden' as any);
      expect(router.parseUrl).toHaveBeenCalledWith('/forbidden');
    });

    it('Should redirect coordinator away from participant routes', () => {
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(true);
      (authService.getRole as jasmine.Spy).and.returnValue('Coordinator');

      const mockRoute = { data: { role: 'participant' } } as any;
      const mockState = { url: '/services' } as any;

      const result = AuthGuard(mockRoute, mockState);

      expect(result).toBe('/forbidden' as any);
      expect(router.parseUrl).toHaveBeenCalledWith('/forbidden');
    });
  });

  describe('Multiple Protected Routes', () => {
    it('Should protect /services route', () => {
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(false);

      const mockRoute = {} as any;
      const mockState = { url: '/services' } as any;

      AuthGuard(mockRoute, mockState);

      expect(router.parseUrl).toHaveBeenCalled();
    });

    it('Should protect /bookings route', () => {
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(false);

      const mockRoute = {} as any;
      const mockState = { url: '/bookings' } as any;

      AuthGuard(mockRoute, mockState);

      expect(router.parseUrl).toHaveBeenCalled();
    });

    it('Should protect /book-new route', () => {
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(false);

      const mockRoute = {} as any;
      const mockState = { url: '/book-new' } as any;

      AuthGuard(mockRoute, mockState);

      expect(router.parseUrl).toHaveBeenCalled();
    });
  });
});
