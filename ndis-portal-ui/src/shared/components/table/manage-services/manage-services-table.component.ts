import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableUiComponent } from '../../../../shared/ui/table/table.ui';
import { TableColumn } from '../../../../shared/models/table.model';

@Component({
  selector: 'app-manage-services-table',
  standalone: true,
  imports: [CommonModule, TableUiComponent],
  template: `
    <app-table-ui
      [columns]="serviceColumns"
      [data]="bookings"
      (viewAction)="onEdit.emit($event)"
      (cancelAction)="onDeactivate.emit($event)"
    ></app-table-ui>
  `,
})
export class ManageServicesTableComponent {
  @Input() bookings: any[] = [];
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDeactivate = new EventEmitter<any>();

  // Requirement: Name, Category, Status, Actions
  serviceColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'name' },
    { key: 'category', label: 'Category', type: 'category' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'actions', label: 'Actions', type: 'action' },
  ];
}
