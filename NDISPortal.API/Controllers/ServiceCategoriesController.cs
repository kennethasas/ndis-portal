using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NDISPortal.API.Services.Interfaces;
using Service.API.DTOs;

namespace Service.API.Controllers
{
    [Route("api/service-categories")]
    [ApiController]
    public class ServiceCategoriesController : ControllerBase
    {
        private readonly IServiceCategoryService _service;

        public ServiceCategoriesController(IServiceCategoryService service)
        {
            _service = service;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ServiceCategoryDto>>> GetServiceCategories()
        {
            var categories = await _service.GetAllAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ServiceCategoryDto>> GetServiceCategory(int id)
        {
            var category = await _service.GetByIdAsync(id);

            if (category == null)
                return NotFound(new { message = "Service category not found." });

            return Ok(category);
        }
    }
}