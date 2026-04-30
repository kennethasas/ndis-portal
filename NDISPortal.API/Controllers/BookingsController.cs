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

        // GET /api/bookings
        // Authenticated - any role
        // Participant: own bookings only
        // Coordinator: all bookings with participant name and service name
        // Supports ?status=Pending
        [HttpGet]
        public async Task<IActionResult> GetBookings([FromQuery] string? status)
        {
            var roleClaim = GetCurrentUserRole();
            var userId = GetCurrentUserId();

            if (string.IsNullOrWhiteSpace(roleClaim))
            {
                return Unauthorized(new
                {
                    message = "Role claim is missing."
                });
            }

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message = "User ID claim is missing or invalid."
                });
            }

            try
            {
                var bookings = await _service.GetBookingsAsync(status, roleClaim, userId.Value);
                return Ok(bookings);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new
                {
                    message = ex.Message
                });
            }
        }

        // GET /api/bookings/{id}
        // Authenticated - any role
        // Participant: can view only own booking
        // Coordinator: can view any booking
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBooking(int id)
        {
            var roleClaim = GetCurrentUserRole();
            var userId = GetCurrentUserId();

            if (string.IsNullOrWhiteSpace(roleClaim))
            {
                return Unauthorized(new
                {
                    message = "Role claim is missing."
                });
            }

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message = "User ID claim is missing or invalid."
                });
            }

            var booking = await _service.GetBookingByIdAsync(id);

            if (booking == null)
            {
                return NotFound(new
                {
                    message = "Booking not found."
                });
            }

            if (roleClaim.Equals("Participant", StringComparison.OrdinalIgnoreCase) && booking.UserId != userId.Value)
            {
                return StatusCode(403, new
                {
                    message = "You are not allowed to view another participant's booking."
                });
            }

            return Ok(booking);
        }

        // POST /api/bookings
        // Participant only
        // Status is automatically Pending
        [HttpPost]
        [Authorize(Roles = "Participant")]
        public async Task<IActionResult> PostBooking([FromBody] BookingCreateDto dto)
        {
            var userId = GetCurrentUserId();

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message = "Missing or invalid user claim."
                });
            }

            try
            {
                var created = await _service.CreateBookingAsync(dto, userId.Value);

                return CreatedAtAction(
                    nameof(GetBooking),
                    new { id = created.Id },
                    created
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // PUT /api/bookings/{id}/status
        // Coordinator only
        // Body: { "status": "Approved" } or { "status": "Cancelled" }
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Coordinator")]
        public async Task<IActionResult> PutBookingStatus(int id, [FromBody] BookingStatusUpdateDto dto)
        {
            try
            {
                var updated = await _service.UpdateBookingStatusAsync(id, dto);

                if (updated == null)
                {
                    return NotFound(new
                    {
                        message = "Booking not found."
                    });
                }

                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // DELETE /api/bookings/{id}
        // Participant only
        // Participant can only delete their own Pending booking
        [HttpDelete("{id}")]
        [Authorize(Roles = "Participant")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var userId = GetCurrentUserId();

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message = "Missing or invalid user claim."
                });
            }

            try
            {
                var deleted = await _service.DeleteBookingAsync(id, userId.Value);

                if (!deleted)
                {
                    return NotFound(new
                    {
                        message = "Booking not found."
                    });
                }

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new
                {
                    message = ex.Message
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim =
                User.FindFirst("userId")?.Value ??
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("sub")?.Value;

            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }

            return null;
        }

        private string? GetCurrentUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ??
                   User.FindFirst("role")?.Value;
        }

        // GET /api/bookings/stats
        // Coordinator only - returns booking counts by status
        [HttpGet("stats")]
        [Authorize(Roles = "Coordinator")]
        public async Task<IActionResult> GetBookingStats()
        {
            var stats = await _service.GetBookingStatsAsync();
            return Ok(stats);
        }
    }
}