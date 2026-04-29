import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleComponent } from '../../toggle/toggle.component';

@Component({
  selector: 'app-manage-services-table',
  standalone: true,
  imports: [CommonModule, ToggleComponent],
  template: `
    <div class="overflow-x-auto rounded-lg border border-slate-200" data-testid="services-table">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-200">
          <tr *ngFor="let item of services" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{{ item.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ item.category }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <app-toggle
                  [isOn]="item.isActive"
                  (onChange)="onToggle.emit({ id: item.id, isActive: $event })"
                  data-testid="toggle-btn"
                ></app-toggle>
                <span [class]="item.isActive ? 'text-emerald-600' : 'text-slate-400'" class="text-sm font-medium">
                  {{ item.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </td>
          </tr>
          <tr *ngIf="!services || services.length === 0">
            <td colspan="3" class="px-6 py-12 text-center text-sm text-slate-400">No services found</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class ManageServicesTableComponent {
  @Input() services: any[] = [];

  @Output() onToggle = new EventEmitter<{ id: number; isActive: boolean }>();
}
