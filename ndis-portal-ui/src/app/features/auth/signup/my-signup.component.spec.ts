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

  const flushSuccessfulLogin = (
    email: string,
    password: string,
    role: 'Participant' | 'Coordinator' = 'Participant',
  ) => {
    if (!jasmine.isSpy(router.navigate)) {
      spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    }

    const loginReq = httpMock.expectOne((request) =>
      request.url.includes('/api/auth/login')
    );

    expect(loginReq.request.method).toBe('POST');
    expect(loginReq.request.body).toEqual({ email, password });

    loginReq.flush({
      status: 200,
      message: 'Login successful',
      token: 'test-token',
      user: {
        id: 1,
        role,
      },
    });
  };

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
    localStorage.clear();
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
    it('Should display backend email validation errors', (done: DoneFn) => {
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
      done();
    });

    it('Should reject email without domain before calling backend', () => {
      component.signupData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'notanemail',
        password: 'password123',
        role: 'Participant',
        agreeToTerms: true,
      };

      component.onSignUp();

      httpMock.expectNone((request) =>
        request.url.includes('/api/auth/register')
      );

      expect(component.errorMessage).toContain('Email must contain @ symbol');
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

    it('Should stop before backend if password is less than 8 characters', () => {
      component.signupData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@gmail.com',
        password: 'short',
        role: 'Participant',
        agreeToTerms: true,
      };

      component.onSignUp();

      httpMock.expectNone((request) =>
        request.url.includes('/api/auth/register')
      );

      expect(component.errorMessage).toContain('Password must be at least 8 characters');
    });
  });

  // ===== SUCCESSFUL REGISTRATION TESTS =====
  describe('TC-A01: Register with valid data', () => {
    it('Should return 201, log in, and redirect on successful registration', (done: DoneFn) => {
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

      flushSuccessfulLogin('john@gmail.com', 'password123', 'Participant');

      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        expect(component.successMessage).toContain('Account successfully created');
        expect(router.navigate).toHaveBeenCalledWith(['/services']);
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

      flushSuccessfulLogin('jane@gmail.com', 'password123', 'Coordinator');

      setTimeout(() => {
        expect(component.successMessage).toBeTruthy();
        fixture.detectChanges();

        expect(fixture.debugElement.nativeElement.textContent).toContain(
          'Account successfully created'
        );
        done();
      }, 100);
    });

    it('Should redirect after automatic login on successful registration', (done: DoneFn) => {
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

      flushSuccessfulLogin('john@gmail.com', 'password123', 'Participant');

      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/services']);
        done();
      }, 100);
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

        expect(fixture.debugElement.nativeElement.textContent).toContain(
          'Email already exists'
        );
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

      flushSuccessfulLogin('john@gmail.com', 'password123', 'Participant');

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

      flushSuccessfulLogin('jane@gmail.com', 'password123', 'Coordinator');

      done();
    });
  });

  // ===== ERROR DISPLAY TESTS =====
  describe('Error Display', () => {
    it('Should display error message below "Log in" link', () => {
      component.errorMessage = 'Test error';
      fixture.detectChanges();

      expect(fixture.debugElement.nativeElement.textContent).toContain(
        'Test error'
      );
    });

    it('Should hide error message when cleared', () => {
      component.errorMessage = '';
      fixture.detectChanges();

      expect(fixture.debugElement.nativeElement.textContent).not.toContain(
        'Test error'
      );
    });

    it('Should disable signup button while loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const button = fixture.debugElement.nativeElement.querySelector(
        'button[type="submit"]'
      );
      expect(button.disabled).toBe(true);
    });

    it('Should show loading text on button while loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const button = fixture.debugElement.nativeElement.querySelector(
        'button[type="submit"]'
      );
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

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/auth/register')
      );

      req.flush(
        { status: 400, message: 'Test cleanup error' },
        { status: 400, statusText: 'Bad Request' }
      );
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
