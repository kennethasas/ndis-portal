namespace NdisPortal.BookingsApi.DTOs
{
    public class BookingStatsDto
    {
        public int TotalBookings { get; set; }
        public int Pending { get; set; }
        public int Approved { get; set; }
        public int Cancelled { get; set; }
    }
}
