// dynamic-icon.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CareIconComponent } from './svg-icons/care-icon';
import { CommunityIconComponent } from './svg-icons/community-icon';
import { TherapyIconComponent } from './svg-icons/therapy-icon';

import { SupportIconComponent } from './svg-icons/support-icon';
import { ActivityIconComponent } from './svg-icons/activity-icon';

// dynamic-icon.component.ts
@Component({
  selector: 'app-dynamic-icon',
  standalone: true,
  imports: [
    CommonModule,
    ActivityIconComponent,
    CareIconComponent,
    CommunityIconComponent,
    TherapyIconComponent,
    SupportIconComponent,
  ],
  template: `
    <ng-container [ngSwitch]="name">
      <app-icon-activity *ngSwitchCase="'activity'"></app-icon-activity>
      <app-icon-care *ngSwitchCase="'care'"></app-icon-care>
      <app-icon-community *ngSwitchCase="'community'"></app-icon-community>
      <app-icon-therapy *ngSwitchCase="'therapy'"></app-icon-therapy>
      <app-icon-support *ngSwitchCase="'support'"></app-icon-support>

      <!-- Visible Fallback, to help you identify missing mappings -->
      <svg
        *ngSwitchDefault
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="red"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </ng-container>
  `,
})
export class DynamicIconComponent {
  @Input() name: string = 'default';
}