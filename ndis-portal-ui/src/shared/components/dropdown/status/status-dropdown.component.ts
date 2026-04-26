import { Component, Output, EventEmitter, Input } from '@angular/core'; //
import { CommonModule } from '@angular/common';
import {
  DropdownUIComponent,
  DropdownOption,
} from '../../../ui/dropdown/dropdown.ui';
import { StatusIconComponent } from '../../icons/svg-icons/status-icon';

@Component({
  selector: 'app-status-dropdown',
  standalone: true,
  imports: [CommonModule, DropdownUIComponent, StatusIconComponent],
  template: `
    <app-dropdown-ui
      label="Status"
      [options]="statusOptions"
      [selectedValue]="activeStatus"
      (onSelect)="handleSelect($event)"
    >
      <app-icon-status icon [size]="16"></app-icon-status>
    </app-dropdown-ui>
  `,
})
export class StatusDropdownComponent {
  // FIXED: Added @Input so parent can bind [activeStatus]
  @Input() activeStatus: string = 'all';
  @Output() statusChange = new EventEmitter<string>();

  statusOptions: DropdownOption[] = [
    { label: 'All Status', value: 'all' },
    { label: 'Approved', value: 'approved' },
    { label: 'Pending', value: 'pending' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  handleSelect(value: string) {
    this.statusChange.emit(value);
  }
}
