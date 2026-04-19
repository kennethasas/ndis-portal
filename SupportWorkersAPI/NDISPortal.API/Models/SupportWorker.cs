using System;
using NDISPortal.API.Models;

namespace NDISPortal.API.Models
{
    public class SupportWorker
    {
        public int Id { get; set; }

        public int ServiceId { get; set; }

        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;

        public string Email { get; set; } = null!;
        public string? Phone { get; set; }

        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }

        // Navigation
        public Service Service { get; set; } = null!;
    }
}