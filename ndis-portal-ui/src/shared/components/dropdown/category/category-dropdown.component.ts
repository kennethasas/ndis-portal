import { Component, Output, EventEmitter, Input, OnChanges } from '@angular/core';
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
  template: `
    <app-dropdown-ui
      variant="variant1"
      label="Category"
      [options]="categoryOptions"
      [selectedValue]="selectedValue"
      (onSelect)="handleSelect($event)"
    >
      <app-icon-filter icon [size]="16"></app-icon-filter>
    </app-dropdown-ui>
  `,
})
export class CategoryDropdownComponent implements OnChanges {
  @Output() categoryChange = new EventEmitter<string>();
  @Input() services: any[] = [];

  selectedValue = 'all';
  categoryOptions: DropdownOption[] = [
    { label: 'All Categories', value: 'all' },
  ];

  ngOnChanges() {
    this.updateCategoryOptions();
  }

  updateCategoryOptions() {
    if (!this.services?.length) return;
    const uniqueCategories = [
      ...new Set(this.services.map((s) => s.category).filter(Boolean)),
    ];
    this.categoryOptions = [
      { label: 'All Categories', value: 'all' },
      ...uniqueCategories.map((cat) => ({
        label: cat,
        value: cat.toLowerCase().replace(/\s+/g, '-'),
      })),
    ];
  }

  handleSelect(value: string) {
    this.selectedValue = value;
    this.categoryChange.emit(value);
  }
}