import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, NavItem } from '../../ui/sidebar/sidebar.ui';

@Component({
  selector: 'app-sidebar-component',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <app-sidebar-ui
      [navItems]="participantLinks"
      subText="Participant Portal"
    ></app-sidebar-ui>
  `,
  host: { class: 'block h-full flex-none transition-all duration-300' },
})
export class ParticipantSidebarComponent {
  /**
   * Navigation links for participant role
   */
  participantLinks: NavItem[] = [
    { label: 'Services', path: '/services', icon: 'services' },
    { label: 'My Bookings', path: '/bookings', icon: 'bookings' },
  ];
}
