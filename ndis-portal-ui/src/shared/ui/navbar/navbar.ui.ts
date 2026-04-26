import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeIconComponent } from '../../components/icons/svg-icons/home-icon';
import { SideBarIconComponent } from '../../components/icons/svg-icons/sidebar-icon';

import { SidebarService } from '../../../app/core/services/sidebar.service';
@Component({
  selector: 'app-navbar-ui',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HomeIconComponent,
    SideBarIconComponent,
  ],
  templateUrl: './navbar.ui.html',
  host: { class: 'block w-full' },
})
export class NavbarUiComponent {
  @Input() breadcrumbs: Array<{ label: string; url: string }> = [];

  constructor(private sidebarService: SidebarService) {}

  /**
   * Triggers the global sidebar toggle state
   */
  toggleSidebar(): void {
    this.sidebarService.toggle();
  }
}
