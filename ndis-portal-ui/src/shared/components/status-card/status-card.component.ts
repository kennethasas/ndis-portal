import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusUi } from '../../../shared/ui/status-card/status-card.ui';

@Component({
  selector: 'app-status-card-component',
  standalone: true,
  imports: [CommonModule, StatusUi],
  templateUrl: './status-card.component.html',
})
export class StatusCardComponent {
  /**
   * We now receive the data from the parent (Dashboard).
   * This allows the component to stay synchronized with backend updates.
   */
  @Input() bookingStats: any[] = [];
}
