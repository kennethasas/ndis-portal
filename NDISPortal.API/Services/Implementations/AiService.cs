using NDISPortal.API.DTOs.Ai;
using NDISPortal.API.Models;
using NDISPortal.API.Repositories.Interfaces;
using NDISPortal.API.Services.Interfaces;
using Newtonsoft.Json;
using System.Text;
using System.Text.Json.Serialization;

namespace NDISPortal.API.Services.Implementations
{
    public class AiService : IAiService
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IClaudeClient _claudeClient;

    public AiService(IServiceRepository serviceRepository, IClaudeClient claudeClient)
        {
            _serviceRepository = serviceRepository;
            _claudeClient = claudeClient;
        }

        public async Task<RecommendResponse> GetRecommendationsAsync(RecommendRequest request)
        {
            // 1. Get active services with category
            var services = await _serviceRepository.GetActiveServicesAsync();

            if (services == null || !services.Any())
            {
                return new RecommendResponse
                {
                    Recommendations = new List<RecommendationDto>()
                };
            }

            // 2. Build prompt
            var prompt = BuildPrompt(request, services);

            // 3. Call AI (Claude)
            var aiRawResponse = await _claudeClient.SendAsync(prompt);

            // 4. Parse AI response
            var aiRecommendations = ParseAiResponse(aiRawResponse);

            // 5. Map to real services (safe mapping)
            var finalRecommendations = aiRecommendations
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
                Recommendations = finalRecommendations
            };
        }

        // 🔹 Prompt Builder (inline since you don’t have Helpers folder)
        private string BuildPrompt(RecommendRequest request, List<Service> services)
        {
            var sb = new StringBuilder();

            sb.AppendLine("You are an NDIS support assistant.");
            sb.AppendLine("Match user needs to the most relevant services.");
            sb.AppendLine();

            sb.AppendLine("User needs:");
            sb.AppendLine($"- Daily Activities: {string.Join(", ", request.Answers?.DailyActivities ?? new List<string>())}");
            sb.AppendLine($"- Mobility: {request.Answers?.Mobility}");
            sb.AppendLine($"- Needs Social Support: {request.Answers?.NeedsSocialSupport}");
            sb.AppendLine($"- Notes: {request.Answers?.Notes}");
            sb.AppendLine();

            sb.AppendLine("Available services:");

            foreach (var s in services)
            {
                sb.AppendLine($"ID: {s.Id}");
                sb.AppendLine($"Name: {s.Name}");
                sb.AppendLine($"Category: {s.Category.Name}");
                sb.AppendLine($"Description: {s.Description}");
                sb.AppendLine();
            }

            sb.AppendLine("Instructions:");
            sb.AppendLine("- Recommend the most relevant services based on the user's needs");
            sb.AppendLine("- Prioritize direct matches");
            sb.AppendLine("- Maximum of 5 services");
            sb.AppendLine("- Only use the provided service IDs");
            sb.AppendLine();
            sb.AppendLine("Return ONLY JSON in this format:");
            sb.AppendLine(@"[

{
""serviceId"": number,
""reason"": ""string"",
""confidence"": number,
""priority"": number
}
]");


        return sb.ToString();
        }

        // 🔹 AI Response Parser
        private List<AiRecommendation> ParseAiResponse(string raw)
        {
            try
            {
                return JsonConvert.DeserializeObject<List<AiRecommendation>>(raw)
                       ?? new List<AiRecommendation>();
            }
            catch
            {
                return new List<AiRecommendation>();
            }
        }
    }


}
