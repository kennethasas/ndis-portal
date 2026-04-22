namespace NdisPortal.BookingsApi.DTOs;

public class BookingsListDto
{
    public int Id { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public string? ParticipantName { get; set; }
    public DateTime BookingDate { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
}