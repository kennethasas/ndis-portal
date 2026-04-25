import { Component, Input, Output, EventEmitter } from '@angular/core'; // Add Output & EventEmitter
import { CommonModule } from '@angular/common';
import { CardUi } from '../../../shared/ui/card/card.ui';

@Component({
  selector: 'app-card-component',
  standalone: true,
  imports: [CommonModule, CardUi],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent {
  @Input() services: any[] = [];

  // Create an emitter to send the service data to the parent page
  @Output() cardSelected = new EventEmitter<any>();

  onCardClick(service: any) {
    this.cardSelected.emit(service);
  }
}
