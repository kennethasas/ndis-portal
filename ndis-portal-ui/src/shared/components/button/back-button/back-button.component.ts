import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonUiComponent } from '../../../ui/button/button.ui';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule, ButtonUiComponent],
  templateUrl: './back-button.component.html',
})
export class BackButton {
  @Output() onClick = new EventEmitter<MouseEvent>();
}