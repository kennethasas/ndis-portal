using NDISPortal.API.DTOs.Ai;
using NDISPortal.API.Services.Interfaces;
using Service.API.DTOs;
using Service.API.DTOs.Service;
using System.Text.Json;

namespace NDISPortal.API.Services.Implementations
{
    public class RecommendationService : IRecommendationService
    {
        private readonly IServiceService _serviceService;
        private readonly IServiceCategoryService _categoryService;
        private readonly IClaudeService _claude;
        private readonly ILogger<RecommendationService> _logger;

        public RecommendationService(
            IServiceService serviceService,
            IServiceCategoryService categoryService,
            IClaudeService claude,
            ILogger<RecommendationService> logger)
        {
            _serviceService = serviceService;
            _categoryService = categoryService;
            _claude = claude;
            _logger = logger;
        }

        public async Task<RecommendResponse> GetRecommendationsAsync(RecommendRequest request)
        {
            // Fetch active services with their categories via Service API
            var serviceDtos = await _serviceService.GetAllAsync(null);
            var services = serviceDtos.ToList();

            // Fetch all service categories via Service Category API
            var categoryDtos = await _categoryService.GetAllAsync();
            var categories = categoryDtos.ToList();

            if (!services.Any() || !categories.Any())
            {
                _logger.LogInformation("No active services or categories found");
                return new RecommendResponse
                {
                    Recommendations = new List<RecommendationDto>(),
                    IsOutOfScope = true,
                    OutOfScopeMessage = "Sorry, no services are currently available."
                };
            }

            try
            {
                var prompt = BuildPrompt(request, services, categories);
                _logger.LogInformation("Calling Claude API for recommendations");

                string aiRaw;
                try
                {
                    aiRaw = await _claude.GetRecommendationsAsync(prompt);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Claude API call failed with error: {message}", ex.Message);
                    // Fallback: return simple keyword-based recommendations
                    return GetFallbackRecommendations(request, services, categories);
                }

                // Check if AI indicates out-of-scope
                if (aiRaw.Contains("OUT_OF_SCOPE", StringComparison.OrdinalIgnoreCase) ||
                    aiRaw.Contains("beyond the scope", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogInformation("AI determined request is out of scope");
                    return new RecommendResponse
                    {
                        Recommendations = new List<RecommendationDto>(),
                        IsOutOfScope = true,
                        OutOfScopeMessage = "Sorry, this request is outside the scope of NDIS disability support services. We can only assist with personal care, community access, therapy, respite care, and plan coordination services. For financial, legal, or medical advice, please consult appropriate professionals."
                    };
                }

                // Extract JSON safely
                var start = aiRaw.IndexOf("[");
                var end = aiRaw.LastIndexOf("]") + 1;

                if (start == -1 || end == 0)
                {
                    _logger.LogError("Invalid AI response format: {response}", aiRaw);
                    // Fallback to keyword matching
                    return GetFallbackRecommendations(request, services, categories);
                }

                var json = aiRaw.Substring(start, end - start);
                _logger.LogDebug("Extracted JSON: {json}", json);

                List<AiRecommendation> aiResults;
                try
                {
                    aiResults = JsonSerializer.Deserialize<List<AiRecommendation>>(json);
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Failed to parse AI JSON response");
                    // Fallback to keyword matching
                    return GetFallbackRecommendations(request, services, categories);
                }

                if (aiResults == null || !aiResults.Any())
                {
                    _logger.LogInformation("AI returned no recommendations");
                    return new RecommendResponse
                    {
                        Recommendations = new List<RecommendationDto>(),
                        IsOutOfScope = true,
                        OutOfScopeMessage = "Sorry, we couldn't find any suitable NDIS services matching your needs. Our available categories are: Daily Personal Activities, Community Access, Therapy Supports, Respite Care, and Support Coordination."
                    };
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
                        CategoryName = service.CategoryName ?? "Unknown",
                        Description = service.Description,
                        Reason = ai.Reason,
                        Confidence = ai.Confidence
                    });
                }

                // If no valid services matched after filtering
                if (!final.Any())
                {
                    _logger.LogInformation("No valid service matches after filtering AI results");
                    return new RecommendResponse
                    {
                        Recommendations = new List<RecommendationDto>(),
                        IsOutOfScope = true,
                        OutOfScopeMessage = "Sorry, we couldn't find any suitable NDIS services matching your needs. Available categories: Daily Personal Activities, Community Access, Therapy Supports, Respite Care, and Support Coordination."
                    };
                }

                _logger.LogInformation("Generated {count} recommendations", final.Count);

                return new RecommendResponse
                {
                    Recommendations = final
                        .OrderByDescending(r => r.Confidence)
                        .ToList(),
                    IsOutOfScope = false,
                    OutOfScopeMessage = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetRecommendationsAsync");
                throw;
            }
        }

