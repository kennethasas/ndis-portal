using Microsoft.EntityFrameworkCore;
using NDISPortal.API.DTOs.Ai;
using NDISPortal.API.Models;
using NDISPortal.API.Services.Interfaces;

namespace NDISPortal.API.Services.Implementations
{
    public class AiService : IAiService
    {
        private readonly YourDbContext _context;
        private readonly IClaudeClient _claudeClient;


    public AiService(YourDbContext context, IClaudeClient claudeClient)
        {
            _context = context;
            _claudeClient = claudeClient;
        }

        public async Task<RecommendResponse> GetRecommendationsAsync(RecommendRequest request)
        {
            // 1. Get active services WITH category
            var services = await _context.Services
                .Include(s => s.Category)
                .Where(s => s.IsActive)
                .ToListAsync();

            if (!services.Any())
            {
                return new RecommendResponse
                {
                    Recommendations = new List<RecommendationDto>()
                };
            }

            // 2. Build prompt
            var prompt = BuildPrompt(request, services);

            // 3. Call AI
            var aiRaw = await _claudeClient.SendAsync(prompt);

            // 4. Parse response
            var aiResults = ParseResponse(aiRaw);

            // 5. Map to DTO
            var finalResults = aiResults
                .Where(ai => services.Any(s => s.Id == ai.ServiceId))
                .Select(ai =>
                {
                    var service = services.First(s => s.Id == ai.ServiceId);

                    return new RecommendationDto
                    {
                        ServiceId = service.Id,
                        ServiceName = service.Name,
                        CategoryName = service.Category.Name,
                        Description = service.Description,
                        Reason = ai.Reason,
                        Confidence = ai.Confidence
                    };
                })
                .OrderByDescending(r => r.Confidence)
                .Take(5)
                .ToList();

            return new RecommendResponse
            {
                Recommendations = finalResults
            };
        }

        // 🔹 Build prompt using your DB data
        private string BuildPrompt(RecommendRequest request, List<Service> services)
        {
            var prompt = "You are an NDIS assistant.\n\n";

            prompt += "User needs:\n";
            prompt += $"- Daily Activities: {string.Join(", ", request.Answers?.DailyActivities ?? new List<string>())}\n";
            prompt += $"- Mobility: {request.Answers?.Mobility}\n";
            prompt += $"- Needs Social Support: {request.Answers?.NeedsSocialSupport}\n";
            prompt += $"- Notes: {request.Answers?.Notes}\n\n";

            prompt += "Available services:\n";

            foreach (var s in services)
            {
                prompt += $"ID: {s.Id}\n";
                prompt += $"Name: {s.Name}\n";
                prompt += $"Category: {s.Category.Name}\n";
                prompt += $"Description: {s.Description}\n\n";
            }

            prompt += "Return ONLY JSON:\n";
            prompt += @"[


{
""serviceId"": number,
""reason"": ""string"",
""confidence"": number,
""priority"": number
}
]";


        return prompt;
        }

        // 🔹 Parse AI JSON safely
        private List<AiRecommendation> ParseResponse(string raw)
        {
            try
            {
                return Newtonsoft.Json.JsonConvert
                    .DeserializeObject<List<AiRecommendation>>(raw)
                    ?? new List<AiRecommendation>();
            }
            catch
            {
                return new List<AiRecommendation>();
            }
        }
    }


}
