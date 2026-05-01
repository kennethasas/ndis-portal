import { Component, Output, EventEmitter, Input } from '@angular/core'; //
import { CommonModule } from '@angular/common';
import {
  DropdownUIComponent,
  DropdownOption,
} from '../../../ui/dropdown/dropdown.ui';
import { FilterIconComponent } from '../../icons/svg-icons/filter-icon';
@Component({
  selector: 'app-status-dropdown',
  standalone: true,
  imports: [CommonModule, DropdownUIComponent, FilterIconComponent],
  template: `
    <app-dropdown-ui
      variant="variant1"
      label="Status"
      [options]="statusOptions"
      [selectedValue]="activeStatus"
      (onSelect)="handleSelect($event)"
    >
      <app-icon-filter icon [size]="16"></app-icon-filter>
    </app-dropdown-ui>
  `,
})
export class StatusDropdownComponent {
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