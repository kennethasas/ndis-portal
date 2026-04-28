import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageServicesTableComponent } from '../../../../shared/components/table/manage-services/manage-services-table.component';
import { AddButtonComponent } from '../../../../shared/components/button/add-button/add-button.component';

@Component({
  selector: 'app-manage-services',
  standalone: true,
  imports: [CommonModule, ManageServicesTableComponent, AddButtonComponent],
  templateUrl: './manage-services.page.html',
})
export class ManageServicesComponent implements OnInit {
  // Requirement: Listing with Name, Category, Status
  services: any[] = [
    {
      id: 1,
      name: 'Web Development',
      category: 'IT Services',
      status: 'Active',
    },
    { id: 2, name: 'Logo Design', category: 'Graphics', status: 'Inactive' },
  ];

  isModalOpen = false;

  ngOnInit(): void {}

  // Requirement: "Add New Service" opens modal
  openModal() {
    this.isModalOpen = true;
    console.log('Modal Opened');
  }

  // Requirement: Toggle button to activate/deactivate
  handleToggleStatus(service: any) {
    service.status = service.status === 'Active' ? 'Inactive' : 'Active';
  }

  // Requirement: Instant update on save
  saveNewService(formData: any) {
    const newEntry = {
      ...formData,
      id: Date.now(),
      status: 'Active', // Default status for new services
    };
    this.services = [newEntry, ...this.services];
    this.isModalOpen = false;
  }
}
