import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { ParticipantSidebarComponent } from '../../../../shared/components/sidebar/participant-sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ParticipantSidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {}