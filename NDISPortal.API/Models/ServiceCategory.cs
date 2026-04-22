using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Service.API.Model;

namespace NDIS.API.Model
{
    [Table("service_categories")]
    public class ServiceCategory
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        public ICollection<ServiceItem> Services { get; set; } = new List<ServiceItem>();
    }
}