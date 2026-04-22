using Microsoft.EntityFrameworkCore;
using NDISPortal.API.Data;
using NdisPortal.BookingsApi.DTOs;
using NdisPortal.BookingsApi.Models;
using NdisPortal.BookingsApi.Services.Interfaces;

namespace NdisPortal.BookingsApi.Services.Implementations
{
    public class BookingService : IBookingService
    {
        private readonly application_db_context _context;

        public BookingService(application_db_context context)
        {
            _context = context;
        }

        private static string StatusToString(int status) => status switch
        {
            0 => "Pending",
            1 => "Approved",
            2 => "Cancelled",
            _ => "Unknown"
        };

        private static int? ParseStatusFilter(string? status)
        {
            if (string.IsNullOrWhiteSpace(status))
                return null;

            return status.Trim().ToLower() switch
            {
                "pending" => 0,
                "approved" => 1,
                "cancelled" => 2,
                _ => null
            };
        }

        private static int? ParseCoordinatorUpdateStatus(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                return null;

            return status.Trim().ToLower() switch
            {
                "approved" => 1,
                "cancelled" => 2,
                _ => null
            };
        }

        public async Task<IEnumerable<BookingsListDto>> GetBookingsAsync(int currentUserId, string currentUserRole, string? status)
        {
            int? statusFilter = null;

            if (!string.IsNullOrWhiteSpace(status))
            {
                statusFilter = ParseStatusFilter(status);

                if (statusFilter == null)
                    throw new ArgumentException("Invalid status value. Allowed values are: Pending, Approved, Cancelled.");
            }

            IQueryable<Booking> query = _context.Bookings
                .Include(b => b.Service)
                .Include(b => b.User)
                .AsQueryable();

            if (currentUserRole == "Participant")
            {
                query = query.Where(b => b.UserId == currentUserId);
            }
            else if (currentUserRole == "Coordinator")
            {
                // coordinator sees all
            }
            else
            {
                throw new UnauthorizedAccessException("You are not authorized to access bookings.");
            }

            if (statusFilter.HasValue)
            {
                query = query.Where(b => b.Status == statusFilter.Value);
            }

            var bookings = await query
                .OrderByDescending(b => b.CreatedDate)
                .Select(b => new BookingsListDto
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    ServiceId = b.ServiceId,
                    ServiceName = b.Service != null ? b.Service.Name : string.Empty,
                    ParticipantName = currentUserRole == "Coordinator"
                        ? (b.User != null ? $"{b.User.FirstName} {b.User.LastName}" : string.Empty)
                        : null,
                    PreferredDate = b.BookingDate,
                    Notes = b.Notes,
                    Status = StatusToString(b.Status),
                    CreatedDate = b.CreatedDate,
                    ModifiedDate = b.ModifiedDate
                })
                .ToListAsync();

            return bookings;
        }

        public async Task<BookingResponseDto> CreateBookingAsync(int currentUserId, BookingCreateDto createDto)
        {
            if (createDto.PreferredDate.Date < DateTime.Today)
                throw new ArgumentException("PreferredDate must be today or a future date.");

            var service = await _context.Services
                .FirstOrDefaultAsync(s => s.Id == createDto.ServiceId && s.is_active);

            if (service == null)
                throw new ArgumentException("Service must exist and be active.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId);
            if (user == null)
                throw new ArgumentException("Authenticated user not found.");

            var booking = new Booking
            {
                UserId = currentUserId,
                ServiceId = createDto.ServiceId,
                BookingDate = createDto.PreferredDate.Date,
                Notes = createDto.Notes,
                Status = 0, // Pending only
                CreatedDate = DateTime.UtcNow,
                ModifiedDate = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return new BookingResponseDto
            {
                Id = booking.Id,
                UserId = booking.UserId,
                ServiceId = booking.ServiceId,
                ServiceName = service.Name,
                ParticipantName = $"{user.FirstName} {user.LastName}",
                PreferredDate = booking.BookingDate,
                Notes = booking.Notes,
                Status = StatusToString(booking.Status),
                CreatedDate = booking.CreatedDate,
                ModifiedDate = booking.ModifiedDate
            };
        }

        public async Task<BookingResponseDto?> UpdateBookingStatusAsync(int id, BookingStatusUpdateDto updateDto)
        {
            var booking = await _context.Bookings
                .Include(b => b.Service)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                return null;

            int? newStatus = ParseCoordinatorUpdateStatus(updateDto.Status);

            if (newStatus == null)
                throw new ArgumentException("Invalid status value. Allowed values are: Approved or Cancelled.");

            booking.Status = newStatus.Value;
            booking.ModifiedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new BookingResponseDto
            {
                Id = booking.Id,
                UserId = booking.UserId,
                ServiceId = booking.ServiceId,
                ServiceName = booking.Service?.Name ?? string.Empty,
                ParticipantName = booking.User != null ? $"{booking.User.FirstName} {booking.User.LastName}" : string.Empty,
                PreferredDate = booking.BookingDate,
                Notes = booking.Notes,
                Status = StatusToString(booking.Status),
                CreatedDate = booking.CreatedDate,
                ModifiedDate = booking.ModifiedDate
            };
        }
    }
}