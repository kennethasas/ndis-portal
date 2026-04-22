namespace Service.API.DTOs.Service
{
    public class ServiceDto
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public int CategoryId { get; set; }

        public string CategoryName { get; set; }

        public bool is_active { get; set; }
    }
}