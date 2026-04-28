import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-card-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-card.component.html',
})
export class StatCardComponent {
  @Input({ required: true }) label: string = '';
  @Input({ required: true }) value: number = 0;
  @Input() iconClass: string = 'fa-solid fa-chart-line';
  @Input() iconColor: string = '#6366f1'; // Indigo-500 default
  @Input() bgColor: string = '#e0e7ff'; // Indigo-100 default
}
