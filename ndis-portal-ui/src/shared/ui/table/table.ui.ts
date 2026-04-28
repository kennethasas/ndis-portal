import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn } from '../../models/table.model';

@Component({
  selector: 'app-table-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.ui.html',
})
export class TableUiComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];

  // FIX: Added the missing property that caused the NG9 error
  @Input() hasActionColumn: boolean = true;

  @Output() viewAction = new EventEmitter<any>();
  @Output() cancelAction = new EventEmitter<any>();

  activeMenuRow: any = null;

  toggleMenu(row: any) {
    this.activeMenuRow = this.activeMenuRow === row ? null : row;
  }

  getValue(row: any, key: string) {
    return row[key];
  }

  getStatusClasses(status: string) {
    return status === 'Active'
      ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
      : 'text-slate-500 bg-slate-50 border-slate-100';
  }
}
