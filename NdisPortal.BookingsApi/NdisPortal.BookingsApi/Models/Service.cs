using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NdisPortal.BookingsApi.Models;

[Table("services")]
public class Service
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("category_id")]
    public int CategoryId { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_date")]
    public DateTime CreatedDate { get; set; }

    [Column("modified_date")]
    public DateTime ModifiedDate { get; set; }

    public ServiceCategory? Category { get; set; }
}