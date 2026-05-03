import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import { SlideshowComponent } from '../../../../shared/components/slideshow/slideshow.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import {
  AuthService,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../../../core/services/auth.service';
import { PasswordFieldComponent } from "../../../../shared/components/password-field/password-field.component";
import { RoleDropdownComponent } from '../../../../shared/components/dropdown/role/role-dropdown.component';

import { UnViewIconComponent } from '../../../../shared/components/icons/svg-icons/unview-icon';
import { ViewIconComponent } from '../../../../shared/components/icons/svg-icons/view-icon';
@Component({
  selector: 'app-my-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SlideshowComponent,
    InputComponent,
    RoleDropdownComponent,
    PasswordFieldComponent,
    ViewIconComponent,
    UnViewIconComponent,
  ],
  templateUrl: './my-signup.component.html',
  //styleUrls: ['./my-signup.component.css']
})
export class MySignupComponent {
  @HostBinding('style.display') display = 'block';
  @HostBinding('style.height') hostHeight = '100%';

  signupData = {
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    password: '',
    agreeToTerms: false,
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  slideImages = [
    'assets/imagesSlideshow/2.jpg',
    'assets/imagesSlideshow/3.jpg',
    'assets/imagesSlideshow/4.jpg',
    'assets/imagesSlideshow/5.jpg',
    'assets/imagesSlideshow/6.jpg',
    'assets/imagesSlideshow/7.jpg',
    'assets/imagesSlideshow/8.jpg',
    'assets/imagesSlideshow/9.jpg',
    'assets/imagesSlideshow/10.jpg',
    'assets/imagesSlideshow/11.jpg',
    'assets/imagesSlideshow/12.jpg',
    'assets/imagesSlideshow/13.jpg',
    'assets/imagesSlideshow/14.jpg',
    'assets/imagesSlideshow/15.jpg',
    'assets/imagesSlideshow/16.jpg',
    'assets/imagesSlideshow/17.jpg',
    'assets/imagesSlideshow/18.jpg',
  ];

  // showPassword = false;

  // togglePassword() {
  //   this.showPassword = !this.showPassword;
  // }

  onSignUp() {
    if (!this.signupData.agreeToTerms) {
      this.errorMessage = 'You must agree to the terms.';
      return;
    }

    if (!this.signupData.firstName || !this.signupData.lastName) {
      this.errorMessage = 'First name and last name are required.';
      return;
    }

    const trimmedEmail = this.signupData.email.trim();

    if (!trimmedEmail) {
      this.errorMessage = 'Email is required.';
      return;
    }

    if (trimmedEmail.length > 50) {
      this.errorMessage = 'Email must be 50 characters or less';
      return;
    }

    if (!trimmedEmail.includes('@')) {
      this.errorMessage = 'Email must contain @ symbol';
      return;
    }

    if (!trimmedEmail.toLowerCase().endsWith('.com')) {
      this.errorMessage = 'Email must end with .com';
      return;
    }

    const parts = trimmedEmail.split('@');
    if (parts.length !== 2) {
      this.errorMessage = 'Email must contain exactly one @ symbol';
      return;
    }

    const domain = parts[1].toLowerCase();
    if (domain !== parts[1]) {
      this.errorMessage = 'Domain part of email must be lowercase';
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.com$/;
    if (!emailRegex.test(trimmedEmail)) {
      this.errorMessage =
        'Please enter a valid email address (e.g., user@domain.com)';
      return;
    }

    if (!this.signupData.password || this.signupData.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }

    if (!this.signupData.role) {
      this.errorMessage = 'Please select a role.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const registerData: RegisterRequest = {
      fullName: `${this.signupData.firstName} ${this.signupData.lastName}`,
      email: trimmedEmail,
      password: this.signupData.password,
      role:
        this.signupData.role.charAt(0).toUpperCase() +
        this.signupData.role.slice(1),
    };

    const loginData: LoginRequest = {
      email: trimmedEmail,
      password: this.signupData.password,
    };

    this.authService.register(registerData).pipe(
      switchMap((response: RegisterResponse) => {
        this.successMessage =
          response.message || 'Account created successfully!';

        return this.authService.loginApi(loginData);
      }),
    ).subscribe({
      next: (response: LoginResponse | any) => {
        this.isLoading = false;

        const data = response.Data || response;
        const status = data?.status || (response.Success ? 200 : 400);
        const token = data?.token;
        const user = data?.user;
        const message = data?.message || response.Message;

        if (status === 200 && token) {
          const userId = user?.id?.toString() || '';
          const role = user?.role || registerData.role;

          this.authService.login(token, userId, trimmedEmail, role);

          const redirectPath =
            role?.toLowerCase() === 'coordinator' ? '/dashboard' : '/services';

          this.router.navigate([redirectPath]);
          return;
        }

        this.errorMessage =
          message ||
          'Account created, but automatic login failed. Please log in manually.';
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = this.successMessage
          ? 'Account created, but automatic login failed. Please log in manually.'
          : this.getSpecificErrorMessage(error);
      },
    });
  }

  private getSpecificErrorMessage(error: any): string {
    // Check if it's an HTTP error response
    if (error.status) {
      const status = error.status;
      const errorBody = error.error;

      // Try to extract message from error body
      const apiMessage =
        errorBody?.message || errorBody?.Message || errorBody?.error;

      switch (status) {
        case 400:
          return (
            apiMessage ||
            'Invalid input. Please check all fields and try again.'
          );
        case 409:
          return (
            apiMessage ||
            'Email is already registered. Please use a different email or log in.'
          );
        case 422:
          return (
            apiMessage || 'Validation error. Please check your information.'
          );
        case 500:
          return apiMessage || 'Server error. Please try again later.';
        case 503:
          return 'Service temporarily unavailable. Please try again later.';
        case 0:
          return 'Network error. Please check your connection.';
        default:
          return apiMessage || 'Registration failed. Please try again.';
      }
    }

    // Fallback to error message if available
    return error.message || 'Registration failed. Please try again.';
  }
}
