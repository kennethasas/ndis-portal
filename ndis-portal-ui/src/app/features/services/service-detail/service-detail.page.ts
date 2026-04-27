import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api-service';
import { ButtonUiComponent } from '../../../../shared/ui/button/button.ui';
import { ServiceItemComponent } from '../../../../shared/components/service-item/service-item.component';

import { BookButton } from '../../../../shared/components/button/book-button/book-button.component';
import { BackButton } from '../../../../shared/components/button/back-button/back-button.component';
@Component({
  selector: 'app-service-detail-page',
  standalone: true,
  // PARENT: Imports the logical components (Smart) and UI units (Dumb)
  imports: [CommonModule, ButtonUiComponent, ServiceItemComponent, BookButton, BackButton],
  templateUrl: './service-detail.page.html',
})
export class ServiceDetailComponent implements OnInit {
  // PARENT STATE: Mapped from the backend response
  serviceData: any = null;
  // PARENT STATE: Array of features used to populate the feature grid
  includes: any[] = [];
  // PARENT STATE: Controls the loading spinner visibility
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
  ) {}

  ngOnInit() {
    // CAPTURE: Retrieve the unique ID from the URL parameter
    const serviceId = this.route.snapshot.paramMap.get('id');

    if (serviceId) {
      // ORCHESTRATION: Call API and map results to the page state
      this.api.getServiceById(Number(serviceId)).subscribe({
        next: (res: any) => {
          const data = res.Data; // Standard backend wrapper

          // MAPPING: Align API data with template property requirements
          this.serviceData = {
            id: data.id,
            title: data.name || data.title,
            category: data.category,
            description: data.description,
          };

          // MAPPING: Ensure feature items are formatted as objects
          this.includes = (data.items || []).map((item: any) => ({
            name: item.name || item,
            icon: item.icon || 'pi pi-check',
          }));

          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
    }
  }

  // ACTION: Navigates back in the browser history
  navBack() {
    window.history.back();
  }

  // ACTION: Routes to booking with the service ID as a query parameter
  processBooking() {
    this.router.navigate(['/book-new'], {
      queryParams: { serviceId: this.serviceData?.id },
    });
  }
}
