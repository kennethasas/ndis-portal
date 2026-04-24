using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NDISPortal.API.Services.Interfaces;
using Service.API.DTOs;

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

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ServicesDto>>> GetServices([FromQuery] int? categoryId)
        {
            var services = await _service.GetAllAsync(categoryId);
            return Ok(services);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ServicesDto>> GetServiceItem(int id)
        {
            var service = await _service.GetByIdAsync(id);

            if (service == null)
                return NotFound(new { message = "Service not found or inactive." });

            return Ok(service);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Coordinator")]
        public async Task<IActionResult> PutServiceItem(int id, ServicesDto dto)
        {
            if (id != dto.Id)
                return BadRequest();

            var updated = await _service.UpdateAsync(id, dto);

            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        [HttpPost]
        [Authorize(Roles = "Coordinator")]
        public async Task<ActionResult<ServicesDto>> PostServiceItem(ServicesDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetServiceItem), new { id = created.Id }, created);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Coordinator")]
        public async Task<IActionResult> DeleteServiceItem(int id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}