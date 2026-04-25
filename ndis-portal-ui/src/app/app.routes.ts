import { Routes } from '@angular/router';
import { MyLoginComponent } from './features/auth/login/my-login.component';
import { MySignupComponent } from './features/auth/signup/my-signup.component';
import { ServicesListComponent } from './features/services/services-list/services-list.page';
import { ServiceDetailPage } from './features/services/service-detail/service-detail.page';

import { MyBookingsComponent } from './features/bookings/my-bookings/my-bookings.page';
import { BookServiceComponent } from './features/bookings/book-service/book-service.page';

export const routes: Routes = [
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
    redirectTo: '/signup',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  // Wildcard route for 404
  {
    path: '**',
    redirectTo: '/login',
  },
  {
    path: 'services',
    component: ServicesListComponent,
  },
  {
    path: 'services/:id', // Dynamic route for details
    component: ServiceDetailPage,
  },
  {
    path: 'bookings',
    component: MyBookingsComponent,
  },
  {
    path: 'book-new',
    component: BookServiceComponent,
  },
];
