using System.ComponentModel.DataAnnotations.Schema;
using NDIS.API.Model;

namespace Service.API.Model
{
    // Fix: Rename to ServiceItem (Uppercase I) to match the rest of the app
    public class ServiceItem
    {
        public int Id { get; set; }

        [Column("category_id")] // Keeps DB as snake_case
        public int CategoryId { get; set; } // Variable naming is now PascalCase

        [Column("name")]
        public string Name { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; }

        public DateTime created_date { get; set; }
        public DateTime modified_date { get; set; }

        // NAVIGATION PROPERTY
        [ForeignKey("CategoryId")]
        public ServiceCategory ServiceCategory { get; set; }
    }
}