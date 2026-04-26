// File: src/app/features/layout/main-layout.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ParticipantSidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ParticipantSidebarComponent,
    NavbarComponent,
  ],
  templateUrl: './main-layout.component.html',
  // This ensures the layout component itself fills the screen
  host: { class: 'block h-screen w-full' },
})
export class MainLayoutComponent {}