import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatusCardComponent],
  templateUrl: './dashboard.page.html',
})
export class DashboardComponent implements OnInit {
  // This array is ready to be replaced by an API call response
  stats: any[] = [
    {
      label: 'Total Bookings',
      value: 1250,
      icon: 'fa-solid fa-calendar-days',
      color: '#6366f1',
      bg: '#e0e7ff',
    },
    {
      label: 'Pending',
      value: 45,
      icon: 'fa-solid fa-clock',
      color: '#f59e0b',
      bg: '#fef3c7',
    },
    {
      label: 'Approved',
      value: 1180,
      icon: 'fa-solid fa-circle-check',
      color: '#10b981',
      bg: '#d1fae5',
    },
    {
      label: 'Cancelled',
      value: 25,
      icon: 'fa-solid fa-circle-xmark',
      color: '#ef4444',
      bg: '#fee2e2',
    },
  ];

  constructor() {}

  ngOnInit(): void {
    /** * BACKEND READY:
     * When you have your service, you would do:
     * this.bookingService.getStats().subscribe(data => this.stats = data);
     */
  }
}
