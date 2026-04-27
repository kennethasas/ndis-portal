import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-date-picker-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-picker.ui.html',
})
export class DatePickerUi {
  @Input() isRequired: boolean = false;
}
