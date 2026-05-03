import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-book-new',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 6.6641 6.6641"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_201_22377)">
        <path
          d="M5.27574 3.60971C5.47011 3.60971 5.65615 3.64581 5.83108 3.7069V2.49903L4.16506 0.833008H1.38835C1.08013 0.833008 0.833008 1.08013 0.833008 1.38835V5.27574C0.833008 5.58395 1.08291 5.83108 1.38835 5.83108H3.7069C3.64581 5.65615 3.60971 5.47011 3.60971 5.27574C3.60971 4.35665 4.35665 3.60971 5.27574 3.60971ZM3.88738 1.24951L5.41457 2.7767H3.88738V1.24951ZM6.38642 4.99807V5.55341H5.55341V6.38642H4.99807V5.55341H4.16506V4.99807H4.99807V4.16506H5.55341V4.99807H6.38642Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_201_22377">
          <rect width="6.6641" height="6.6641" fill="white" />
        </clipPath>
      </defs>
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
    `,
  ],
})
export class NewBookIconComponent {
  @Input() size: number = 20;
}