// service-card.ui.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicIconComponent } from '../../../shared/components/icons/dynamic-icon.component';

@Component({
  selector: 'app-service-card-ui',
  standalone: true,
  imports: [CommonModule, DynamicIconComponent], 
  templateUrl: './service-card.ui.html',
})
export class CardUi {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() tag: string = '';
  @Input() iconName: string = 'default';
  @Input() showArrow: boolean = true;
}
