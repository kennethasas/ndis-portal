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

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
