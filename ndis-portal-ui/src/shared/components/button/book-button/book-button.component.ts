import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonUiComponent } from '../../../../shared/ui/button/button.ui';

@Component({
  selector: 'app-book-button',
  standalone: true,
  imports: [CommonModule, ButtonUiComponent],
  templateUrl: './book-button.component.html'
})
export class BookButton {
  @Output() onClick = new EventEmitter<MouseEvent>();
}
