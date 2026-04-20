using System.ComponentModel.DataAnnotations;

namespace NDISPortal.API.DTOs
{
    public class UpdateSupportWorkerDto
    {
        [Required(ErrorMessage = "Full name is required")]
        [StringLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
        public string FullName { get; set; } = null!;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(150, ErrorMessage = "Email cannot exceed 150 characters")]
        public string Email { get; set; } = null!;

        [StringLength(11, MinimumLength = 11, ErrorMessage = "Phone number must be exactly 11 digits")]
        [RegularExpression(@"^[0-9]{11}$", ErrorMessage = "Phone number must contain exactly 11 digits (0-9 only)")]
        public string? Phone { get; set; }

        [Required(ErrorMessage = "Service ID is required")]
        public int AssignedServiceId { get; set; }
    }
}