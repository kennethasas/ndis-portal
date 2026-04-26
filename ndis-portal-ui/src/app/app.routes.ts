import { Routes } from '@angular/router';
import { MyLoginComponent } from './features/auth/login/my-login.component';
import { MySignupComponent } from './features/auth/signup/my-signup.component';
import { ServicesListComponent } from './features/services/services-list/services-list.page';
import { ServiceDetailPage } from './features/services/service-detail/service-detail.page';

import { MyBookingsComponent } from './features/bookings/my-bookings/my-bookings.page';
import { BookServiceComponent } from './features/bookings/book-service/book-service.page';

import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { AuthGuard } from './/core/guards/auth.guard';
import { RoleGuard } from '@core/guards/role.guard';

export const routes: Routes = [

  // 🔒 PROTECTED ROUTES FIRST
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'services',
        component: ServicesListComponent,
      },
      {
        path: 'services/:id',
        component: ServiceDetailPage,
      },
      {
        path: 'bookings',
        component: MyBookingsComponent,
        canActivate: [RoleGuard],
        data: { role: 'Participant' }
      },
      {
        path: 'book-new',
        component: BookServiceComponent,
      },
    ],
  },

  // 🔐 AUTH ROUTES SECOND
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
        redirectTo: 'login',
        pathMatch: 'full',
      }
    ],
  },

  // 🌐 GLOBAL WILDCARD LAST
  {
    path: '**',
    redirectTo: '/login',
  },
];