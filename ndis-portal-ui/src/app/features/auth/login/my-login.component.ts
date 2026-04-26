import { Component, HostBinding } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { SlideshowComponent } from '../../../../shared/components/slideshow/slideshow.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ErrorHandlingComponent } from '../../../../shared/components/error-handling/error-handling.component';


@Component({
  selector: 'app-my-login',
  standalone: true,
  imports: [FormsModule, CommonModule, SlideshowComponent, InputComponent, ErrorHandlingComponent],
  templateUrl: './my-login.component.html',
  styleUrls: ['./my-login.component.css'],
})
export class MyLoginComponent {
  @HostBinding('style.display') display = 'block';
  @HostBinding('style.height') hostHeight = '100%';

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  errorType: 'error' | 'success' | 'warning' | 'info' = 'error';
  showError: boolean = false;
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
      this.errorType = 'error';
      this.showError = true;
      return;
    }

    this.isLoading = true;
    this.showError = false;

    // Use an ARROW FUNCTION () => {} to keep 'this' context
    setTimeout(() => {
      const mockToken = 'mock-jwt-token-' + Date.now();
      const mockUserId = '123';

      const role = this.email.includes('admin')
        ? 'Coordinator'
        : 'Participant';

      this.authService.login(
        mockToken,
        mockUserId,
        this.email,
        role
      );

      this.isLoading = false;
      this.router.navigate(['/bookings']);
    }, 500);
  }

  closeError(): void {
    this.showError = false;
  }
}