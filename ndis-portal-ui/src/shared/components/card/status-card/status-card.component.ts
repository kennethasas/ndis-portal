import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-card-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-card.component.html',
})
export class StatusCardComponent {
  // Required inputs passed from the parent dashboard
  @Input({ required: true }) label: string = '';
  @Input({ required: true }) value: number = 0;

  // Optional styling inputs with default fallbacks
  @Input() iconClass: string = '';
  @Input() iconColor: string = ''; 
  @Input() bgColor: string = ''; 
}
