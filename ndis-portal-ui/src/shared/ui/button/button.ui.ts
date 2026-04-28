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
  // Added 'icon' as a valid variant option
  @Input() variant: 'solid' | 'outline' | 'none' | 'icon' = 'solid';

  @Output() onClick = new EventEmitter<MouseEvent>();

  variantClasses: Record<string, string> = {
    icon: 
      'inline-flex items-center justify-center bg-[#6B3293] hover:bg-[#5a2a7b] text-white rounded-lg px-5 py-2.5 text-sm md:text-base transition-all',
    solid:
      'bg-[#6B3293] hover:bg-[#5a2a7b] text-white rounded-lg px-6 md:px-20 py-3 md:py-4 text-sm md:text-base whitespace-nowrap',

    outline:
      'bg-transparent border-2 border-[#6B3293] text-[#6B3293] hover:bg-violet-50 shadow-none rounded-2xl px-6 md:px-20 py-3 md:py-4 text-sm md:text-base whitespace-nowrap',
  };
}
