namespace NDISPortal.API.Services.Interfaces
{
    public interface IClaudeService
    {
        Task<string> GetRecommendationsAsync(string prompt);
    }
}