        private string BuildPrompt(RecommendRequest request, List<ServiceDto> services, List<ServiceCategoryDto> categories)
        {
            var categoryList = categories.Select(c => new
            {
                id = c.Id,
                name = c.Name
            });

            var serviceList = services.Select(s => new
            {
                id = s.Id,
                name = s.Name,
                category = s.CategoryName,
                categoryId = s.CategoryId,
                description = s.Description
            });

            return $@"You are an NDIS support assistant. Your job is to recommend the most relevant NDIS support services based on the participant's situation and needs.

USER'S SITUATION AND NEEDS:
""""{request.Message}""""

AVAILABLE SERVICE CATEGORIES (you may ONLY recommend services from these categories):
{JsonSerializer.Serialize(categoryList, new JsonSerializerOptions { WriteIndented = true })}

AVAILABLE SERVICES (you may ONLY recommend from this exact list):
{JsonSerializer.Serialize(serviceList, new JsonSerializerOptions { WriteIndented = true })}

TASK:
Analyze the user's situation and recommend the top 3-5 most relevant services from the AVAILABLE SERVICES list provided.

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. ONLY recommend services that exist in the AVAILABLE SERVICES list above
2. ONLY recommend services whose category exists in the AVAILABLE SERVICE CATEGORIES list
3. If the user's needs do not match any available service categories or services, respond with: OUT_OF_SCOPE
4. If the request is unrelated to NDIS disability support services (e.g., medical advice, legal issues, non-NDIS topics), respond with: OUT_OF_SCOPE
5. Use the exact service IDs from the provided list
6. Provide a brief, clear reason explaining how the service matches the user's specific needs
7. Assign a confidence score (0.0-1.0) based on how well the service matches the user's needs

OUT OF SCOPE EXAMPLES (respond with OUT_OF_SCOPE if user asks for):
- Medical diagnoses or treatment advice
- Legal or financial advice unrelated to NDIS
- Services not related to disability support
- Requests completely unrelated to the available service categories

Return format - STRICT JSON ONLY:
[
  {{
    ""serviceId"": <id>,
    ""reason"": ""<brief explanation of why this service matches the user's specific needs>"",
    ""confidence"": <0.0-1.0>
  }},
  ...
]

OR if out of scope, respond with exactly:
OUT_OF_SCOPE";
        }

