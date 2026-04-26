import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarUiComponent } from '../../ui/navbar/navbar.ui';

@Component({
  selector: 'app-navbar-component',
  standalone: true,
  imports: [CommonModule, NavbarUiComponent],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  breadcrumbs: Array<{ label: string; url: string }> = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.generateBreadcrumbs();
      });
    this.generateBreadcrumbs();
  }

  private generateBreadcrumbs() {
    const path = this.router.url.split('/').filter((p) => p);
    this.breadcrumbs = path.map((segment, index) => ({
      label:
        segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
      url: '/' + path.slice(0, index + 1).join('/'),
    }));
  }
}
