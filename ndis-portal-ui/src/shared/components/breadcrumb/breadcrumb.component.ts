import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Array<{ label: string; url: string }> = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.generateBreadcrumbs();
      });
    this.generateBreadcrumbs(); // Initial call
  }

  private generateBreadcrumbs() {
    const path = this.router.url.split('/').filter((p) => p);
    this.breadcrumbs = path.map((segment, index) => {
      return {
        label:
          segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
        url: '/' + path.slice(0, index + 1).join('/'),
      };
    });
  }
}
