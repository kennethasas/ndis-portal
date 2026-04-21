using NdisPortal.BookingsApi.DTOs;

namespace NdisPortal.BookingsApi.Services.Interfaces;

public interface IBookingService
{
    Task<IEnumerable<BookingListDto>> GetBookingsAsync(string? status);
    Task<BookingResponseDto?> GetBookingByIdAsync(int id);
    Task<BookingResponseDto> CreateBookingAsync(BookingCreateDto createDto);
    Task<BookingResponseDto?> UpdateBookingStatusAsync(int id, BookingStatusUpdateDto updateDto);
    Task<bool> DeleteBookingAsync(int id);
}