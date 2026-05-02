import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonUiComponent } from '../../../../shared/ui/button/button.ui';

@Component({
  selector: 'app-book-button',
  standalone: true,
  imports: [CommonModule, ButtonUiComponent],
  templateUrl: './book-button.component.html'
})
export class BookButton {
  @Input() disabled = false;
  @Input() isLoading = false;
  @Output() onClick = new EventEmitter<MouseEvent>();

  handleClick(event: MouseEvent) {
    if (this.disabled || this.isLoading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.onClick.emit(event);
  }
}
