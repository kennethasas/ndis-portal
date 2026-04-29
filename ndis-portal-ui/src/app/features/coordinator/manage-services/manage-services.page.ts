// FILE: manage-services.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Your shared components
import { ManageServicesTableComponent } from '../../../../shared/components/table/manage-services/manage-services-table.component';

import { AddButtonComponent } from '../../../../shared/components/button/add-button/add-button.component';

import { ServiceFormModalComponent } from '../../../../shared/components/modals/service-form-modal.component';

// API Service
import { ApiService } from '../../../core/services/api-service';

@Component({
  selector: 'app-manage-services',
  standalone: true,
  imports: [
    CommonModule,
    ManageServicesTableComponent,
    AddButtonComponent,
    ServiceFormModalComponent,
  ],
  templateUrl: './manage-services.page.html',
})
export class ManageServicesComponent implements OnInit {
  // Services data from API
  services: any[] = [];
  
  // Loading state
  isLoading = true;

  // Controls modal visibility
  isModalOpen = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  // Load services from API (including inactive for coordinator)
  loadServices() {
    this.api.getAllServices().subscribe({
      next: (res: any) => {
        console.log('API Response:', res);
        const data = res.Data || res;
        console.log('Services data:', data);
        if (Array.isArray(data)) {
          this.services = data.map((service: any) => ({
            id: service.id,
            name: service.name || service.title,
            category: service.categoryName || service.category,
            // Handle both PascalCase (C#) and camelCase (JSON)
            isActive: service.isActive ?? service.IsActive ?? false,
          }));
          console.log('Mapped services:', this.services);
          console.log('Inactive services:', this.services.filter(s => !s.isActive));
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.isLoading = false;
      }
    });
  }

  // Open modal
  openModal() {
    this.isModalOpen = true;
    console.log('Modal Opened');
  }

  // Save new service
  saveNewService(formData: any) {
    console.log('Creating service with data:', formData);
    // Call API to create new service
    this.api.createService(formData).subscribe({
      next: (res: any) => {
        console.log('Service created successfully:', res);
        
        // Reload services to get updated list from API
        this.loadServices();
        
        // Close modal
        this.isModalOpen = false;
      },
      error: (err) => {
        console.error('Error creating service:', err);
        console.error('Error details:', err.error);
        alert('Failed to create service: ' + (err.error?.Message || err.message || 'Unknown error'));
      }
    });
  }

  // Toggle service active status
  toggleServiceStatus(event: { id: number; isActive: boolean }) {
    this.api.toggleServiceActive(event.id).subscribe({
      next: () => this.loadServices(),
      error: (err) => console.error('Error toggling service status:', err)
    });
  }
}
