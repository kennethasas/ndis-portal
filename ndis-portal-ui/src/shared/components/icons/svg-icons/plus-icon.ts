import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-plus',
  standalone: true,
  template: `
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.33301 7.99992H12.6663M7.99967 3.33325V12.6666"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        vertical-align: middle;
      }
    `,
  ],
})
export class PlusIconComponent {
  @Input() size: number = 16;
}
