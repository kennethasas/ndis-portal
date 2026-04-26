import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewIconComponent } from '../../components/icons/svg-icons/view-icon';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'category' | 'status' | 'view' | 'action';
}

@Component({
  selector: 'app-table-ui',
  standalone: true,
  imports: [CommonModule, ViewIconComponent],
  templateUrl: './table.ui.html',
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];

  @Output() viewAction = new EventEmitter<any>();
  @Output() cancelAction = new EventEmitter<any>();

  /** Tracks which row has the action menu open */
  activeMenuRow: any = null;

  constructor(private eRef: ElementRef) {}

  /** Helper to safely get object values */
  getValue(row: any, key: string): any {
    return row ? row[key] : '';
  }

  /** Helper to determine if the action menu should be visible */
  get hasActionColumn(): boolean {
    return this.columns.some((col) => col.type === 'action');
  }

  /** Returns Tailwind classes based on status */
  getStatusClasses(status: string): string {
    const s = status?.toLowerCase();
    switch (s) {
      case 'approved':
        return 'text-[#289839]';
      case 'pending':
        return 'text-[#CF971D]';
      case 'cancelled':
        return 'text-[#DB4444]';
      default:
        return 'text-slate-700';
    }
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
