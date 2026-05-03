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
  templateUrl: './category-dropdown.component.html',
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
    if (!this.services || this.services.length === 0) {
      this.categoryOptions = [{ label: 'All Categories', value: 'all' }];
      return;
    }

    const uniqueCategories = new Set<string>();
    this.services.forEach(service => {
      if (service.category) {
        uniqueCategories.add(service.category);
      }
    });

    const activeCategories = Array.from(uniqueCategories).sort();

    this.categoryOptions = [
      { label: 'All Categories', value: 'all' },
      ...activeCategories.map(category => ({
        label: category,
        value: category.toLowerCase().replace(/\s+/g, '-')
      }))
    ];
  }

  handleSelect(value: string) {
    this.selectedValue = value;
    this.categoryChange.emit(value);
  }
}
