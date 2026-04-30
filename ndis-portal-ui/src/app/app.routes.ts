import { Routes } from '@angular/router';
import { AuthGuard } from './/core/guards/auth.guard';

import { MyLoginComponent } from './features/auth/login/my-login.component';
import { MySignupComponent } from './features/auth/signup/my-signup.component';
import { ServicesListComponent } from './features/services/services-list/services-list.page';
import { ServiceDetailComponent } from './features/services/service-detail/service-detail.page';

import { MyBookingsComponent } from './features/bookings/my-bookings/my-bookings.page';
import { BookServiceComponent } from './features/bookings/book-service/book-service.page';

import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { DashboardComponent } from './features/coordinator/dashboard/dashboard.page';
import { ManageServicesComponent } from './features/coordinator/manage-services/manage-services.page';
import { AllBookingsComponent } from './features/coordinator/all-bookings/all-bookings.page';

import  { ForbiddenComponent } from '../shared/components/error/forbidden/forbidden.component'

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
    canActivateChild: [AuthGuard], // Secures all dashboard children
    children: [
      // Coordinator
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { role: 'coordinator' },
      },

      {
        path: 'dashboard/services',
        component: ManageServicesComponent,
        data: { role: 'coordinator' },
      },

      {
        path: 'dashboard/bookings',
        component: AllBookingsComponent,
        data: { role: 'coordinator' },
      },

      {
        path: 'services',
        component: ServicesListComponent,
        data: { role: 'participant' },
      },
      {
        path: 'services/:id', // Dynamic route for details
        component: ServiceDetailComponent,
        data: { role: 'participant' },
      },
      {
        path: 'bookings',
        component: MyBookingsComponent,
        data: { role: 'participant' },
      },
      {
        path: 'book-new',
        component: BookServiceComponent,
        data: { role: 'participant' },
      },
    ],
  },

  {
    path: 'forbidden',
    component: ForbiddenComponent,
    title: '403 - Access Denied',
  },

  // Optional: Redirect unknown paths to a 404 or your 403
  { path: '**', redirectTo: 'forbidden' },
];