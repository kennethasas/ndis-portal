export interface Booking {
  id: number;
  userId: number;
  serviceId: number;
  serviceName: string;
  participantName?: string;
  preferredDate: string;
  notes?: string;
  status: string;
  createdDate: string;
  modifiedDate: string;
}

export interface BookingViewModel {
  id: number;
  name?: string;
  service: string;
  category: string;
  date: string;
  status: string;
  notes?: string;
  rawData: Booking;
}
