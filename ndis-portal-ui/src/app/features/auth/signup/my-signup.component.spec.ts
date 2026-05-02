/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MySignupComponent } from './my-signup.component';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

describe('MySignupComponent - Registration Test Cases', () => {
  let component: MySignupComponent;
  let fixture: ComponentFixture<MySignupComponent>;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MySignupComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(MySignupComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ===== VALIDATION TESTS =====
  describe('Field Validation', () => {
    it('TC-A03: Should show error when first name is empty', () => {
      component.signupData = {
        firstName: '',
        lastName: 'Smith',
        email: 'john@gmail.com',
        password: 'password123',
        role: 'Participant',
        agreeToTerms: true,
      };

      component.onSignUp();
      expect(component.errorMessage).toContain('First name and last name are required');
    });

    it('TC-A03: Should show error when last name is empty', () => {
      component.signupData = {
        firstName: 'John',
        lastName: '',
        email: 'john@gmail.com',
        password: 'password123',
        role: 'Participant',
        agreeToTerms: true,
      };

      component.onSignUp();
      expect(component.errorMessage).toContain('First name and last name are required');
    });

    it('TC-A03: Should show error when email is empty', () => {
      component.signupData = {
        firstName: 'John',
        lastName: 'Smith',
        email: '',
        password: 'password123',
        role: 'Participant',
        agreeToTerms: true,
      };

      component.onSignUp();
      expect(component.errorMessage).toContain('Email is required');
    });

    it('TC-A03: Should show error when password is empty', () => {
      component.signupData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@gmail.com',
        password: '',
        role: 'Participant',
        agreeToTerms: true,
      };

      component.onSignUp();
      expect(component.errorMessage).toContain('Password must be at least 8 characters');
    });

    it('TC-A03: Should show error when role is not selected', () => {
      component.signupData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@gmail.com',
        password: 'password123',
        role: '',
        agreeToTerms: true,
      };

      component.onSignUp();
      expect(component.errorMessage).toContain('Please select a role');
    });

    it('TC-A03: Should show error when terms are not accepted', () => {
      component.signupData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@gmail.com',
        password: 'password123',
        role: 'Participant',
        agreeToTerms: false,
      };

      component.onSignUp();
      expect(component.errorMessage).toContain('You must agree to the terms');
    });
  });

  // ===== EMAIL VALIDATION TESTS =====
  describe('TC-A04: Register with invalid email', () => {
    it('Should reject non-Gmail email formats at backend', (done: DoneFn) => {
      component.signupData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'notanemail@yahoo.com',
        password: 'password123',
        role: 'Participant',
        agreeToTerms: true,
      };

      component.onSignUp();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/auth/register')
      );

      req.flush(
        { status: 400, message: 'Email must be in @gmail.com format' },
        { status: 400, statusText: 'Bad Request' }
      );

      expect(component.errorMessage).toContain('Email must be in @gmail.com format');
    });

    it('Should reject email without domain', (done: DoneFn) => {
      component.signupData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'notanemail',
        password: 'password123',
        role: 'Participant',
        agreeToTerms: true,
      };

      component.onSignUp();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/auth/register')
      );

      req.flush(
        { status: 400, message: 'Invalid input' },
        { status: 400, statusText: 'Bad Request' }
      );

      setTimeout(() => {
        expect(component.errorMessage).toBeTruthy();
        done();
      }, 100);
    });
  });

  // ===== PASSWORD VALIDATION TESTS =====
  describe('TC-A05: Register with short password', () => {
    it('Should show error for password less than 8 characters', () => {
      component.signupData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@gmail.com',
        password: 'abc',
        role: 'Participant',
        agreeToTerms: true,
      };

      component.onSignUp();
      expect(component.errorMessage).toContain('Password must be at least 8 characters');
    });

    it('Should show error at backend if password is less than 8 characters', (done: DoneFn) => {
      component.signupData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@gmail.com',
        password: 'short',
        role: 'Participant',
        agreeToTerms: true,
      };

      component.onSignUp();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/auth/register')
      );

      req.flush(
        { status: 400, message: 'Password must be at least 8 characters' },
        { status: 400, statusText: 'Bad Request' }
      );

      setTimeout(() => {
        expect(component.errorMessage).toContain('Password must be at least 8 characters');
        done();
      }, 100);
    });
  });

  // ===== SUCCESSFUL REGISTRATION TESTS =====
  describe('TC-A01: Register with valid data', () => {
    it('Should return 201 and redirect to login on successful registration', (done: DoneFn) => {
      spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

      component.signupData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@gmail.com',
        password: 'password123',
        role: 'Participant',
        agreeToTerms: true,
      };

      component.onSignUp();
      expect(component.isLoading).toBe(true);

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/auth/register')
      );

      expect(req.request.method).toBe('POST');

      req.flush(
        {
          status: 201,
          message: 'Account successfully created',
          user: {
            id: 1,
            role: 'Participant',
          },
        },
        { status: 201, statusText: 'Created' }
      );

      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        expect(component.successMessage).toContain('Account successfully created');
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        done();
      }, 100);
    });

    it('Should display success message on successful registration', (done: DoneFn) => {
      component.signupData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@gmail.com',
        password: 'password123',
        role: 'Coordinator',
        agreeToTerms: true,
      };

      component.onSignUp();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/auth/register')
      );

      req.flush({
        status: 201,
        message: 'Account successfully created',
        user: { id: 2, role: 'Coordinator' },
      });

      setTimeout(() => {
        expect(component.successMessage).toBeTruthy();
        fixture.detectChanges();

        const successElement = fixture.debugElement.nativeElement.querySelector(
          '.success-message'
        );
        expect(successElement).toBeTruthy();
        done();
      }, 100);
    });

    it('Should redirect after 1.5 seconds on successful registration', (done: DoneFn) => {
      spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

      component.signupData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@gmail.com',
        password: 'password123',
        role: 'Participant',
        agreeToTerms: true,
      };

      component.onSignUp();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/auth/register')
      );

      req.flush({
        status: 201,
        message: 'Account successfully created',
        user: { id: 1, role: 'Participant' },
      });

      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        done();
      }, 1600);
    });
  });

  // ===== DUPLICATE EMAIL TESTS =====
  describe('TC-A02: Register with duplicate email', () => {
    it('Should return 400 when email already exists', (done: DoneFn) => {
      component.signupData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'existing@gmail.com',
        password: 'password123',
        role: 'Participant',
        agreeToTerms: true,
      };

      component.onSignUp();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/auth/register')
      );

      req.flush(
        { status: 400, message: 'Email already exists' },
        { status: 400, statusText: 'Bad Request' }
      );

      setTimeout(() => {
        expect(component.errorMessage).toContain('Email already exists');
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('Should display error message for duplicate email', (done: DoneFn) => {
      component.signupData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'duplicate@gmail.com',
        password: 'password123',
        role: 'Participant',
        agreeToTerms: true,
      };

      component.onSignUp();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/auth/register')
      );

      req.flush(
        { status: 400, message: 'Email already exists' },
        { status: 400, statusText: 'Bad Request' }
      );

      setTimeout(() => {
        fixture.detectChanges();

        const errorElement = fixture.debugElement.nativeElement.querySelector(
          '.error-message'
        );
        expect(errorElement).toBeTruthy();
        expect(errorElement.textContent).toContain('Email already exists');
        done();
      }, 100);
    });
  });

  // ===== ROLE VALIDATION TESTS =====
  describe('Role Validation', () => {
    it('Should accept Participant role', (done: DoneFn) => {
      component.signupData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@gmail.com',
        password: 'password123',
        role: 'Participant',
        agreeToTerms: true,
      };

      component.onSignUp();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/auth/register')
      );

      expect(req.request.body.role).toBe('Participant');
      req.flush({
        status: 201,
        message: 'Account successfully created',
        user: { id: 1, role: 'Participant' },
      });

      done();
    });

    it('Should accept Coordinator role', (done: DoneFn) => {
      component.signupData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@gmail.com',
        password: 'password123',
        role: 'Coordinator',
        agreeToTerms: true,
      };

      component.onSignUp();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/auth/register')
      );

      expect(req.request.body.role).toBe('Coordinator');
      req.flush({
        status: 201,
        message: 'Account successfully created',
        user: { id: 2, role: 'Coordinator' },
      });

      done();
    });
  });

  // ===== ERROR DISPLAY TESTS =====
  describe('Error Display', () => {
    it('Should display error message below "Log in" link', () => {
      component.errorMessage = 'Test error';
      fixture.detectChanges();

      const errorElement = fixture.debugElement.nativeElement.querySelector(
        '.error-message'
      );
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('Test error');
    });

    it('Should hide error message when cleared', () => {
      component.errorMessage = '';
      fixture.detectChanges();

      const errorElement = fixture.debugElement.nativeElement.querySelector(
        '.error-message'
      );
      expect(errorElement).toBeFalsy();
    });

    it('Should disable signup button while loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const button = fixture.debugElement.nativeElement.querySelector('.btn-signup');
      expect(button.disabled).toBe(true);
    });

    it('Should show loading text on button while loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const button = fixture.debugElement.nativeElement.querySelector('.btn-signup');
      expect(button.textContent).toContain('Creating account...');
    });
  });

  // ===== FORM RESET TESTS =====
  describe('Form State', () => {
    it('Should clear error message on new signup attempt', () => {
      component.errorMessage = 'Previous error';
      component.signupData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@gmail.com',
        password: 'password123',
        role: 'Participant',
        agreeToTerms: true,
      };

      component.onSignUp();
      expect(component.errorMessage).toBe('');
    });

    it('Should initialize with empty form data', () => {
      expect(component.signupData.firstName).toBe('');
      expect(component.signupData.lastName).toBe('');
      expect(component.signupData.email).toBe('');
      expect(component.signupData.password).toBe('');
      expect(component.signupData.role).toBe('');
      expect(component.signupData.agreeToTerms).toBe(false);
    });
  });
});
