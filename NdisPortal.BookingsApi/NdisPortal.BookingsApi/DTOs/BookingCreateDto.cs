using System.ComponentModel.DataAnnotations;

namespace NdisPortal.BookingsApi.DTOs;

public class BookingCreateDto
{
    [Required(ErrorMessage = "UserId is required")]
    public int UserId { get; set; }

    [Required(ErrorMessage = "ServiceId is required")]
    public int ServiceId { get; set; }

    [Required(ErrorMessage = "PreferredDate is required")]
    public DateTime PreferredDate { get; set; }

    public string? Notes { get; set; }
}