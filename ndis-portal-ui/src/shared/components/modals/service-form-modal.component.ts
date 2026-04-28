// FILE: service-form-modal.component.ts

import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// Reactive Forms imports (VERY IMPORTANT)
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-service-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Needed for FormGroup to work
  ],
  templateUrl: './service-form-modal.component.html',
})
export class ServiceFormModalComponent {
  // Emits when modal is closed
  @Output() onClose = new EventEmitter<void>();

  // Emits when form is saved
  @Output() onSave = new EventEmitter<any>();

  // Reactive form definition
  serviceForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });

  // Submit form
  submit() {
    if (this.serviceForm.valid) {
      // Emit form data
      this.onSave.emit(this.serviceForm.value);
    }
  }
}
