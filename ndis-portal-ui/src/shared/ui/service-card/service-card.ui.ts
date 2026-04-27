  import { Component, Input } from '@angular/core';
  import { CommonModule } from '@angular/common';

  @Component({
    selector: 'app-service-card-ui',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './service-card.ui.html',
  })
  export class CardUi {
    @Input() title: string = '';
    @Input() description: string = '';
    @Input() tag: string = '';
    @Input() showArrow: boolean = true;
  }
