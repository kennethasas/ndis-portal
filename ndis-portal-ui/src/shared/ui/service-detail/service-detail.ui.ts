import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-detail-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-detail.ui.html',
  styleUrls: ['./service-detail.ui.css'],
})
export class ServiceDetailUiComponent {
  @Input() title: string = '';
  @Input() category: string = '';
  @Input() description: string = '';
  @Input() actionLabel: string = 'Action';

  @Output() backClicked = new EventEmitter<void>();
  @Output() actionClicked = new EventEmitter<void>();

  // This must be called by the button in service-detail.ui.html
  onButtonClick() {
    this.actionClicked.emit();
  }
  
  onBack() {
    this.backClicked.emit();
  }
  onAction() {
    this.actionClicked.emit();
  }
}
