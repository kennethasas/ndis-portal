import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // Fixes ngSwitch/ngClass errors
import { TableComponent } from './ui/table/table.ui';
import { BookingTableComponent } from './components/table/booking-table/booking-table.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule, // Required for built-in directives
    TableComponent,
    BookingTableComponent,
  ],
  exports: [BookingTableComponent, TableComponent],
})
export class SharedModule {}
