using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NdisPortal.BookingsApi.Models;

[Table("service_categories")]
public class ServiceCategory
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("created_date")]
    public DateTime CreatedDate { get; set; }

    [Column("modified_date")]
    public DateTime ModifiedDate { get; set; }
}