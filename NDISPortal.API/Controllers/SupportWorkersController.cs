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
                    fullName = sw.FullName,
                    email = sw.Email,
                    phone = sw.Phone,
                    assignedServiceId = sw.AssignedServiceId,
                    assignedServiceName = sw.AssignedService != null ? sw.AssignedService.Name : null
                })
                .ToListAsync();

            return Ok(workers);
        }

        // POST /api/support-workers
        // Coordinator only
        // Returns 201 with created worker
        [HttpPost]
        public async Task<IActionResult> CreateSupportWorker([FromBody] CreateSupportWorkerRequest request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var serviceExists = await _context.Services
                .AnyAsync(s => s.Id == request.AssignedServiceId);

            if (!serviceExists)
            {
                return BadRequest(new
                {
                    message = $"Service with ID {request.AssignedServiceId} does not exist."
                });
            }

            var emailExists = await _context.SupportWorkers
                .AnyAsync(sw => sw.Email == request.Email);

            if (emailExists)
            {
                return BadRequest(new
                {
                    message = "A support worker with this email already exists."
                });
            }

            var worker = new SupportWorker
            {
                FullName = request.FullName.Trim(),
                Email = request.Email.Trim(),
                Phone = request.Phone.Trim(),
                AssignedServiceId = request.AssignedServiceId,
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
                    fullName = sw.FullName,
                    email = sw.Email,
                    phone = sw.Phone,
                    assignedServiceId = sw.AssignedServiceId,
                    assignedServiceName = sw.AssignedService != null ? sw.AssignedService.Name : null
                })
                .FirstAsync();

            return CreatedAtAction(nameof(GetSupportWorkers), new { id = worker.Id }, createdWorker);
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