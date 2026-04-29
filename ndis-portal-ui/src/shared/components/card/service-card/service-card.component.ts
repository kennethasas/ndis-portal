import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardUi } from '../../../../shared/ui/service-card/service-card.ui';

export interface ServiceItem {
  id: string | number;
  name: string;
  category: string;
  description: string;
  icon: string; // keep this
}

@Component({
  selector: 'app-service-card-component',
  standalone: true,
  imports: [CommonModule, CardUi],
  templateUrl: './service-card.component.html',
})
export class CardComponent {
  @Input() services: ServiceItem[] = [];
  @Input() icon: string = 'default';

  @Output() cardSelected = new EventEmitter<ServiceItem>();

  onCardClick(service: ServiceItem) {
    this.cardSelected.emit(service);
  }

  trackByServiceId(index: number, item: ServiceItem): string | number {
    return item.id;
  }
}
