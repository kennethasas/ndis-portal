import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  CardComponent,
  ServiceItem,
} from '../../../../shared/components/card/service-card/service-card.component';
import { CategoryDropdownComponent } from '../../../../shared/components/dropdown/category/category-dropdown.component';
import { ApiService } from '../../../core/services/api-service';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [CommonModule, CardComponent, CategoryDropdownComponent],
  templateUrl: './services-list.page.html',
})
export class ServicesListComponent implements OnInit {
  currentPage = 1;
  activeFilter = 'all';
  allCategory: ServiceItem[] = [];
  filteredCategory: ServiceItem[] = [];

  constructor(
    private router: Router,
    private api: ApiService,
  ) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.api.getServices().subscribe({
      next: (res: any) => {
        if (res.Data && Array.isArray(res.Data)) {
          this.allCategory = res.Data.map((service: any) => {
            const categoryName = service.categoryName || 'support';

            const normalizedCategory = categoryName
              .toLowerCase()
              .replace(/\s+/g, '-');

            return {
              id: service.id,
              name: service.name || service.title,
              category: categoryName,
              description: service.description,

              icon: this.categoryIconMap[normalizedCategory] || 'default',
            };
          });

          this.filteredCategory = [...this.allCategory];
        }
      },
      error: (err) => console.error('Error:', err),
    });
  }

  viewServiceDetail(service: ServiceItem) {
    this.router.navigate(['/services', service.id]);
  }

  handleCategoryFilter(category: string) {
    this.activeFilter = category;
    this.filteredCategory =
      category === 'all'
        ? [...this.allCategory]
        : this.allCategory.filter(
            (s) => s.category.toLowerCase().replace(/\s+/g, '-') === category,
          );
  }

  handlePageChange(page: number) {
    this.currentPage = page;
    // Logic for API pagination would go here
  }
  private categoryIconMap: { [key: string]: string } = {
    healthcare: 'heart',
    transport: 'car',
    therapy: 'brain',
    housing: 'home',
    education: 'book',
    employment: 'briefcase',
    support: 'users',
  };
}
