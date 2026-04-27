import { FormsModule } from '@angular/forms';

import { Component, OnInit } from '@angular/core'; // Added OnInit
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { ServiceSelectComponent } from '../../../../shared/components/select/select-service/select-service.component';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { TextAreaComponent } from '../../../../shared/components/text-area/text-area.component';

import { BookButton } from '../../../../shared/components/button/book-button/book-button.component';
import { BackButton } from '../../../../shared/components/button/back-button/back-button.component';
@Component({
  selector: 'app-booking-service-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ServiceSelectComponent,
    DatePickerComponent,
    TextAreaComponent,
    BookButton, // Added for the confirm action
    BackButton, // Added for navigation
  ],
  templateUrl: './book-service.page.html',
  // You can likely remove the .css file now that we are using Tailwind
})
export class BookServiceComponent implements OnInit {
  bookingData = {
    serviceId: '',
    date: '',
    notes: '',
  };

  // This should ideally come from your ApiService, but kept here for now
  services = [{ id: 'personal-hygiene', label: 'Personal Hygiene Assistance' }];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const preselectedService =
      this.route.snapshot.queryParamMap.get('serviceId');
    if (preselectedService) {
      this.bookingData.serviceId = preselectedService;
    }
  }

  navBack() {
    window.history.back(); //
  }

  confirmBooking() {
    console.log('Final Booking Data:', this.bookingData);
  }
}
