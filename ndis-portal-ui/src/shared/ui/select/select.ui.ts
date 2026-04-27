import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-select-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.ui.html'
})
export class SelectUi {
  @Input() isRequired: boolean = false;
}
