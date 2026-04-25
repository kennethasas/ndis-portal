import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import { CardComponent } from '../../../../shared/components/card/card.component'; // Double check this path!
import { CategoryDropdownComponent } from '../../../../shared/components/dropdown/category/category-dropdown.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent, // This must be here to use <app-card-component>
    CategoryDropdownComponent,
    PaginationComponent,
  ],
  templateUrl: './services-list.page.html',
  styleUrl: './services-list.page.css',
})
export class ServicesListComponent {
  constructor(private router: Router) {} // Inject Router
  currentPage = 1;

  activeFilter = 'all';

  allCategory = [
    {
      id: 'personal-hygiene',
      service: 'Personal Hygiene Assistance', // Matches card title
      category: 'Daily Personal Activities', // Matches card tag
      description:
        'Comprehensive building upkeep including HVAC, electrical, and plumbing inspections.', // Match image text
      date: 'Apr 21, 2026',
      status: 'Approved',
    },

    {
      id: 'personal-hygiene',
      service: 'Personal Hygiene Assistance', // Matches card title
      category: 'Daily Personal Activities', // Matches card tag
      description:
        'Comprehensive building upkeep including HVAC, electrical, and plumbing inspections.', // Match image text
      date: 'Apr 21, 2026',
      status: 'Approved',
    },
  ];

  // Navigation Function
  viewServiceDetail(service: any) {
    // If your service data has an 'id' or you can use the service name as a slug
    const serviceId =
      service.id || service.service.toLowerCase().replace(/ /g, '-');
    this.router.navigate(['/services', serviceId]);
  }

  filteredCategory = [...this.allCategory];

  handleCategoryFilter(category: string) {
    this.activeFilter = category;
    if (category === 'all') {
      this.filteredCategory = [...this.allCategory];
    } else {
      this.filteredCategory = this.allCategory.filter(
        (b) => b.category.toLowerCase() === category.toLowerCase(),
      );
    }
  }

  handlePageChange(page: number) {
    this.currentPage = page;
    // Call your API here to fetch data for the new page
  }
}
