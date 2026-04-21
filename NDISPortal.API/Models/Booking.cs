using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NdisPortal.BookingsApi.Models;

[Table("bookings")]
public class Booking
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("service_id")]
    public int ServiceId { get; set; }

    [Column("booking_date")]
    public DateTime BookingDate { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("status")]
    public int Status { get; set; }

    [Column("created_date")]
    public DateTime CreatedDate { get; set; }

    [Column("modified_date")]
    public DateTime ModifiedDate { get; set; }

    public User? User { get; set; }
    public Service? Service { get; set; }
}