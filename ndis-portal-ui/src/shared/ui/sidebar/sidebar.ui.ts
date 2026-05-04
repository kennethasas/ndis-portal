import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarService } from '../../../app/core/services/sidebar.service';
import { AuthService } from '../../../app/core/services/auth.service';
import { Router } from '@angular/router';
import { HomeIconComponent } from '../../components/icons/svg-icons/home-icon';
import { BookIconComponent } from '../../components/icons/svg-icons/book-icon';
import { ServiceIconComponent } from '../../components/icons/svg-icons/service-icon';
import { SideBarIconComponent } from '../../components/icons/svg-icons/sidebar-icon';
import { DashboardIconComponent } from '../../components/icons/svg-icons/dashboard-icon';
import { LogoutIconComponent } from '../../components/icons/svg-icons/logout-icon';
import { NewBookIconComponent } from '../../components/icons/svg-icons/book-new-icon';
import { DialogUi } from '../dialog/dialog.ui';
export interface NavItem {
  label: string;
  path: string;
  icon: 'home' | 'services' | 'bookings' | 'dashboard' | 'book-new';
}

@Component({
  selector: 'app-sidebar-ui',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HomeIconComponent,
    ServiceIconComponent,
    BookIconComponent,
    SideBarIconComponent,
    DashboardIconComponent,
    LogoutIconComponent,
    DialogUi,
    NewBookIconComponent,
  ],
  templateUrl: './sidebar.ui.html',
})
export class SidebarUi implements OnInit, OnDestroy {
  @Input() navItems: NavItem[] = [];
  isCollapsed = false;
  isMobile = false;
  private sub = new Subscription();

  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService,
    private router: Router,
  ) {}

  logout() {
    this.authService.logout(); // clear token/session
    this.router.navigate(['/login']); // redirect
  }
  toggle(): void {
    this.sidebarService.toggle(); // Both call the exact same service method
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;

    // Only react when switching between mobile ↔ desktop
    if (this.isMobile && !wasMobile) {
      this.sidebarService.setCollapsed(true); // entering mobile
    }

    if (!this.isMobile && wasMobile) {
      // leaving mobile → restore saved desktop state
      const saved = localStorage.getItem('sidebar-collapsed');
      this.sidebarService.setCollapsed(saved ? JSON.parse(saved) : false);
    }
  }
  ngOnInit() {
    this.checkScreenSize();
    this.sub.add(
      this.sidebarService.collapsed$.subscribe(
        (state) => (this.isCollapsed = state),
      ),
    );
  }

  closeSidebar() {
    this.sidebarService.setCollapsed(true);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  // Logout method
  isLogoutDialogOpen = false;

  openLogoutDialog() {
    this.isLogoutDialogOpen = true;
  }

  closeLogoutDialog() {
    this.isLogoutDialogOpen = false;
  }

  confirmLogout() {
    this.isLogoutDialogOpen = false;
    this.logout(); // your existing logout logic
  }
}
