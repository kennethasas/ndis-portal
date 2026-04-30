import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarService } from '../../../app/core/services/sidebar.service';

// Icons
import { HomeIconComponent } from '../../components/icons/svg-icons/home-icon';
import { BookIconComponent } from '../../components/icons/svg-icons/book-icon';
import { ServiceIconComponent } from '../../components/icons/svg-icons/service-icon';

export interface NavItem {
  label: string;
  path: string;
  icon: 'home' | 'services' | 'bookings';
}

@Component({
  selector: 'app-sidebar-ui',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HomeIconComponent,
    BookIconComponent,
    ServiceIconComponent,
  ],
  templateUrl: './sidebar.ui.html',
})
export class SidebarUi implements OnInit, OnDestroy {
  @Input() navItems: NavItem[] = [];
  @Input() subText: string = 'Enterprise';

  /** Sidebar state from service */
  isCollapsed = false;

  /** Subscription cleanup container */
  private sub = new Subscription();

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    /**
     * Subscribe to global sidebar state
     */
    console.log('SidebarUi navItems:', this.navItems);

    this.sub.add(
      this.sidebarService.collapsed$.subscribe((state) => {
        this.isCollapsed = state;
      }),
    );
  }

  /**
   * Toggle sidebar via service
   */
  toggleCollapse(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.sidebarService.toggle();
  }

  /**
   * Called when clicking navigation item
   * Ensures mobile auto-close behavior only when needed
   */
  onNavClick(): void {
    this.sidebarService.autoCloseOnMobile();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
