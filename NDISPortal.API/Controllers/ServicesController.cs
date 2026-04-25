using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NDISPortal.API.Services.Interfaces;
using Service.API.DTOs.Service;

namespace Service.API.Controllers
{
    [Route("api/services")]
    [ApiController]
    public class ServicesController : ControllerBase
    {
        private readonly IServiceService _service;

        public ServicesController(IServiceService service)
        {
            _service = service;
        }

        // GET: api/services
        // Public endpoint - returns active services only
        // Optional filter: api/services?categoryId=1
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ServiceDto>>> GetServices([FromQuery] int? categoryId)
        {
            var services = await _service.GetAllAsync(categoryId);
            return Ok(services);
        }

        // GET: api/services/5
        // Public endpoint - returns one active service
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ServiceDto>> GetServiceItem(int id)
        {
            var service = await _service.GetByIdAsync(id);

            if (service == null)
            {
                return NotFound(new
                {
                    message = "Service not found or inactive."
                });
            }

            return Ok(service);
        }

        // POST: api/services
        // Coordinator only
        // POST: api/services
        [HttpPost]
        [Authorize(Roles = "Coordinator")]
        public async Task<ActionResult<ServiceDto>> PostServiceItem(CreateServiceDto dto)
        {
            var created = await _service.CreateAsync(dto);

            return CreatedAtAction(nameof(GetServiceItem), new { id = created.Id }, created);
        }

        // PUT: api/services/5
        // Coordinator only
        [HttpPut("{id}")]
        [Authorize(Roles = "Coordinator")]
        public async Task<IActionResult> PutServiceItem(int id, UpdateServiceDto dto)
        {

            var updated = await _service.UpdateAsync(id, dto);

            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        // DELETE: api/services/5
        // Coordinator only
        // Soft delete: set is_active = false
        [HttpDelete("{id}")]
        [Authorize(Roles = "Coordinator")]
        public async Task<IActionResult> DeleteServiceItem(int id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Service not found."
                });
            }

            return NoContent();
        }
    }
}