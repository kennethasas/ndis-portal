using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NdisPortal.BookingsApi.DTOs;
using NdisPortal.BookingsApi.Services.Interfaces;
using System.Security.Claims;

namespace NdisPortal.BookingsApi.Controllers
{
    [Route("api/bookings")]
    [ApiController]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _service;

        public BookingsController(IBookingService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetBookings([FromQuery] string? status)
        {
            var roleClaim =
                User.FindFirst(ClaimTypes.Role)?.Value ??
                User.FindFirst("role")?.Value;

            var userIdClaim =
                User.FindFirst("userId")?.Value ??
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("sub")?.Value;

            if (string.IsNullOrWhiteSpace(roleClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Missing or invalid claims." });

            var bookings = await _service.GetBookingsAsync(status, roleClaim, userId);
            return Ok(bookings);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBooking(int id)
        {
            var roleClaim =
                User.FindFirst(ClaimTypes.Role)?.Value ??
                User.FindFirst("role")?.Value;

            var userIdClaim =
                User.FindFirst("userId")?.Value ??
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("sub")?.Value;

            if (string.IsNullOrWhiteSpace(roleClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Missing or invalid claims." });

            var booking = await _service.GetBookingByIdAsync(id);

            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            if (roleClaim.Equals("Participant", StringComparison.OrdinalIgnoreCase) && booking.UserId != userId)
                return Forbid();

            return Ok(booking);
        }

        [HttpPost]
        [Authorize(Roles = "Participant")]
        public async Task<IActionResult> PostBooking(BookingCreateDto dto)
        {
            var userIdClaim =
                User.FindFirst("userId")?.Value ??
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("sub")?.Value;

            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Missing or invalid user claim." });

            var created = await _service.CreateBookingAsync(dto, userId);
            return CreatedAtAction(nameof(GetBooking), new { id = created.Id }, created);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Coordinator")]
        public async Task<IActionResult> PutBookingStatus(int id, BookingStatusUpdateDto dto)
        {
            var updated = await _service.UpdateBookingStatusAsync(id, dto);

            if (updated == null)
                return NotFound(new { message = "Booking not found." });

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Participant")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var userIdClaim =
                User.FindFirst("userId")?.Value ??
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("sub")?.Value;

            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Missing or invalid user claim." });

            try
            {
                var result = await _service.DeleteBookingAsync(id, userId);

                if (!result)
                    return NotFound(new { message = "Booking not found." });

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}