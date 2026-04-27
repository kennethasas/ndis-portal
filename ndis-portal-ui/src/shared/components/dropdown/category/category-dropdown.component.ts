import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DropdownUIComponent,
  DropdownOption,
} from '../../../ui/dropdown/dropdown.ui';
import { FilterIconComponent } from '../../icons/svg-icons/filter-icon';

@Component({
  selector: 'app-category-dropdown',
  standalone: true,
  imports: [CommonModule, DropdownUIComponent, FilterIconComponent],
  templateUrl: './category-dropdown.component.html',
})
export class CategoryDropdownComponent {
  @Output() categoryChange = new EventEmitter<string>();

  categoryOptions: DropdownOption[] = [
    { label: 'All Categories', value: 'all' },
    { label: 'Personal Hygiene', value: 'hygiene' },
    { label: 'Daily Activities', value: 'activities' },
    { label: 'Transport', value: 'transport' },
  ];

  handleSelect(value: string) {
    this.categoryChange.emit(value);
  }
}
