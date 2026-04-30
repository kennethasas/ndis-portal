namespace NDISPortal.API.DTOs.Ai
{
    public class RecommendationDto
    {
        public int ServiceId { get; set; }
        public string ServiceName { get; set; }
        public string CategoryName { get; set; }
        public string Description { get; set; }
        public string Reason { get; set; }
        public double Confidence { get; set; }
    }
}