// service-item.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceItemUi } from '../../ui/service-item/service-item.ui';

@Component({
  selector: 'app-service-item',
  standalone: true,
  imports: [CommonModule, ServiceItemUi],
  templateUrl: './service-item.component.html',
})
export class ServiceItemComponent {
  @Input() item: any;
}
