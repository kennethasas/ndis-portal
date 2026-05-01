import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-recommendation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-recommendation-card.component.html',
})
export class AiRecommendationCardComponent {
  @Output()
  cardSelected = new EventEmitter<void>();

  onCardClick() {
    this.cardSelected.emit();
  }
}
