namespace NDISPortal.API.DTOs
{
    public class SupportWorkerResponseDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public string ServiceName { get; set; } = null!;
    }
}