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

import { HomeIconComponent } from '../../components/icons/svg-icons/home-icon';
import { BookIconComponent } from '../../components/icons/svg-icons/book-icon';
import { ServiceIconComponent } from '../../components/icons/svg-icons/service-icon';
import { SideBarIconComponent } from '../../components/icons/svg-icons/sidebar-icon';
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
    ServiceIconComponent,
    BookIconComponent,
    SideBarIconComponent,
  ],
  templateUrl: './sidebar.ui.html',
})
export class SidebarUi implements OnInit, OnDestroy {
  @Input() navItems: NavItem[] = [];
  isCollapsed = false;
  isMobile = false;
  private sub = new Subscription();

  constructor(private sidebarService: SidebarService) {}

  toggle(): void {
    this.sidebarService.toggle(); // Both call the exact same service method
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile && !this.isCollapsed) {
      this.sidebarService.setCollapsed(true);
    }
  }

  ngOnInit() {
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
}
