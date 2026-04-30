import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './forbidden.component.html',
})
export class ForbiddenComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
