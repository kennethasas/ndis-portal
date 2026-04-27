import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerUi } from '../../../shared/ui/date-picker/date-picker.ui';

@Component({
  selector: 'app-date-picker-component',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerUi],
  templateUrl: './date-picker.component.html',
})
export class DatePickerComponent {
  @Input() label: string = 'Preferred Date';
  @Input() value: string = '';
  @Input() required: boolean = true;

  // NEW: Input for the placeholder
  @Input() placeholder: string = 'yyyy-mm-dd';

  @Output() valueChange = new EventEmitter<string>();
}