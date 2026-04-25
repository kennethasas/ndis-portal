import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { ParticipantSidebarComponent } from '../shared/components/sidebar/participant-sidebar.component';
import { AuthService } from './core/services/auth.service';

import { MyBookingsComponent } from './features/bookings/my-bookings/my-bookings.page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ParticipantSidebarComponent,
    NavbarComponent,
    MyBookingsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'NDIS Portal';

  constructor(public authService: AuthService) {}
}
