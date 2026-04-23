using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NdisPortal.BookingsApi.DTOs;
using NdisPortal.BookingsApi.Services.Interfaces;

namespace NdisPortal.BookingsApi.Controllers
{
    [Route("api/bookings")]
    [ApiController]
    [Authorize(Roles = "Participant,Coordinator")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // GET /api/bookings?status=Pending
        // Authenticated - any allowed role
        // Participant: only own bookings
        // Coordinator: all bookings with participant name and service name
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingsListDto>>> GetBookings([FromQuery] string? status)
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized("Invalid token: userId claim is missing.");

            if (string.IsNullOrWhiteSpace(role))
                return Unauthorized("Invalid token: role claim is missing.");

            var bookings = await _bookingService.GetBookingsAsync(userId, role, status);
            return Ok(bookings);
        }

        // POST /api/bookings
        // Participant only
        [HttpPost]
        [Authorize(Roles = "Participant")]
        public async Task<ActionResult<BookingResponseDto>> CreateBooking([FromBody] BookingCreateDto createDto)
        {
            var userIdClaim = User.FindFirst("userId")?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized("Invalid token: userId claim is missing.");

            var result = await _bookingService.CreateBookingAsync(userId, createDto);
            return CreatedAtAction(nameof(GetBookings), new { id = result.Id }, result);
        }

        // PUT /api/bookings/{id}/status
        // Coordinator only
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Coordinator")]
        public async Task<ActionResult<BookingResponseDto>> UpdateBookingStatus(int id, [FromBody] BookingStatusUpdateDto updateDto)
        {
            var updated = await _bookingService.UpdateBookingStatusAsync(id, updateDto);

            if (updated == null)
                return NotFound($"Booking with ID {id} not found.");

            return Ok(updated);
        }
    }
}