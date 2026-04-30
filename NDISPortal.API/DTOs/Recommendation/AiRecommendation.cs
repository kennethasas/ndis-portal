namespace NDISPortal.API.DTOs.Ai
{
    public class AiRecommendation
    {
        public int ServiceId { get; set; }
        public string Reason { get; set; }
        public double Confidence { get; set; }
        public int Priority { get; set; }
    }
}