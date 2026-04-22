using System.ComponentModel.DataAnnotations;

namespace NdisPortal.BookingsApi.DTOs
{
    public class BookingCreateDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "serviceId is required.")]
        public int ServiceId { get; set; }

        [Required]
        public DateTime PreferredDate { get; set; }

        public string? Notes { get; set; }
    }
}