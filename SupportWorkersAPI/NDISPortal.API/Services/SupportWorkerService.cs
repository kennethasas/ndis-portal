using Microsoft.EntityFrameworkCore;
using NDISPortal.API.Data;
using NDISPortal.API.DTOs;
using NDISPortal.API.Models;

namespace NDISPortal.API.Services
{
    public class SupportWorkerService : ISupportWorkerService
    {
        private readonly ApplicationDbContext _context;

        public SupportWorkerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<SupportWorkerResponseDto>> GetAllAsync()
        {
            return await _context.SupportWorkers
                .Include(sw => sw.Service)
                .Select(sw => new SupportWorkerResponseDto
                {
                    Id = sw.Id,
                    FullName = $"{sw.FirstName} {sw.LastName}".Trim(),
                    Email = sw.Email,
                    Phone = sw.Phone,
                    ServiceName = sw.Service != null ? sw.Service.Name : ""
                })
                .ToListAsync();
        }

        public async Task<SupportWorkerResponseDto> CreateAsync(CreateSupportWorkerDto dto)
        {
            // Validate phone number
            if (!string.IsNullOrWhiteSpace(dto.Phone))
            {
                var cleanedPhone = new string(dto.Phone.Where(char.IsDigit).ToArray());

                if (cleanedPhone.Length != 11)
                {
                    throw new ArgumentException("Phone number must contain exactly 11 digits");
                }

                if (!cleanedPhone.StartsWith("09"))
                {
                    throw new ArgumentException("Phone number must start with '09'");
                }

                dto.Phone = cleanedPhone;
            }

            // Split FullName into FirstName and LastName
            var nameParts = dto.FullName
                .Trim()
                .Split(' ', StringSplitOptions.RemoveEmptyEntries);

            string firstName;
            string lastName;

            if (nameParts.Length == 1)
            {
                // Only one name provided
                firstName = nameParts[0];
                lastName = "";
            }
            else
            {
                // First part is first name, rest is last name
                firstName = nameParts[0];
                lastName = string.Join(" ", nameParts.Skip(1));
            }

            // Validate service exists
            var service = await _context.Services
                .FirstOrDefaultAsync(s => s.Id == dto.AssignedServiceId);

            if (service == null)
            {
                throw new Exception($"Service with ID {dto.AssignedServiceId} not found");
            }

            var worker = new SupportWorker
            {
                FirstName = firstName,
                LastName = lastName,
                Email = dto.Email.Trim(),
                Phone = dto.Phone,
                ServiceId = dto.AssignedServiceId,
                CreatedDate = DateTime.Now,
                ModifiedDate = DateTime.Now
            };

            _context.SupportWorkers.Add(worker);
            await _context.SaveChangesAsync();

            return new SupportWorkerResponseDto
            {
                Id = worker.Id,
                FullName = $"{worker.FirstName} {worker.LastName}".Trim(),
                Email = worker.Email,
                Phone = worker.Phone,
                ServiceName = service.Name
            };
        }
    }
}