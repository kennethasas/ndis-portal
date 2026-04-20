using Microsoft.AspNetCore.Mvc;
using NDISPortal.API.DTOs;
using NDISPortal.API.Services;
using SupportWorkersAPI.Services.Interfaces;

namespace NDISPortal.API.Controllers
{
    [ApiController]
    [Route("api/support-workers")]
    public class SupportWorkersController : ControllerBase
    {
        private readonly ISupportWorkerService _service;

        public SupportWorkersController(ISupportWorkerService service)
        {
            _service = service;
        }

        // GET: api/support-workers
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var workers = await _service.GetAllAsync();
            return Ok(workers);
        }

        // GET: api/support-workers/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var worker = await _service.GetByIdAsync(id);

            if (worker == null)
                return NotFound(new { message = $"Support worker with ID {id} not found" });

            return Ok(worker);
        }

        // POST: api/support-workers
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSupportWorkerDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    message = "Validation failed",
                    errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                });
            }

            try
            {
                var worker = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = worker.Id }, worker);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // PUT: api/support-workers/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSupportWorkerDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    message = "Validation failed",
                    errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                });
            }

            try
            {
                var updated = await _service.UpdateAsync(id, dto);

                if (updated == null)
                    return NotFound(new { message = $"Support worker with ID {id} not found" });

                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // DELETE: api/support-workers/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
                return NotFound(new { message = $"Support worker with ID {id} not found" });

            return NoContent();
        }
    }
}