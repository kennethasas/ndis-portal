using Microsoft.EntityFrameworkCore;
using NDISPortal.API.Data;
using NDISPortal.API.DTOs.Ai;
using NDISPortal.API.Services.Interfaces;
using Service.API.Model;
using System.Text.Json;

namespace NDISPortal.API.Services.Implementations
{
    public class RecommendationService : IRecommendationService
    {
        private readonly application_db_context _context;
        private readonly IClaudeService _claude;
        private readonly ILogger<RecommendationService> _logger;

        public RecommendationService(
            application_db_context context,
            IClaudeService claude,
            ILogger<RecommendationService> logger)
        {
            _context = context;
            _claude = claude;
            _logger = logger;
        }

        public async Task<RecommendResponse> GetRecommendationsAsync(RecommendRequest request)
        {
            var services = await _context.Services
                .Where(s => s.is_active)
                .Include(s => s.ServiceCategory)
                .ToListAsync();

            if (!services.Any())
            {
                _logger.LogInformation("No active services found");
                return new RecommendResponse
                {
                    Recommendations = new List<RecommendationDto>()
                };
            }

            try
            {
                var prompt = BuildPrompt(request, services);
                _logger.LogInformation("Calling Claude API for recommendations");

                var aiRaw = await _claude.GetRecommendationsAsync(prompt);

                // Extract JSON safely
                var start = aiRaw.IndexOf("[");
                var end = aiRaw.LastIndexOf("]") + 1;

                if (start == -1 || end == 0)
                {
                    _logger.LogError("Invalid AI response format: {response}", aiRaw);
                    throw new Exception("Invalid AI response format");
                }

                var json = aiRaw.Substring(start, end - start);
                _logger.LogDebug("Extracted JSON: {json}", json);

                var aiResults = JsonSerializer.Deserialize<List<AiRecommendation>>(json);

                if (aiResults == null)
                {
                    _logger.LogError("Failed to parse AI response");
                    throw new Exception("Failed to parse AI response");
                }

                var final = new List<RecommendationDto>();

                foreach (var ai in aiResults)
                {
                    var service = services.FirstOrDefault(s => s.Id == ai.ServiceId);
                    if (service == null)
                    {
                        _logger.LogWarning("Service ID {serviceId} not found in database", ai.ServiceId);
                        continue;
                    }

                    final.Add(new RecommendationDto
                    {
                        ServiceId = service.Id,
                        ServiceName = service.Name,
                        CategoryName = service.ServiceCategory?.Name ?? "Unknown",
                        Description = service.Description,
                        Reason = ai.Reason,
                        Confidence = ai.Confidence
                    });
                }

                _logger.LogInformation("Generated {count} recommendations", final.Count);

                return new RecommendResponse
                {
                    Recommendations = final
                        .OrderByDescending(r => r.Confidence)
                        .ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetRecommendationsAsync");
                throw;
            }
        }

        private string BuildPrompt(RecommendRequest request, List<ServiceItem> services)
        {
            var serviceList = services.Select(s => new
            {
                id = s.Id,
                name = s.Name,
                category = s.ServiceCategory?.Name,
                description = s.Description
            });

            var dailyActivities = request.Answers?.DailyActivities != null && request.Answers.DailyActivities.Any()
                ? string.Join(", ", request.Answers.DailyActivities)
                : "Not specified";

            return $@"You are an NDIS support assistant. Your job is to recommend the most relevant support services based on the participant's needs.

User needs:
- Daily Activities: {dailyActivities}
- Mobility: {request.Answers?.Mobility ?? "Not specified"}
- Needs Social Support: {request.Answers?.NeedsSocialSupport}
- Additional Notes: {request.Answers?.Notes ?? "None"}

Available services:
{JsonSerializer.Serialize(serviceList, new JsonSerializerOptions { WriteIndented = true })}

Task:
Analyze the user's needs and recommend the top 3-5 most relevant services from the list provided.

IMPORTANT INSTRUCTIONS:
- ONLY recommend services from the provided list
- Use the service IDs from the list
- Provide a brief, clear reason for each recommendation
- Assign a confidence score (0.0-1.0) based on how well the service matches the user's needs
- Return STRICT JSON ONLY - no explanations, no markdown, just the JSON array

Return format (ONLY return this, nothing else):
[
  {{
    ""serviceId"": <id>,
    ""reason"": ""<brief explanation of why this service is recommended>"",
    ""confidence"": <0.0-1.0>
  }},
  ...
]";
        }
    }
}