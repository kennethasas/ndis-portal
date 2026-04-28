import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonUiComponent } from '../../../../shared/ui/button/button.ui';

@Component({
  selector: 'app-book-button',
  standalone: true,
  imports: [CommonModule, ButtonUiComponent],
  template: `
    <app-button-ui
      [label]="label"
      variant="solid"
      (onClick)="handleAction($event)"
    >
    </app-button-ui>
  `,
})
export class BookButton {
  @Input() label: string = 'Book This Service';
  // Renaming to 'onClick' avoids collisions with native DOM 'click' events
  @Output() onClick = new EventEmitter<MouseEvent>();

  handleAction(event: MouseEvent) {
    this.onClick.emit(event);
  }
}
