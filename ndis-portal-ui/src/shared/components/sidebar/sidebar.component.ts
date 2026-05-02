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
    {
      label: 'All Bookings',
      path: '/dashboard/bookings',
      icon: 'bookings',
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
      label: 'Book a Service',
      path: '/participant/book-service',
      icon: 'bookings',
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
    console.log('Available links:', this.allLinks.map(l => ({ label: l.label, role: l.role })));
    
    if (!userRole) {
      console.log('No user role found, returning empty links');
      return [];
    }
    
    // Case-insensitive comparison with better logging
    const filtered = this.allLinks.filter((link) => {
      const matches = link.role.toLowerCase() === userRole.toLowerCase();
      console.log(`Link "${link.label}" (role: ${link.role}) vs User role: ${userRole} -> ${matches}`);
      return matches;
    });
    
    // Remove duplicates based on path
    const uniqueLinks = filtered.filter((link, index, self) =>
      index === self.findIndex((l) => l.path === link.path)
    );
    
    console.log('Filtered links:', filtered.map(l => l.label));
    console.log('Unique links:', uniqueLinks.map(l => l.label));
    return uniqueLinks;
  }

  /**
   * Optional: Makes the subText dynamic too
   */
  get currentSubText(): string {
    const role = this.authService.getRole();
    return role?.toLowerCase() === 'coordinator' ? 'Coordinator Portal' : 'Participant Portal';
  }
}
