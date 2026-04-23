using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Service.API.Model;

namespace NDISPortal.API.Models
{
    [Table("support_workers")]
    public class SupportWorker
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("service_id")]
        public int ServiceId { get; set; }

        [Required]
        [Column("first_name")]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [Column("last_name")]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("phone")]
        public string Phone { get; set; } = string.Empty;

        [Column("created_date")]
        public DateTime CreatedDate { get; set; }

        [Column("modified_date")]
        public DateTime ModifiedDate { get; set; }

        [ForeignKey(nameof(ServiceId))]
        public ServiceItem? AssignedService { get; set; }
    }
}