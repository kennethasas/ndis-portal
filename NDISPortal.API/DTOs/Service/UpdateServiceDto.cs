using System.ComponentModel.DataAnnotations;

namespace Service.API.DTOs.Service
{
    public class UpdateServiceDto
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public string Description { get; set; }

        public bool is_active { get; set; }
    }
}