import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonUiComponent } from '../../../ui/button/button.ui';
import { PlusIconComponent } from '../../icons/svg-icons/plus-icon'
@Component({
  selector: 'app-add-button',
  standalone: true,
  imports: [CommonModule, ButtonUiComponent, PlusIconComponent],
  templateUrl: './add-button.component.html',
})
export class AddButtonComponent {
  @Output() onClick = new EventEmitter<MouseEvent>();
}
