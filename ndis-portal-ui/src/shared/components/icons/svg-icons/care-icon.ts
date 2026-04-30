import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-care',
  standalone: true,
  template: `
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.5 16L9 11.5L12 16L15 11.5L17.5 15.5H22"
        stroke="currentColor"
        stroke-width="2"
        stroke-miterlimit="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M22 9.5C22 6.46245 19.5375 4 16.5 4C14.6399 4 12.9954 4.92345 12 6.3369C11.0046 4.92345 9.36015 4 7.5 4C4.46244 4 2 6.46245 2 9.5C2 15 8.5 20 12 21.1631C12.5968 20.9647 13.2808 20.6549 14.0049 20.25"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        vertical-align: middle; /* Helps if placed next to text */
      }
      svg {
        display: block; /* Prevents the "descender" gap at the bottom */
      }
    `,
  ],
})
export class CareIconComponent {
  @Input() size: number = 20;
}