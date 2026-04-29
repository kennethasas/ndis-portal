import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="isOn ? 'bg-emerald-500' : 'bg-slate-300'"
      class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      (click)="toggle()"
      [disabled]="disabled"
      type="button"
      [attr.aria-pressed]="isOn"
    >
      <span
        [class]="isOn ? 'translate-x-5' : 'translate-x-0'"
        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out"
      ></span>
    </button>
  `,
})
export class ToggleComponent {
  @Input() isOn: boolean = false;
  @Input() disabled: boolean = false;
  @Output() onChange = new EventEmitter<boolean>();

  toggle() {
    if (!this.disabled) {
      this.isOn = !this.isOn;
      this.onChange.emit(this.isOn);
    }
  }
}
