import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-area',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.css'],
})
export class TextAreaComponent {
  @Input() value: string = '';
  @Input() rows: number = 4;
  @Input() placeholder: string = '';
  @Output() valueChange = new EventEmitter<string>();
}
