import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextAreaUi } from '../../../shared/ui/text-area/text-area.ui';

@Component({
  selector: 'app-text-area-component',
  standalone: true,
  imports: [CommonModule, FormsModule, TextAreaUi],
  templateUrl: './text-area.component.html',
})
export class TextAreaComponent {
  @Input() label: string = 'Additional Notes (Optional)'; // Default label
  @Input() value: string = '';
  @Input() rows: number = 4;
  @Input() placeholder: string =
    'Type addtional notes';
  @Input() required: boolean = true; // Defaulting to required

  @Output() valueChange = new EventEmitter<string>();
}
