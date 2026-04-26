import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-sidebar',
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
        d="M0 13.6578C0 15.2168 0.979787 15.9926 2.94887 15.9926H13.0511C15.0202 15.9926 16 15.2168 16 13.6578V2.34219C16 0.790678 15.0202 0 13.0511 0H2.94887C0.979787 0 0 0.790678 0 2.34219V13.6578ZM1.53151 13.6355V2.36457C1.53151 1.61865 2.03567 1.20093 3.02497 1.20093H12.9751C13.9643 1.20093 14.4685 1.61865 14.4685 2.36457V13.6355C14.4685 14.3814 13.9643 14.7916 12.9751 14.7916H3.02497C2.03567 14.7916 1.53151 14.3814 1.53151 13.6355Z"
        fill="currentColor"
      />
      <path
        d="M8.85616 13.7772H12.3187C12.9275 13.7772 13.1653 13.5908 13.1653 13.1208V2.87931C13.1653 2.40938 12.9275 2.2229 12.3187 2.2229H8.85616C8.24736 2.2229 8 2.40938 8 2.87931V13.1208C8 13.5908 8.24736 13.7772 8.85616 13.7772Z"
        fill="currentColor"
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
export class SideBarIconComponent {
  @Input() size: number = 20;
}