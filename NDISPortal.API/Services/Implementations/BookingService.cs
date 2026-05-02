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

        private static string StatusToString(byte status) => status switch
        {
            0 => "Pending",
            1 => "Approved",
            2 => "Cancelled",
            _ => "Unknown"
        };

        private static int? ParseStatusFilter(string? status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                return null;
            }

            return status.Trim().ToLower() switch
            {
                "pending" => 0,
                "approved" => 1,
                "cancelled" => 2,
                _ => null
            };
        }

        private static int? ParseCoordinatorUpdateStatus(string? status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                return null;
            }

            return status.Trim().ToLower() switch
            {
                "approved" => 1,
                _ => null
            };
        }

        public async Task<IEnumerable<BookingsListDto>> GetBookingsAsync(string? status, string role, int userId)
        {
            int? statusFilter = ParseStatusFilter(status);

            if (!string.IsNullOrWhiteSpace(status) && statusFilter == null)
            {
                throw new ArgumentException("Invalid status value. Allowed values are: Pending, Approved, Cancelled.");
            }

            var normalizedRole = role.Trim();

            IQueryable<Booking> query = _context.Bookings
                .Include(b => b.Service)
                    .ThenInclude(s => s.ServiceCategory)
                .Include(b => b.User)
                .AsQueryable();

            if (normalizedRole.Equals("Participant", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(b => b.UserId == userId);
            }
            else if (normalizedRole.Equals("Coordinator", StringComparison.OrdinalIgnoreCase))
            {
                // Coordinator can see all bookings.
            }
            else
            {
                throw new UnauthorizedAccessException("You are not authorized to access bookings.");
            }

            if (statusFilter.HasValue)
            {
                query = query.Where(b => b.Status == (byte)statusFilter.Value);
            }

            var bookings = await query
                .OrderByDescending(b => b.CreatedDate)
                .Select(b => new BookingsListDto
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    ServiceId = b.ServiceId,
                    ServiceName = b.Service != null ? b.Service.Name : string.Empty,
                    ServiceCategory = b.Service != null && b.Service.ServiceCategory != null
                        ? b.Service.ServiceCategory.Name
                        : string.Empty,
                    ParticipantName = normalizedRole.Equals("Coordinator", StringComparison.OrdinalIgnoreCase)
                        ? b.User != null
                            ? b.User.FirstName + " " + b.User.LastName
                            : string.Empty
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

        public async Task<BookingResponseDto?> GetBookingByIdAsync(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.Service)
                    .ThenInclude(s => s.ServiceCategory)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return null;
            }

            return new BookingResponseDto
            {
                Id = booking.Id,
                UserId = booking.UserId,
                ServiceId = booking.ServiceId,
                ServiceName = booking.Service != null ? booking.Service.Name : string.Empty,
                ServiceCategory = booking.Service != null && booking.Service.ServiceCategory != null
                    ? booking.Service.ServiceCategory.Name
                    : string.Empty,
                ParticipantName = booking.User != null
                    ? booking.User.FirstName + " " + booking.User.LastName
                    : string.Empty,
                PreferredDate = booking.BookingDate,
                Notes = booking.Notes,
                Status = StatusToString(booking.Status),
                CreatedDate = booking.CreatedDate,
                ModifiedDate = booking.ModifiedDate
            };
        }

        public async Task<BookingResponseDto> CreateBookingAsync(BookingCreateDto createDto, int userId)
        {
            if (createDto.ServiceId <= 0)
            {
                throw new ArgumentException("Service ID is required.");
            }

            if (createDto.PreferredDate.Date < DateTime.Today)
            {
                throw new ArgumentException("PreferredDate must be today or a future date.");
            }

            var service = await _context.Services
                .Include(s => s.ServiceCategory)
                .FirstOrDefaultAsync(s => s.Id == createDto.ServiceId && s.is_active);

            if (service == null)
            {
                throw new ArgumentException("Service ID must be active or existing.");
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new ArgumentException("Authenticated user not found.");
            }

            var booking = new Booking
            {
                UserId = userId,
                ServiceId = createDto.ServiceId,
                BookingDate = createDto.PreferredDate.Date,
                Notes = createDto.Notes,
                Status = 0,
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
                ServiceCategory = service.ServiceCategory != null ? service.ServiceCategory.Name : string.Empty,
                ParticipantName = user.FirstName + " " + user.LastName,
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
                    .ThenInclude(s => s.ServiceCategory)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return null;
            }

            int? newStatus = ParseCoordinatorUpdateStatus(updateDto.Status);

            if (newStatus == null)
            {
                throw new ArgumentException("Invalid status value. Allowed value is: Approved.");
            }

            booking.Status = (byte)newStatus.Value;
            booking.ModifiedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new BookingResponseDto
            {
                Id = booking.Id,
                UserId = booking.UserId,
                ServiceId = booking.ServiceId,
                ServiceName = booking.Service != null ? booking.Service.Name : string.Empty,
                ServiceCategory = booking.Service != null && booking.Service.ServiceCategory != null
                    ? booking.Service.ServiceCategory.Name
                    : string.Empty,
                ParticipantName = booking.User != null
                    ? booking.User.FirstName + " " + booking.User.LastName
                    : string.Empty,
                PreferredDate = booking.BookingDate,
                Notes = booking.Notes,
                Status = StatusToString(booking.Status),
                CreatedDate = booking.CreatedDate,
                ModifiedDate = booking.ModifiedDate
            };
        }

        public async Task<bool> DeleteBookingAsync(int id, int userId)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return false;
            }

            if (booking.UserId != userId)
            {
                throw new UnauthorizedAccessException("You can only delete your own booking.");
            }

            if (booking.Status != 0)
            {
                throw new ArgumentException("Only Pending bookings can be deleted.");
            }

            // Soft delete: set status to Cancelled instead of removing
            booking.Status = 2; // 2 = Cancelled
            booking.ModifiedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<BookingStatsDto> GetBookingStatsAsync()
        {
            var bookings = await _context.Bookings.ToListAsync();

            return new BookingStatsDto
            {
                TotalBookings = bookings.Count,
                Pending = bookings.Count(b => b.Status == 0),
                Approved = bookings.Count(b => b.Status == 1),
                Cancelled = bookings.Count(b => b.Status == 2)
            };
        }
    }
}
