namespace NDISPortal.API.DTOs.Ai
{
    public class RecommendResponse
    {
        public List<RecommendationDto> Recommendations { get; set; }

        /// <summary>
        /// True if the user's request is outside the scope of available NDIS services
        /// </summary>
        public bool IsOutOfScope { get; set; }

        /// <summary>
        /// Message to display when request is out of scope
        /// </summary>
        public string OutOfScopeMessage { get; set; }
    }
}