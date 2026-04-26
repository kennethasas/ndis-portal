import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { TableComponent, TableColumn } from '../../ui/table/table.ui';

@Component({
  selector: 'app-booking-table',
  standalone: true,
  imports: [TableComponent],
  template: `
    <app-table-ui
      [columns]="visibleColumns"
      [data]="bookings"
      (viewAction)="viewBooking.emit($event)"
      (cancelAction)="cancelBooking.emit($event)"
    ></app-table-ui>
  `,
})
export class BookingTableComponent implements OnChanges {
  @Input() bookings: any[] = [];
  @Input() currentFilter: string = 'all';
  @Output() viewBooking = new EventEmitter<any>();
  @Output() cancelBooking = new EventEmitter<any>();

  /** * Desktop base columns
   */
  private baseColumns: TableColumn[] = [
    { key: 'service', label: 'Service' },
    { key: 'category', label: 'Category', type: 'category' },
    { key: 'date', label: 'Date' },
    { key: 'view', label: 'Note', type: 'view' },
    { key: 'status', label: 'Status', type: 'status' },
  ];

  visibleColumns: TableColumn[] = [...this.baseColumns];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentFilter']) {
      this.updateColumns();
    }
  }

  /** * Action column logic: Only added when filter is 'pending'
   */
  private updateColumns() {
    if (this.currentFilter.toLowerCase() === 'pending') {
      this.visibleColumns = [
        ...this.baseColumns,
        { key: 'action', label: '', type: 'action' },
      ];
    } else {
      this.visibleColumns = [...this.baseColumns];
    }
  }
}
