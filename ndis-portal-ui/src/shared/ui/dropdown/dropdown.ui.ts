import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownOption {
  label: string;
  value: any;
  isDivider?: boolean;
}

@Component({
  selector: 'app-dropdown-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.ui.html',
})
export class DropdownUIComponent {
  @Input() label: string = 'Select';
  @Input() options: DropdownOption[] = [];
  @Input() selectedValue: any;
  @Input() showIcon: boolean = true;

  // NEW: Variant input (default is the original violet style)
  @Input() variant!: 'default' | 'variant1' | 'variant2';
  @Output() onSelect = new EventEmitter<any>();

  isOpen = false;

  constructor(private eRef: ElementRef) {}

  toggle() {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: DropdownOption) {
    if (option.isDivider) return;
    this.onSelect.emit(option.value);
    this.isOpen = false;
  }

  // Helper to manage Tailwind classes for different variants
  getVariantClasses() {
    switch (this.variant) {
      case 'variant1':
        return {
          buttonActive: 'border-slate-400 ring-4 ring-slate-100',
          itemActive: 'bg-slate-100 text-slate-900 font-semibold',
          itemHover: 'hover:bg-slate-50 hover:text-slate-900',
          checkIcon: 'text-slate-600',
        };
      case 'variant2':
        return {
          buttonActive: 'border-emerald-600 ring-2 ring-emerald-600/10',
          itemActive: 'bg-emerald-50 text-emerald-700 font-semibold',
          itemHover: 'hover:bg-emerald-50 hover:text-emerald-900',
          checkIcon: 'text-emerald-600',
        };
      default: // 'default' (Violet)
        return {
          buttonActive: 'border-violet-600 ring-2 ring-violet-600/10',
          itemActive: 'bg-violet-50 text-violet-700 font-semibold',
          itemHover: 'hover:bg-slate-50 hover:text-slate-900',
          checkIcon: 'text-violet-600',
        };
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
