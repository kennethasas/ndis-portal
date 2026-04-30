import { Component, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { SidebarUi, NavItem } from '../../ui/sidebar/sidebar.ui';
import { AuthService } from '../../../app/core/services/auth.service';
@Component({
  selector: 'app-sidebar-component',
  standalone: true,
  imports: [CommonModule, SidebarUi],
  template: `
    <app-sidebar-ui
      [navItems]="filteredLinks"
      [subText]="currentSubText"
    ></app-sidebar-ui>
  `,
  host: { class: 'block h-full flex-none transition-all duration-300' },
})
export class SidebarComponent {
  constructor(private authService: AuthService) {}
  /**
   * Navigation links for participant role
   */
  private allLinks: (NavItem & { role: string })[] = [
    // Coordinator Links
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'services',
      role: 'Coordinator',
    },
    {
      label: 'Manage Services',
      path: '/dashboard/services',
      icon: 'services',
      role: 'Coordinator',
    },

    // Participant Links
    {
      label: 'Services',
      path: '/services',
      icon: 'services',
      role: 'Participant',
    },
    {
      label: 'My Bookings',
      path: '/bookings',
      icon: 'bookings',
      role: 'Participant',
    },
  ];

  get filteredLinks(): NavItem[] {
    const userRole = this.authService.getRole();
    console.log('Current User Role from Storage:', userRole); // CHECK THIS IN THE BROWSER CONSOLE
    // Case-insensitive comparison
    return this.allLinks.filter((link) =>
      userRole && link.role.toLowerCase() === userRole.toLowerCase()
    );
  }

  /**
   * Optional: Makes the subText dynamic too
   */
  get currentSubText(): string {
    const role = this.authService.getRole();
    return role?.toLowerCase() === 'coordinator' ? 'Coordinator Portal' : 'Participant Portal';
  }
}
