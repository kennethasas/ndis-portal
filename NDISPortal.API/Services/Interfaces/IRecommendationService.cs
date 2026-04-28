using NDISPortal.API.DTOs.Ai;

namespace NDISPortal.API.Services.Interfaces
{
    public interface IRecommendationService
    {
        Task<RecommendResponse> GetRecommendationsAsync(RecommendRequest request);
    }
}