import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiRecommendationButtonComponent } from '../ai-recommendation-button/ai-recommendation-button.component';
import { AiRecommendationPanelComponent } from '../ai-recommendation-panel/ai-recommendation-panel.component';

@Component({
  selector: 'app-ai-recommendation-container',
  standalone: true,
  imports: [CommonModule, FormsModule, AiRecommendationButtonComponent, AiRecommendationPanelComponent],
  templateUrl: './ai-recommendation-container.component.html',
})
export class AiRecommendationContainerComponent {
  isOpen = false;
  showRecommendationButton = true;

  toggleRecommendationPanel() {
    if (!this.showRecommendationButton) {
      this.isOpen = false;
      return;
    }

    this.isOpen = !this.isOpen;
  }

  closeRecommendationPanel() {
    this.isOpen = false;
  }
}
