import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingFormUi } from '../../../../shared/ui/booking-form/booking-form.ui';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { ServiceDropdownComponent } from '../../../../shared/components/dropdown/service/service-dropdown.component';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { TextAreaComponent } from '../../../../shared/components/text-area/text-area.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-booking-service-page',
  standalone: true,
  imports: [
    CommonModule,
    BookingFormUi,
    FormFieldComponent,
    ServiceDropdownComponent,
    DatePickerComponent,
    TextAreaComponent,
  ],
  templateUrl: './book-service.page.html',
  styleUrls: ['./book-service.page.css'],
})
export class BookServiceComponent {
  bookingData = {
    serviceId: '',
    date: '',
    notes: '',
  };
  services = [{ id: 'personal-hygiene', label: 'Personal Hygiene Assistance' }];


  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Get the serviceId from the query parameters (?serviceId=personal-hygiene)
    const preselectedService = this.route.snapshot.queryParamMap.get('serviceId');
    if (preselectedService) {
      this.bookingData.serviceId = preselectedService;
    }
  }
  
  navBack() {
    window.history.back();
  }
  confirmBooking() {
    console.log('Data:', this.bookingData);
  }
}
