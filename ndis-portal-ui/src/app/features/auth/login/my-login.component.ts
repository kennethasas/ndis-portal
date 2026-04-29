import { Component, HostBinding } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginRequest, LoginResponse } from '../../../core/services/auth.service';
import { SlideshowComponent } from '../../../../shared/components/slideshow/slideshow.component';
import { InputComponent } from '../../../../shared/components/input/input.component';

@Component({
  selector: 'app-my-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, SlideshowComponent, InputComponent],
  templateUrl: './my-login.component.html',
  styleUrls: ['./my-login.component.css'],
})
export class MyLoginComponent {
  @HostBinding('style.display') display = 'block';
  @HostBinding('style.height') hostHeight = '100%';

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  // Slideshow images - reusable for login and signup
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

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onLogin() {
    // Reset error message
    this.errorMessage = '';

    // Validate inputs
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required';
      return;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(this.email.trim())) {
      this.errorMessage = 'Please enter a valid Gmail email address';
      return;
    }

    // Validate password length
    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters';
      return;
    }

    this.isLoading = true;

    const loginData: LoginRequest = {
      email: this.email,
      password: this.password
    };

    this.authService.loginApi(loginData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('Full response:', JSON.stringify(response, null, 2));
        console.log('response.Data:', response.Data);
        console.log('response.Success:', response.Success);

        // Handle wrapped response format: { Success: true, Data: { token, user, status, message } }
        const data = response.Data || response;
        console.log('Extracted data:', data);
        console.log('data.token:', data?.token);
        console.log('data.status:', data?.status);
        console.log('data.user:', data?.user);

        const status = data?.status || (response.Success ? 200 : 400);
        const token = data?.token;
        const user = data?.user;
        const message = data?.message || response.Message;

        if (status === 200 && token) {
          const userId = user?.id?.toString() || '';
          const role = user?.role || '';
          console.log('Login SUCCESS. userId:', userId, 'role:', role);

          this.authService.login(token, userId, this.email, role);
          console.log('authService.login() called');

          // Redirect based on role
          const redirectPath = role?.toLowerCase() === 'coordinator' ? '/dashboard' : '/services';
          console.log('Redirecting to:', redirectPath);

          this.router.navigate([redirectPath]).then(() => {
            console.log('Navigation to', redirectPath, 'completed');
          }).catch(err => {
            console.error('Navigation failed:', err);
          });
        } else {
          console.log('Login failed - status:', status, 'token:', token);
          this.errorMessage = message || 'Login failed. Please try again.';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.errorMessage = this.getSpecificErrorMessage(error);
      }
    });
  }

  private getSpecificErrorMessage(error: any): string {
    // Check if it's an HTTP error response
    if (error.status) {
      const status = error.status;
      const errorBody = error.error;

      // Try to extract message from error body
      const apiMessage = errorBody?.message || errorBody?.Message || errorBody?.error;

      switch (status) {
        case 400:
          return apiMessage || 'Invalid email or password format.';
        case 401:
          return 'Incorrect email or password. Please verify your credentials and try again.';
        case 404:
          return apiMessage || 'User account not found.';
        case 500:
          return apiMessage || 'Server error. Please try again later.';
        case 503:
          return 'Service temporarily unavailable. Please try again later.';
        case 0:
          return 'Network error. Please check your connection.';
        default:
          return apiMessage || 'Login failed. Please try again.';
      }
    }

    // Fallback to error message if available
    return error.message || 'Invalid email or password.';
  }
}