        /// <summary>
        /// Fallback method that uses simple keyword matching when Claude API is unavailable
        /// </summary>
        private RecommendResponse GetFallbackRecommendations(
            RecommendRequest request,
            List<ServiceDto> services,
            List<ServiceCategoryDto> categories)
        {
            _logger.LogInformation("Using fallback keyword matching for recommendations. Available categories: {categories}",
                string.Join(", ", categories.Select(c => c.Name)));

            var message = request.Message?.ToLowerInvariant() ?? "";

            // Build dynamic keyword mappings based on actual database category names
            var categoryKeywords = new Dictionary<string[], string>();

            foreach (var category in categories)
            {
                var catName = category.Name.ToLowerInvariant();
                var keywords = new List<string> { catName };

                // Add common synonyms based on category name patterns
                if (catName.Contains("personal") || catName.Contains("daily"))
                    keywords.AddRange(new[] { "personal", "daily activities", "bathing", "dressing", "grooming", "hygiene", "toilet", "shower", "clean", "help with" });
                if (catName.Contains("community") || catName.Contains("social"))
                    keywords.AddRange(new[] { "community", "social", "outing", "going out", "walk", "walking", "mobility", "transport" });
                if (catName.Contains("therapy") || catName.Contains("therapist"))
                    keywords.AddRange(new[] { "therapy", "therapist", "occupational", "speech", "physical", "communication", "skills" });
                if (catName.Contains("respite") || catName.Contains("accommodation"))
                    keywords.AddRange(new[] { "respite", "accommodation", "short term", "temporary", "break" });
                if (catName.Contains("coordination") || catName.Contains("plan"))
                    keywords.AddRange(new[] { "plan", "coordination", "management", "coordinate", "plan manager" });

                // Also match if user's message contains the category name directly
                if (!categoryKeywords.ContainsKey(keywords.ToArray()))
                {
                    categoryKeywords[keywords.ToArray()] = category.Name;
                }
            }

            // Track matched keywords per category for better reasoning
            var categoryToKeywords = new Dictionary<string, List<string>>();
            foreach (var kvp in categoryKeywords)
            {
                var matchedKeywords = kvp.Key.Where(keyword => message.Contains(keyword.ToLowerInvariant())).ToList();
                if (matchedKeywords.Any())
                {
                    if (!categoryToKeywords.ContainsKey(kvp.Value))
                        categoryToKeywords[kvp.Value] = new List<string>();
                    categoryToKeywords[kvp.Value].AddRange(matchedKeywords);
                }
            }

            var matchedCategories = categoryToKeywords.Keys.ToHashSet();

            // Find services in matched categories
            var matchedServices = services
                .Where(s => matchedCategories.Contains(s.CategoryName ?? ""))
                .Take(5)
                .ToList();

            if (!matchedServices.Any())
            {
                // Try broader keyword matching on service names/descriptions
                var keywords = message.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                    .Where(w => w.Length > 3)
                    .ToList();

                matchedServices = services
                    .Where(s => keywords.Any(k => 
                        (s.Name?.ToLowerInvariant()?.Contains(k) ?? false) || 
                        (s.Description?.ToLowerInvariant()?.Contains(k) ?? false)))
                    .Take(5)
                    .ToList();
            }

            if (!matchedServices.Any())
            {
                var availableCategories = string.Join(", ", categories.Select(c => c.Name));
                return new RecommendResponse
                {
                    Recommendations = new List<RecommendationDto>(),
                    IsOutOfScope = true,
                    OutOfScopeMessage = $"Sorry, we couldn't find any suitable NDIS services matching your needs. Available categories: {availableCategories}. For financial, legal, or medical advice, please consult appropriate professionals."
                };
            }

            // Generate specific reasons based on matched keywords
            var recommendations = matchedServices.Select(s =>
            {
                var categoryName = s.CategoryName ?? "Unknown";
                var categoryKeywords = categoryToKeywords.GetValueOrDefault(categoryName, new List<string>());
                var reason = GenerateReason(s.Name, categoryName, s.Description, categoryKeywords, message);
                var confidence = CalculateConfidence(categoryKeywords.Count, message.Length);

                return new RecommendationDto
                {
                    ServiceId = s.Id,
                    ServiceName = s.Name,
                    CategoryName = categoryName,
                    Description = s.Description,
                    Reason = reason,
                    Confidence = confidence
                };
            }).ToList();

            return new RecommendResponse
            {
                Recommendations = recommendations,
                IsOutOfScope = false,
                OutOfScopeMessage = null
            };
        }

        /// <summary>
        /// Generates a contextual reason based on matched keywords and service details
        /// </summary>
        private string GenerateReason(string serviceName, string categoryName, string description, List<string> matchedKeywords, string userMessage)
        {
            if (!matchedKeywords.Any())
            {
                return $"This {categoryName} service may be relevant to your situation.";
            }

            // Build specific reasons based on keywords and category
            var keywordReasons = new List<string>();

            foreach (var keyword in matchedKeywords.Take(2))
            {
                var reason = keyword switch
                {
                    "cant walk" or "paralyzed" or "wheelchair" or "bedridden" => 
                        "mobility challenges",
                    "bathing" or "shower" or "hygiene" or "clean" or "toilet" => 
                        "personal care needs",
                    "dressing" or "grooming" => 
                        "help getting dressed",
                    "community" or "social" or "outing" or "going out" => 
                        "community engagement",
                    "walk" or "walking" or "mobility" or "transport" => 
                        "getting around",
                    "therapy" or "therapist" or "occupational" or "speech" => 
                        "skill development",
                    "respite" or "accommodation" or "place to stay" => 
                        "temporary support",
                    "plan" or "coordination" or "management" => 
                        "plan management",
                    "vision" or "seeing" or "blind" => 
                        "vision support needs",
                    "help with" or "assistance with" => 
                        "daily assistance",
                    _ => null
                };

                if (reason != null && !keywordReasons.Contains(reason))
                {
                    keywordReasons.Add(reason);
                }
            }

            // Build the final reason
            if (keywordReasons.Any())
            {
                var reasonsText = string.Join(" and ", keywordReasons);
                return $"Helps with {reasonsText}: {description}";
            }

            return $"Supports your needs: {description}";
        }

        /// <summary>
        /// Calculate confidence score based on keyword match strength
        /// </summary>
        private double CalculateConfidence(int keywordCount, int messageLength)
        {
            // Base confidence
            var baseConfidence = 0.5;
            
            // Increase for more keyword matches (up to 0.25)
            var keywordBoost = Math.Min(keywordCount * 0.1, 0.25);
            
            // Message length factor (longer messages = more context = slightly higher confidence)
            var lengthFactor = Math.Min(messageLength / 100.0 * 0.05, 0.1);
            
            return Math.Round(Math.Min(baseConfidence + keywordBoost + lengthFactor, 0.95), 2);
        }
    }
}