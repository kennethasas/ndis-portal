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
  @Input() iconClass: string = 'fa-solid fa-chart-line';
  @Input() iconColor: string = '#6366f1'; // Indigo-500 default
  @Input() bgColor: string = '#e0e7ff'; // Indigo-100 default
}
