// FILE: manage-services.page.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';



// Your shared components

import { ManageServicesTableComponent } from '../../../../shared/components/table/manage-services/manage-services-table.component';



import { AddButtonComponent } from '../../../../shared/components/button/add-button/add-button.component';



import { ServiceFormModalComponent } from '../../../../shared/components/modals/service-form-modal.component';



// API Service

import { ApiService } from '../../../core/services/api-service';



import { ToastService } from '../../../core/services/toast.service'; // Import ToastService
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


  private toast = inject(ToastService);

  constructor(private api: ApiService) {}



  ngOnInit(): void {

    this.loadServices();

  }



  // Load services from API

  loadServices(showLoading = true) {

    if (showLoading) {

      this.isLoading = true;

    }

    this.api.getCoordinatorServices().subscribe({

      next: (res: any) => {

        console.log('API Response:', res); // Debug log

        const data = Array.isArray(res?.Data) ? res.Data : [];

        // Map API response to match table component expectations

        this.services = data.map((service: any) => ({

          id: service.id ?? service.Id,

          name: service.name ?? service.Name,

          category: service.categoryName ?? service.CategoryName ?? 'Uncategorized',

          categoryId: service.categoryId ?? service.CategoryId,

          description: service.description ?? service.Description ?? '',

          status: (service.isActive ?? service.IsActive) ? 'Active' : 'Inactive',

        }));

        console.log('Mapped services:', this.services); // Debug log

        this.isLoading = false;

      },

      error: (err) => {

        console.error('Error loading services:', err);

        this.services = [];

        this.isLoading = false;

      }

    });

  }



  // Open modal

  openModal() {

    this.isModalOpen = true;
  }



  // Save new service

  saveNewService(formData: any) {

    // Map form fields to backend expected format

    const serviceData = {

      Name: formData.name,

      CategoryId: parseInt(formData.category, 10),

      Description: formData.description || ''

    };

    

    // Call API to create new service

    this.api.createService(serviceData).subscribe({

      next: (res: any) => {

        console.log('Service created successfully:', res);

        

        // Reload services to get updated list from API

        this.loadServices();

        

        // Close modal

        this.isModalOpen = false;

      },

      error: (err) => {

        console.error('Error creating service:', err);

        // Optionally show error message to user

        alert('Failed to create service. Please try again.');

      }

    });

  }



  // Toggle service status between Active and Inactive

  toggleServiceStatus(service: any) {

    const serviceId = service?.id;

    if (serviceId == null) {

      console.error('Unable to toggle service: invalid id', service);

      return;

    }

    const newStatus = service.status === 'Active' ? 'Inactive' : 'Active';

    this.api.updateServiceStatus(serviceId, newStatus, service).subscribe({

      next: () => {

        console.log('Service status updated successfully');

        this.loadServices(false);

      },

      error: (err) => {

        console.error('Error toggling service status:', err);

        alert('Failed to update service status. Please try again.');

      }

    });

  }

}

