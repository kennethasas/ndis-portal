import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

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
export class AiRecommendationPanelComponent {
  @Output()
  close = new EventEmitter<void>();

  state: 'open' | 'closed' = 'open';
  
  // Form data for the recommendation questions
  userNeeds = {
    dailyActivities: false,
    communityAccess: false,
    therapySupports: false,
    supportCoordination: false,
    respiteCare: false,
    otherNeeds: ''
  };

  isSubmitting = false;
  recommendations: any[] = [];

  onSubmitRecommendation() {
    this.isSubmitting = true;
    // TODO: Implement API call to get AI recommendations
    console.log('Submitting recommendation request:', this.userNeeds);
    
    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      // TODO: Parse and display recommendations
    }, 2000);
  }

  onClose() {
    this.state = 'closed';
    setTimeout(() => {
      this.close.emit();
    }, 150);
  }
}
