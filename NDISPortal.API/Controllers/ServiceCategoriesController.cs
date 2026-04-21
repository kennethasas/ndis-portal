using Microsoft.AspNetCore.Mvc;
using Service.API.DTOs;
using Service.API.Service.Interface;


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

        // GET: api/ServiceCategories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServiceCategoryDTO>>> GetServiceCategories()
        {
            var categories = await _service.GetAllAsync();
            return Ok(categories);
        }

        // GET: api/ServiceCategories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceCategoryDTO>> GetServiceCategory(int id)
        {
            var category = await _service.GetByIdAsync(id);

            if (category == null)
                return NotFound();

            return Ok(category);
        }

    }
}
