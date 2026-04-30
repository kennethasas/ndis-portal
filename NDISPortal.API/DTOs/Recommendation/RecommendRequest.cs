namespace NDISPortal.API.DTOs.Ai
{
    public class RecommendRequest
    {
        /// <summary>
        /// User's free-text description of their situation, physical disability, and needs.
        /// Example: "I need help with personal care, preparing meals, and going to community activities."
        /// </summary>
        public string Message { get; set; }
    }
}