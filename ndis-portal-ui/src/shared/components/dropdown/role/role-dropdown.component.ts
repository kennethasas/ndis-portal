import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-dropdown.component.html',
})
export class RoleDropdownComponent {
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  isOpen = false;

  toggle() {
    this.isOpen = !this.isOpen;
  }

  // Use this function in your HTML (click)
  select(role: string) {
    this.value = role;
    this.valueChange.emit(role); // This sends the data to signupData.role
    this.isOpen = false;
  }
}
