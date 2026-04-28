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
  // 1. Added 'ghost' to the type
  @Input() variant: 'solid' | 'outline' | 'none' | 'ghost' = 'solid';

  @Output() onClick = new EventEmitter<MouseEvent>();

  variantClasses: Record<string, string> = {
    none: 'bg-transparent border-none px-0 py-0 text-slate-500 hover:text-slate-800 transition-colors',

    solid:
      'bg-[#6B3293] hover:bg-[#5a2a7b] text-white rounded-lg px-6 md:px-20 py-3 md:py-4 text-sm md:text-base whitespace-nowrap',

    outline:
      'bg-transparent border-2 border-[#6B3293] text-[#6B3293] hover:bg-violet-50 shadow-none rounded-2xl px-6 md:px-20 py-3 md:py-4 text-sm md:text-base whitespace-nowrap',

    // 2. New Dynamic Variant: Fits content, minimal padding, no fixed width
    ghost:
      'w-fit bg-[#6B3293] hover:bg-[#5a2a7b] text-white rounded-md px-3 py-2 text-sm transition-all',
  };
}