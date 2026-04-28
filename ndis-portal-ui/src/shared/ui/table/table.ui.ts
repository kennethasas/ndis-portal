import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn } from '../../models/table.model';

@Component({
  selector: 'app-table-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.ui.html',
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Output() viewAction = new EventEmitter<any>();
  @Output() cancelAction = new EventEmitter<any>();

  activeMenuRow: any = null;

  constructor(private eRef: ElementRef) {}

  /** New logic to safely emit actions for both old and new tables[cite: 12] */
  emitAction(row: any, actionKey?: string): void {
    // If actionKey exists, we send an object. If not (old way), we send just the row.
    const payload = actionKey ? { row, action: actionKey } : row;
    this.cancelAction.emit(payload);
    this.activeMenuRow = null; // Close menu after click
  }

  // 1. Returns the array for the *ngFor loop
  getActionConfig() {
    const actionCol = this.columns?.find((col) => col.type === 'action');
    // Only return it if it is an array
    return Array.isArray(actionCol?.actionLabel) ? actionCol.actionLabel : null;
  }

  // 2. Returns a string for the single button fallback
  getActionLabel(): string {
    const actionCol = this.columns?.find((col) => col.type === 'action');
    // If it's a string, return it. If it's an array or missing, return 'Cancel'
    return typeof actionCol?.actionLabel === 'string'
      ? actionCol.actionLabel
      : 'Cancel';
  }

  getStatusClasses(status: string): string {
    const s = status?.toLowerCase();
    switch (s) {
      case 'approved':
      case 'active':
        return 'text-[#289839]'; // Success[cite: 20]
      case 'pending':
        return 'text-[#CF971D]'; // Warning[cite: 20]
      case 'cancelled':
      case 'inactive':
        return 'text-[#DB4444]'; // Error[cite: 20]
      default:
        return 'text-slate-700';
    }
  }

  getValue(row: any, key: string): any {
    return row ? row[key] : '';
  }
  get hasActionColumn(): boolean {
    return this.columns.some((col) => col.type === 'action');
  }
  toggleMenu(row: any): void {
    this.activeMenuRow = this.activeMenuRow === row ? null : row;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.activeMenuRow = null;
    }
  }
}
