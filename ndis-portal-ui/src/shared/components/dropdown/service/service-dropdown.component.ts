import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-service-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-dropdown.component.html',
  styleUrls: ['./service-dropdown.component.css'],
})
export class ServiceDropdownComponent {
  @Input() value: any;
  @Input() options: { id: string; label: string }[] = [];
  @Output() valueChange = new EventEmitter<any>();
}
