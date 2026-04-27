import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardUi } from '../../../../shared/ui/service-card/service-card.ui';

// 1. Smart UI: Define the data structure clearly
export interface ServiceItem {
  id: string | number;
  name: string;
  category: string;
  description: string;
}

@Component({
  selector: 'app-service-card-component',
  standalone: true,
  imports: [CommonModule, CardUi],
  templateUrl: './service-card.component.html',
  // Removed styleUrls because we are using Tailwind utility classes
})
export class CardComponent {
  /**
   * List of services passed from the parent page/container.
   * Fields required: id, name, category, description
   */
  @Input() services: ServiceItem[] = [];

  /**
   * Notifies the parent when a specific service card is clicked.
   * Emits the full ServiceItem object including the ID.
   */
  @Output() cardSelected = new EventEmitter<ServiceItem>();

  onCardClick(service: ServiceItem) {
    // 2. Smart UI: Bubble up the data so the parent can handle navigation or logic
    this.cardSelected.emit(service);
  }

  /**
   * Performance optimization for Angular's rendering engine
   */
  trackByServiceId(index: number, item: ServiceItem): string | number {
    return item.id;
  }
}
