// FILE: manage-services.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Your shared components
import { ManageServicesTableComponent } from '../../../../shared/components/table/manage-services/manage-services-table.component';

import { AddButtonComponent } from '../../../../shared/components/button/add-button/add-button.component';

import { ServiceFormModalComponent } from '../../../../shared/components/modals/service-form-modal.component';

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
  // Mock service data
  services: any[] = [
    {
      id: 1,
      name: 'Web Development',
      category: 'IT Services',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Logo Design',
      category: 'Graphics',
      status: 'Inactive',
    },
  ];

  // Controls modal visibility
  isModalOpen = false;

  ngOnInit(): void {}

  // Open modal
  openModal() {
    this.isModalOpen = true;

    console.log('Modal Opened');
  }

  // Save new service
  saveNewService(formData: any) {
    const newEntry = {
      ...formData,
      id: Date.now(),
      status: 'Active',
    };

    // Create new array reference (important for table updates)
    this.services = [newEntry, ...this.services];

    // Close modal
    this.isModalOpen = false;
  }
}
