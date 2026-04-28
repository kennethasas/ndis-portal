import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectUi } from '../../../ui/select/select.ui'; // Import the new UI shell

@Component({
  selector: 'app-select-service',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectUi],
  templateUrl: './select-service.component.html',
})
export class ServiceSelectComponent {
  @Input() label: string = 'Select Service';
  @Input() value: any = ''; // Initialize as empty string to match the placeholder
  @Input() options: { id: string | number; label: string }[] = [];
  @Input() required: boolean = true;

  // NEW: Input for the placeholder text
  @Input() placeholder: string = 'Choose a service...';

  @Output() valueChange = new EventEmitter<any>();
}