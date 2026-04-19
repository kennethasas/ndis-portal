using Microsoft.AspNetCore.Mvc;
using NDISPortal.API.DTOs;
using NDISPortal.API.Services;

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
            try
            {
                var workers = await _service.GetAllAsync();
                return Ok(workers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/support-workers
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSupportWorkerDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        message = "Validation failed",
                        errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                    });
                }

                var worker = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetAll), new { id = worker.Id }, worker);
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
    }
}