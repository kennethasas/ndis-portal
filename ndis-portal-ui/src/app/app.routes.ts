import { Routes } from '@angular/router';
import { MyBookingComponent } from './features/bookings/my-bookings.component';

export const routes: Routes = [
  {
    path: 'bookings',
    component: MyBookingComponent
  },
  // Redirect empty path to bookings
  {
    path: '',
    redirectTo: 'bookings',
    pathMatch: 'full'
  }
];