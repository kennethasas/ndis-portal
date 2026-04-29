using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Register.API.DTO;
using Register.API.Services.NDISPortal.API.Services;

namespace NDISPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly ILogger<ChatController> _logger;

        public ChatController(IChatService chatService, ILogger<ChatController> logger)
        {
            _chatService = chatService;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Chat([FromBody] ChatRequestDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Message))
            {
                return BadRequest(new
                {
                    reply = "Message cannot be empty."
                });
            }

            try
            {
                dto.Message = dto.Message.Trim();

                var reply = await _chatService.SendMessage(dto);

                return Ok(new
                {
                    reply
                });
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Claude API HTTP request failed.");

                return StatusCode(ex.StatusCode.HasValue ? (int)ex.StatusCode.Value : 503, new
                {
                    reply = "The AI assistant is temporarily unavailable. Please try again later.",
                    error = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Chat service failed.");

                return StatusCode(503, new
                {
                    reply = "The AI assistant is temporarily unavailable. Please try again later.",
                    error = ex.Message
                });
            }
        }
    }
}