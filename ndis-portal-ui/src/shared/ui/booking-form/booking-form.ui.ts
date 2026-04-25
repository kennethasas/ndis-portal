import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-form-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-form.ui.html',
  styleUrls: ['./booking-form.ui.css'],
})
export class BookingFormUi {
  @Input() title: string = '';
  @Input() actionLabel: string = 'Submit';
  @Output() back = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  onBack() {
    this.back.emit();
  }
  onSubmit() {
    this.submit.emit();
  }
}
