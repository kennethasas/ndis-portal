import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

interface ServiceCategory {
  id: number;
  name: string;
}

interface UserNeed {
  categoryId: number;
  categoryName: string;
  selected: boolean;
}

@Component({
  selector: 'app-ai-recommendation-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],

  animations: [
    trigger('panelAnimation', [
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'scale(0.7) translateY(20px)',
        }),
      ),

      state(
        'open',
        style({
          opacity: 1,
          transform: 'scale(1) translateY(0)',
        }),
      ),

      transition('closed => open', [animate('180ms ease-out')]),
      transition('open => closed', [animate('150ms ease-in')]),
    ]),
  ],

  templateUrl: './ai-recommendation-panel.component.html',
})
export class AiRecommendationPanelComponent implements OnInit {
  @Output()
  close = new EventEmitter<void>();

  private http = inject(HttpClient);

  state: 'open' | 'closed' = 'open';

  // Form data for the recommendation questions - dynamically loaded
  categories: ServiceCategory[] = [];
  userNeeds: UserNeed[] = [];
  otherNeeds = '';
  isLoadingCategories = true;
  categoriesError = false;

  isSubmitting = false;
  recommendations: any[] = [];

  ngOnInit() {
    this.loadCategories();
  }

  private loadCategories() {
    this.isLoadingCategories = true;
    this.categoriesError = false;

    this.http.get<any>(`${environment.apiUrl}/service-categories`).subscribe({
      next: (response) => {
        const categories = response?.Data || response || [];
        this.categories = categories.map((c: any) => ({
          id: c.id || c.Id,
          name: c.name || c.Name
        }));

        // Initialize userNeeds based on loaded categories
        this.userNeeds = this.categories.map(cat => ({
          categoryId: cat.id,
          categoryName: cat.name,
          selected: false
        }));

        this.isLoadingCategories = false;
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
        this.categoriesError = true;
        this.isLoadingCategories = false;
      }
    });
  }

  onSubmitRecommendation() {
    this.isSubmitting = true;

    const selectedCategories = this.userNeeds
      .filter(need => need.selected)
      .map(need => need.categoryName);

    const requestData = {
      categories: selectedCategories,
      otherNeeds: this.otherNeeds
    };

    console.log('Submitting recommendation request:', requestData);

    // TODO: Implement actual API call to get AI recommendations
    setTimeout(() => {
      this.isSubmitting = false;
    }, 2000);
  }

  onClose() {
    this.state = 'closed';
    setTimeout(() => {
      this.close.emit();
    }, 150);
  }

  retryLoadCategories() {
    this.loadCategories();
  }
}
