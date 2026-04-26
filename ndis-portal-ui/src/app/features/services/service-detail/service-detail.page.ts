import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Import RouterModule
import { ServiceDetailUiComponent } from '../../../../shared/ui/service-detail/service-detail.ui';
import { ServiceDetailComponent } from '../../../../shared/components/service-detail/service-detail.component';
import { ApiService } from '../../../core/services/api-service';

@Component({
  selector: 'app-service-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ServiceDetailUiComponent,
    ServiceDetailComponent,
  ],
  templateUrl: './service-detail.page.html',
  styleUrls: ['./service-detail.page.css'],
})
export class ServiceDetailPage implements OnInit {
  // We initialize these as empty or null
  serviceData: any = null;
  includes: any[] = [];

  // Mock Database (In a real app, this would be in a Service file or .NET API)
  /*private servicesDatabase = [
    {
      id: 'personal-hygiene',
      title: 'Personal Hygiene Assistance',
      category: 'Daily Personal Activities',
      description:
        'Our compassionate professionals provide discreet and dignified assistance with daily hygiene routines...',
      items: [
        { name: 'Bathing Support', icon: 'pi pi-bath' },
        { name: 'Grooming & Styling', icon: 'pi pi-user' },
        { name: 'Oral Hygiene', icon: 'pi pi-heart' },
        { name: 'Dressing Assistance', icon: 'pi pi-tag' },
        { name: 'Skincare Routines', icon: 'pi pi-sparkles' },
        { name: 'Toileting Care', icon: 'pi pi-info-circle' },
      ],
    },
    {
      id: 'Meal Preparation Support',
      title: 'Meal Preparation Support',
      category: 'Daily Personal Activities',
      description:
        'Our compassionate professionals provide discreet and dignified assistance with daily hygiene routines...',
      items: [
        { name: 'Bathing Support', icon: 'pi pi-bath' },
        { name: 'Grooming & Styling', icon: 'pi pi-user' },
        { name: 'Oral Hygiene', icon: 'pi pi-heart' },
        { name: 'Dressing Assistance', icon: 'pi pi-tag' },
        { name: 'Skincare Routines', icon: 'pi pi-sparkles' },
        { name: 'Toileting Care', icon: 'pi pi-info-circle' },
      ],
    },
  ];
  */

  constructor(
  private route: ActivatedRoute,
  private router: Router,
  private api: ApiService 
) {}

ngOnInit() {
  const serviceId = this.route.snapshot.paramMap.get('id');

  if (serviceId) {
    this.api.getServiceById(Number(serviceId)).subscribe({
      next: (res: any) => {
        console.log('✅ API SUCCESS:', res);

        const data = res.Data;

        this.serviceData = {
          id: data.id,
          title: data.name || data.title,
          category: data.category,
          description: data.description,
        };

        // Map items - if items exist, use them; otherwise create empty array
        if (data.items && Array.isArray(data.items)) {
          this.includes = data.items.map((item: any) => ({
            name: item.name || item,
            icon: item.icon || 'pi pi-check'
          }));
        } else {
          this.includes = [];
        }

        console.log('📦 Includes:', this.includes);
      },
      error: (err) => {
        console.error('❌ API ERROR:', err); 
      }
    });
  }
}

navBack() {
  window.history.back();
}

processBooking() {
  // Navigate to the booking form route
  this.router.navigate(['/book-new'], {
    queryParams: { serviceId: this.serviceData?.id },
  });
}

/*
  // Inject Router into the constructor
  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}
    

  ngOnInit() {
    const serviceId = this.route.snapshot.paramMap.get('id');
    /* const foundService = this.servicesDatabase.find((s) => s.id === serviceId);

    if (foundService) {
      this.serviceData = {
        id: foundService.id, // Store the ID for the booking context
        title: foundService.title,
        category: foundService.category,
        description: foundService.description,
      };
      this.includes = foundService.items;
    }*/
  }
