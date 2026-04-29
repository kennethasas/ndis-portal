import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { TableComponent } from '../../../ui/table/table.ui';
import { TableColumn } from '../../../models/table.model';

@Component({
  selector: 'app-all-booking-table',
  standalone: true,
  imports: [TableComponent],
  template: `
    <app-table-ui
      [columns]="visibleColumns"
      [data]="bookings"
      (viewAction)="viewBooking.emit($event)"
      (cancelAction)="onAction($event)"
    ></app-table-ui>
  `,
})
export class AllBookingTable implements OnChanges {
  @Input() bookings: any[] = [];
  @Input() currentFilter: string = 'all';
  @Output() viewBooking = new EventEmitter<any>();
  @Output() cancelBooking = new EventEmitter<any>();
  @Output() approveBooking = new EventEmitter<any>();

  /** * Desktop base columns
   */
  private baseColumns: TableColumn[] = [
    // Add type: 'text' (or whatever your default switch case is)
    { key: 'name', label: 'Name', type: 'text' },
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

  /** Multi-action config for coordinator: Approve and Cancel */
  private pendingActionConfig = [
    { label: 'Approve', actionKey: 'approve', class: 'text-emerald-600 hover:bg-emerald-50' },
    { label: 'Cancel', actionKey: 'cancel', class: 'text-rose-500 hover:bg-rose-50' },
  ];

  /** * Action column logic: Only added when filter is 'pending'
   */
  private updateColumns() {
    if (this.currentFilter.toLowerCase() === 'pending') {
      this.visibleColumns = [
        ...this.baseColumns,
        { key: 'action', label: '', type: 'action', actionLabel: this.pendingActionConfig },
      ];
    } else {
      this.visibleColumns = [...this.baseColumns];
    }
  }

  /**
   * Handle multi-action events from table UI
   */
  onAction(event: any): void {
    if (typeof event === 'object' && event.action && event.row) {
      // Multi-action payload
      if (event.action === 'approve') {
        this.approveBooking.emit(event.row);
      } else if (event.action === 'cancel') {
        this.cancelBooking.emit(event.row);
      }
    } else {
      // Legacy: direct row emission (fallback)
      this.cancelBooking.emit(event);
    }
  }
}
