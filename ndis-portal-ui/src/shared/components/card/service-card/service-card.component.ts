import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardUi } from '../../../../shared/ui/service-card/service-card.ui';
import { AiRecommendationCardComponent } from '../../../../shared/components/ai-recommendation/ai-recommendation-card/ai-recommendation-card.component';

export interface ServiceItem {
  id: string | number;
  name: string;
  category: string;
  description: string;
  icon: string; 
}

@Component({
  selector: 'app-service-card-component',
  standalone: true,
  imports: [CommonModule, CardUi, AiRecommendationCardComponent],
  templateUrl: './service-card.component.html',
})
export class CardComponent {
  @Input() services: ServiceItem[] = [];
  @Output() cardSelected = new EventEmitter<ServiceItem>();
  @Output() aiRecommendationSelected = new EventEmitter<void>();

  onCardClick(service: ServiceItem) {
    this.cardSelected.emit(service);
  }

  onAiRecommendationClick() {
    this.aiRecommendationSelected.emit();
  }

  trackByServiceId(index: number, item: ServiceItem) {
    return item.id;
  }
}