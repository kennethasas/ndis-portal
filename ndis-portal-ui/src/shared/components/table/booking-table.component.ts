import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { TableComponent } from '../../ui/table/table.ui';
import { TableColumn } from '../../models/table.model';

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
    // Add type: 'text' (or whatever your default switch case is)
    { key: 'service', label: 'Service', type: 'text' },
    { key: 'category', label: 'Category', type: 'category' },
    { key: 'date', label: 'Date', type: 'date' }, // Changed to 'date' to match your table.ui logic
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
