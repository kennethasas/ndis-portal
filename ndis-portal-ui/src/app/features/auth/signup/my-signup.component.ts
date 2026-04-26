import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SlideshowComponent } from '../../../../shared/components/slideshow/slideshow.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ErrorHandlingComponent } from '../../../../shared/components/error-handling/error-handling.component';

@Component({
  selector: 'app-my-signup',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    SlideshowComponent,
    InputComponent,
    ErrorHandlingComponent
  ],
  templateUrl: './my-signup.component.html',
  styleUrls: ['./my-signup.component.css']
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
    
  };

  isLoading = false;
  errorMessage = '';
  errorType: 'error' | 'success' | 'warning' | 'info' = 'error';
  showError = false;

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

  onSignUp() {
    // Validation
    if (!this.signupData.firstName || !this.signupData.lastName) {
      this.errorMessage = 'First name and last name are required';
      this.errorType = 'error';
      this.showError = true;
      return;
    }

    if (!this.signupData.role) {
      this.errorMessage = 'Please select a role';
      this.errorType = 'error';
      this.showError = true;
      return;
    }

    if (!this.signupData.email) {
      this.errorMessage = 'Email is required';
      this.errorType = 'error';
      this.showError = true;
      return;
    }

    if (!this.signupData.password || this.signupData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      this.errorType = 'error';
      this.showError = true;
      return;
    }
    
    this.isLoading = true;
    this.showError = false;
    
    console.log('User signed up:', this.signupData);
    
    setTimeout(() => {
      this.isLoading = false;
      // Logical redirect would happen here
    }, 2000);
  }

  closeError(): void {
    this.showError = false;
  }
}