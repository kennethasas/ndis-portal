using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NDISPortal.API.Data;
using NDISPortal.API.Models;

namespace NDISPortal.API.Controllers
{
    [Route("api/support-workers")]
    [ApiController]
    [Authorize(Roles = "Coordinator")]
    public class SupportWorkersController : ControllerBase
    {
        private readonly application_db_context _context;

        public SupportWorkersController(application_db_context context)
        {
            _context = context;
        }

        // GET /api/support-workers
        // Coordinator only
        // Returns all support workers with assigned service name
        [HttpGet]
        public async Task<IActionResult> GetSupportWorkers()
        {
            var workers = await _context.SupportWorkers
                .Include(sw => sw.AssignedService)
                .Select(sw => new
                {
                    id = sw.Id,
                    fullName = ((sw.FirstName ?? "") + " " + (sw.LastName ?? "")).Trim(),
                    email = sw.Email,
                    phone = sw.Phone,
                    assignedServiceId = sw.ServiceId,
                    assignedServiceName = sw.AssignedService != null ? sw.AssignedService.Name : null
                })
                .ToListAsync();

            return Ok(workers);
        }

        // POST /api/support-workers
        // Coordinator only
        // Request body:
        // {
        //   "fullName": "string",
        //   "email": "string",
        //   "phone": "string",
        //   "assignedServiceId": 1
        // }
        [HttpPost]
        public async Task<IActionResult> CreateSupportWorker([FromBody] CreateSupportWorkerRequest request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var cleanedFullName = (request.FullName ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(cleanedFullName))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Full name is required."
                });
            }

            var serviceExists = await _context.Services
                .AnyAsync(s => s.Id == request.AssignedServiceId);

            if (!serviceExists)
            {
                return BadRequest(new
                {
                    success = false,
                    message = $"Service with ID {request.AssignedServiceId} does not exist."
                });
            }

            var normalizedEmail = request.Email.Trim();

            var emailExists = await _context.SupportWorkers
                .AnyAsync(sw => sw.Email == normalizedEmail);

            if (emailExists)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "A support worker with this email already exists."
                });
            }

            var (firstName, lastName) = SplitFullName(cleanedFullName);

            if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Full name must include first name and last name."
                });
            }

            var worker = new SupportWorker
            {
                ServiceId = request.AssignedServiceId,
                FirstName = firstName,
                LastName = lastName,
                Email = normalizedEmail,
                Phone = request.Phone.Trim(),
                CreatedDate = DateTime.UtcNow,
                ModifiedDate = DateTime.UtcNow
            };

            _context.SupportWorkers.Add(worker);
            await _context.SaveChangesAsync();

            var createdWorker = await _context.SupportWorkers
                .Include(sw => sw.AssignedService)
                .Where(sw => sw.Id == worker.Id)
                .Select(sw => new
                {
                    id = sw.Id,
                    fullName = ((sw.FirstName ?? "") + " " + (sw.LastName ?? "")).Trim(),
                    email = sw.Email,
                    phone = sw.Phone,
                    assignedServiceId = sw.ServiceId,
                    assignedServiceName = sw.AssignedService != null ? sw.AssignedService.Name : null
                })
                .FirstAsync();

            return StatusCode(201, createdWorker);
        }

        private static (string FirstName, string LastName) SplitFullName(string fullName)
        {
            var parts = fullName
                .Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);

            if (parts.Length < 2)
            {
                return (string.Empty, string.Empty);
            }

            return (parts[0].Trim(), parts[1].Trim());
        }

        public class CreateSupportWorkerRequest
        {
            [Required]
            [StringLength(150)]
            public string FullName { get; set; } = string.Empty;

            [Required]
            [EmailAddress]
            [StringLength(150)]
            public string Email { get; set; } = string.Empty;

            [Required]
            [StringLength(50)]
            public string Phone { get; set; } = string.Empty;

            [Range(1, int.MaxValue)]
            public int AssignedServiceId { get; set; }
        }
    }
}