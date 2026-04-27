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
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

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
          console.log('Login SUCCESS - navigating to /services. userId:', userId, 'role:', role);

          this.authService.login(token, userId, this.email, role);
          console.log('authService.login() called');
          this.router.navigate(['/services']).then(() => {
            console.log('Navigation to /services completed');
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
        this.errorMessage = error.message || 'Invalid email or password.';
      }
    });
  }
}