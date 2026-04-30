using NdisPortal.BookingsApi.DTOs;

namespace NdisPortal.BookingsApi.Services.Interfaces
{
    public interface IBookingService
    {
        Task<IEnumerable<BookingsListDto>> GetBookingsAsync(string? status, string role, int userId);

        Task<BookingResponseDto?> GetBookingByIdAsync(int id);

        Task<BookingResponseDto> CreateBookingAsync(BookingCreateDto createDto, int userId);

        Task<BookingResponseDto?> UpdateBookingStatusAsync(int id, BookingStatusUpdateDto updateDto);

        Task<bool> DeleteBookingAsync(int id, int userId);

        Task<BookingStatsDto> GetBookingStatsAsync();
    }
}