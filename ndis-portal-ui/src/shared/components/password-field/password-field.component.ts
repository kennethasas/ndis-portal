import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewIconComponent } from '../icons/svg-icons/view-icon';
import { UnViewIconComponent } from '../icons/svg-icons/unview-icon';
@Component({
  selector: 'app-password-field',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewIconComponent, UnViewIconComponent],
  templateUrl: './password-field.ui.html',
})
export class PasswordFieldComponent {
  @Input() placeholder: string = '';
  @Input() name: string = '';
  @Input() required: boolean = false;

  @Input() model: any;
  @Output() modelChange = new EventEmitter<any>();

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
