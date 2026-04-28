import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../../shared/ui/table/table.ui';
import { TableColumn } from '../../../../shared/models/table.model';

@Component({
  selector: 'app-manage-services-table',
  standalone: true,
  imports: [CommonModule, TableComponent],
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

  // These must match the event names used in the parent HTML
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDeactivate = new EventEmitter<any>();

  serviceColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'name' },
    { key: 'category', label: 'Category', type: 'category' },
    { key: 'status', label: 'Status', type: 'status' },
    {
      key: 'actions',
      label: 'Actions',
      type: 'action',
      // FIX: Added commas and converted to objects so the template can read .label and .actionKey
      actionLabel: [
        { label: 'Activate', actionKey: 'activate' },
        {
          label: 'Deactivate',
          actionKey: 'deactivate',
          class: 'text-rose-500 hover:bg-rose-50',
        },
      ],
    },
  ];
}
