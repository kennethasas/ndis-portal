
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../../app/core/services/sidebar.service';

@Component({
  selector: 'app-navbar-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.ui.html',
})
export class NavbarUiComponent {
  constructor(private sidebarService: SidebarService) {}

  /**
   * This is the method the HTML is looking for.
   * It tells the global service to flip the collapsed state.
   */
  toggle(): void {
    this.sidebarService.toggle();
  }
}