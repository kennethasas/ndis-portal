import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text-area-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text-area.ui.html'
})
export class TextAreaUi {
  // Logic: Only shows the asterisk if the parent marks it as required
  @Input() isRequired: boolean = false;
}
