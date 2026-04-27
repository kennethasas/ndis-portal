import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.ui.html',
})
export class ButtonUiComponent {
  @Input() label: string = '';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() fullWidth: boolean = false;
  @Input() variant: 'solid' | 'outline' | 'none' = 'solid';

  @Output() onClick = new EventEmitter<MouseEvent>();

  // MAP: Tailwind classes for each variant
  variantClasses: Record<string, string> = {
    none: 'bg-transparent border-none px-0 py-0 text-slate-500 hover:text-slate-800 transition-colors',

    // FIXED: Reduced mobile padding (px-6) and added responsive text size (text-sm md:text-base)
    solid:
      'bg-[#6B3293] hover:bg-[#5a2a7b] text-white rounded-lg px-6 md:px-20 py-3 md:py-4 text-sm md:text-base whitespace-nowrap',

    outline:
      'bg-transparent border-2 border-[#6B3293] text-[#6B3293] hover:bg-violet-50 shadow-none rounded-2xl px-6 md:px-20 py-3 md:py-4 text-sm md:text-base whitespace-nowrap',
  };
}
