import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-recommendation-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-recommendation-button.component.html',
})
export class AiRecommendationButtonComponent {
  /**
   * Custom click event
   */
  @Output()
  buttonClick = new EventEmitter<void>();

  /**
   * Trigger event
   */
  handleClick() {
    this.buttonClick.emit();
  }
}
