using Microsoft.AspNetCore.Mvc;
using NdisPortal.BookingsApi.DTOs;
using NdisPortal.BookingsApi.Services.Interfaces;

namespace NdisPortal.BookingsApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BookingsController(IBookingService bookingService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookingListDto>>> GetBookings([FromQuery] string? status)
    {
        var bookings = await bookingService.GetBookingsAsync(status);
        return Ok(bookings);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookingResponseDto>> GetBooking(int id)
    {
        var booking = await bookingService.GetBookingByIdAsync(id);
        if (booking == null)
            return NotFound($"Booking with ID {id} not found.");

        return Ok(booking);
    }

    [HttpPost]
    public async Task<ActionResult<BookingResponseDto>> CreateBooking([FromBody] BookingCreateDto createDto)
    {
        var result = await bookingService.CreateBookingAsync(createDto);
        return CreatedAtAction(nameof(GetBooking), new { id = result.Id }, result);
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<BookingResponseDto>> UpdateBookingStatus(int id, [FromBody] BookingStatusUpdateDto updateDto)
    {
        var updated = await bookingService.UpdateBookingStatusAsync(id, updateDto);
        if (updated == null)
            return NotFound($"Booking with ID {id} not found.");

        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBooking(int id)
    {
        var deleted = await bookingService.DeleteBookingAsync(id);
        if (!deleted)
            return NotFound($"Booking with ID {id} not found.");

        return NoContent();
    }
}