// services-list.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardComponent, ServiceItem } from '../../../../shared/components/card/service-card/service-card.component';
import { CategoryDropdownComponent } from '../../../../shared/components/dropdown/category/category-dropdown.component';
import { ApiService } from '../../../core/services/api-service';


@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [CommonModule, CardComponent, CategoryDropdownComponent],
  templateUrl: './services-list.page.html',
})
export class ServicesListComponent implements OnInit {
  allServices: ServiceItem[] = [];
  filteredServices: ServiceItem[] = [];

  // FIXED: Ensure keys here match the normalized output of your API strings
  private categoryIconMap: { [key: string]: string } = {
    'therapy-supports': 'therapy',
    'community-access': 'community',
    'respite-care': 'care',
    'support-coordination': 'support',
    'daily-personal-activities': 'activity',
  };

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
        if (res?.Data && Array.isArray(res.Data)) {
          this.allServices = res.Data.map((service: any) => {
            // 1. Get raw name or fallback
            const categoryName = service.categoryName || 'support';

            // 2. Normalize: Lowercase and replace spaces/special chars with dashes
            const normalizedCategory = categoryName
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, '-'); // More robust regex

            return {
              id: service.id,
              name: service.name || service.title,
              category: categoryName,
              description: service.description,
              // 3. Match against map, fallback to 'default'
              icon: this.categoryIconMap[normalizedCategory] || 'default',
            };
          });
          this.filteredServices = [...this.allServices];
        }
      },
    });
  }

  handleCategoryFilter(category: string) {
    const target = category.toLowerCase().trim();
    this.filteredServices =
      target === 'all'
        ? [...this.allServices]
        : this.allServices.filter(
            (s) =>
              s.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === target,
          );
  }

  onCardClick(service: ServiceItem) {
    this.router.navigate(['/services', service.id]);
  }
}