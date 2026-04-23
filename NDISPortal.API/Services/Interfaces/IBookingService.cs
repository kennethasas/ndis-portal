using NdisPortal.BookingsApi.DTOs;

namespace NdisPortal.BookingsApi.Services.Interfaces
{
    public interface IBookingService
    {
        Task<IEnumerable<BookingsListDto>> GetBookingsAsync(int currentUserId, string currentUserRole, string? status);
        Task<BookingResponseDto> CreateBookingAsync(int currentUserId, BookingCreateDto createDto);
        Task<BookingResponseDto?> UpdateBookingStatusAsync(int id, BookingStatusUpdateDto updateDto);
    }
}