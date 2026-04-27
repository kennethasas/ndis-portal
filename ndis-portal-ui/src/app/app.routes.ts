import { Routes } from '@angular/router';
import { MyLoginComponent } from './features/auth/login/my-login.component';
import { MySignupComponent } from './features/auth/signup/my-signup.component';
import { ServicesListComponent } from './features/services/services-list/services-list.page';
import { ServiceDetailComponent } from './features/services/service-detail/service-detail.page';

import { MyBookingsComponent } from './features/bookings/my-bookings/my-bookings.page';
import { BookServiceComponent } from './features/bookings/book-service/book-service.page';

import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { AuthGuard } from './/core/guards/auth.guard';

export const routes: Routes = [
  // AUTH BRANCH: Clean Layout
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'signup',
        component: MySignupComponent,
      },
      {
        path: 'login',
        component: MyLoginComponent,
      },
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full',
      },
    ],
  },

  // PROTECTED BRANCH: Uses the Dashboard layout with Sidebar/Navbar
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard], // Secures all dashboard children
    children: [
      {
        path: 'services',
        component: ServicesListComponent,
      },
      {
        path: 'services/:id', // Dynamic route for details
        component: ServiceDetailComponent,
      },
      {
        path: 'bookings',
        component: MyBookingsComponent,
      },
      {
        path: 'book-new',
        component: BookServiceComponent,
      },
    ],
  },
];
