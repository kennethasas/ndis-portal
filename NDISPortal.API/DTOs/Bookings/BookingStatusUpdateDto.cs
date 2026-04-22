using System.ComponentModel.DataAnnotations;

namespace NdisPortal.BookingsApi.DTOs
{
    public class BookingStatusUpdateDto
    {
        [Required]
        [RegularExpression("^(Approved|Cancelled)$", ErrorMessage = "Status must be 'Approved' or 'Cancelled'.")]
        public string Status { get; set; } = string.Empty;
    }
}