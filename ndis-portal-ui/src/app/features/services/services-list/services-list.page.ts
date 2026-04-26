import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import { CardComponent } from '../../../../shared/components/card/card.component'; // Double check this path!
import { CategoryDropdownComponent } from '../../../../shared/components/dropdown/category/category-dropdown.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ApiService } from '../../../core/services/api-service';

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
export class ServicesListComponent implements OnInit {
  constructor(private router: Router, private api: ApiService) {} // Inject ApiService
  currentPage = 1;

  activeFilter = 'all';

  allCategory: any[] = [];

  // Mock Database (In a real app, this would be in a Service file or .NET API)
  /*
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
  */

  filteredCategory: any[] = [];

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.api.getServices().subscribe({
      next: (res: any) => {
        console.log('✅ Services Loaded:', res);
        
        // Map API response to component format
        if (res.Data && Array.isArray(res.Data)) {
          this.allCategory = res.Data.map((service: any) => ({
            id: service.id,
            service: service.name || service.title,
            category: service.category,
            description: service.description,
            date: service.created_date ? new Date(service.created_date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }) : 'N/A',
            status: service.is_active ? 'Approved' : 'Inactive',
          }));
          
          this.filteredCategory = [...this.allCategory];
          console.log('📋 Formatted Services:', this.allCategory);
        }
      },
      error: (err) => {
        console.error('❌ Error Loading Services:', err);
      }
    });
  }

  // Navigation Function
  viewServiceDetail(service: any) {
    // Use the service ID from the database
    this.router.navigate(['/services', service.id]);
  }

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
