using Register.API.DTO;
using Register.API.Services.NDISPortal.API.Services;
using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;
using NDISPortal.API.Services.Interfaces;
using NDISPortal.API.Data;
using NdisPortal.BookingsApi.Services.Interfaces;

namespace Register.API.Services
{
    public class ChatService : IChatService
    {
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;
        private readonly ILogger<ChatService> _logger;
        private readonly IServiceService _serviceService;
        private readonly IServiceCategoryService _categoryService;
        private readonly IBookingService _bookingService;
        private readonly application_db_context _context;

        public ChatService(
            IConfiguration config,
            HttpClient httpClient,
            ILogger<ChatService> logger,
            IServiceService serviceService,
            IServiceCategoryService categoryService,
            IBookingService bookingService,
            application_db_context context)
        {
            _config = config;
            _httpClient = httpClient;
            _logger = logger;
            _serviceService = serviceService;
            _categoryService = categoryService;
            _bookingService = bookingService;
            _context = context;
        }

        public async Task<string> SendMessage(ChatRequestDto dto)
        {
            var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown";
            var apiKey = _config["Claude:ApiKey"]?.Trim();
            var model = _config["Claude:Model"]?.Trim() ?? "claude-haiku-4-5";

            var maskedKey = string.IsNullOrWhiteSpace(apiKey)
                ? "NULL"
                : apiKey.Length <= 10
                    ? "TOO_SHORT"
                    : $"{apiKey.Substring(0, 6)}...{apiKey.Substring(apiKey.Length - 4)}";

            _logger.LogInformation("Environment: {Environment}", environmentName);
            _logger.LogInformation("Claude key loaded: {IsLoaded}", !string.IsNullOrWhiteSpace(apiKey));
            _logger.LogInformation("Claude key length: {KeyLength}", apiKey?.Length ?? 0);
            _logger.LogInformation("Claude key preview: {KeyPreview}", maskedKey);
            _logger.LogInformation("Claude model: {Model}", model);

#if DEBUG
            if (_config is IConfigurationRoot root)
            {
                _logger.LogInformation("Configuration Debug View:\n{DebugView}", root.GetDebugView());
            }
#endif

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new Exception("Claude API key is not configured under Claude:ApiKey.");
            }

            var localGuardrailReply = GetGuardrailReply(dto.Message);
            if (localGuardrailReply != null)
            {
                return localGuardrailReply;
            }

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("x-api-key", apiKey);
            _httpClient.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");

            var systemPrompt = await BuildSystemPromptAsync();

            var messages = new List<object>();

            if (dto.ConversationHistory != null && dto.ConversationHistory.Any())
            {
                foreach (var item in dto.ConversationHistory)
                {
                    if (string.IsNullOrWhiteSpace(item.Content))
                        continue;

                    var role = item.Role?.Trim().ToLower() == "assistant" ? "assistant" : "user";

                    messages.Add(new
                    {
                        role,
                        content = item.Content.Trim()
                    });
                }
            }

            messages.Add(new
            {
                role = "user",
                content = dto.Message.Trim()
            });

            var requestBody = new
            {
                model,
                max_tokens = 350,
                temperature = 0.2,
                system = systemPrompt,
                messages
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://api.anthropic.com/v1/messages", content);
            var responseBody = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("Claude response status: {StatusCode}", (int)response.StatusCode);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Claude API error body: {Body}", responseBody);

                throw new HttpRequestException(
                    $"Claude API error ({(int)response.StatusCode}): {responseBody}",
                    null,
                    response.StatusCode);
            }

            using var doc = JsonDocument.Parse(responseBody);

            if (!doc.RootElement.TryGetProperty("content", out var contentArray) ||
                contentArray.ValueKind != JsonValueKind.Array ||
                contentArray.GetArrayLength() == 0)
            {
                return "Sorry, I couldn't generate a response right now. Please speak with your Support Coordinator if you need help.";
            }

            var textParts = new List<string>();

            foreach (var block in contentArray.EnumerateArray())
            {
                if (block.TryGetProperty("type", out var typeProp) &&
                    typeProp.GetString() == "text" &&
                    block.TryGetProperty("text", out var textProp))
                {
                    var text = textProp.GetString();
                    if (!string.IsNullOrWhiteSpace(text))
                    {
                        textParts.Add(text.Trim());
                    }
                }
            }

            var reply = string.Join("\n\n", textParts).Trim();

            if (string.IsNullOrWhiteSpace(reply))
            {
                return "Sorry, I couldn't generate a response right now. Please speak with your Support Coordinator if you need help.";
            }

            return reply;
        }

        private async Task<string> BuildSystemPromptAsync()
        {
            try
            {
                // Fetch service categories
                var categories = await _categoryService.GetAllAsync();
                var categoryList = string.Join("\n", categories.Select(c => $"- {c.Name}"));

                // Fetch services
                var services = await _serviceService.GetAllAsync(null);
                var serviceList = string.Join("\n", services.Select(s => $"- {s.Name} (Category: {s.CategoryName})"));

                return $"""
You are a friendly and helpful support assistant for an NDIS (National Disability Insurance Scheme) participant service portal.

Your role is to:
- Help participants understand the available support services
- Explain what each service category means in plain language
- Guide participants through how to make a booking
- Answer general questions about how the portal works
- Provide general information about the NDIS

Available service categories in this portal:
{categoryList}

Available services in this portal:
{serviceList}

You must always:
- Use plain, clear, and friendly language
- Be patient and supportive
- Keep responses concise — no more than 3 short paragraphs
- Only answer questions related to the NDIS or this portal
- If the user is unsure what to do next, suggest contacting their Support Coordinator or the portal support team

You must never:
- Provide medical advice
- Provide legal advice
- Provide financial or tax advice
- Make specific recommendations about a participant's NDIS plan
- Ask for, collect, store, or reveal personal or sensitive information
- Answer unrelated topics

Behavior rules:
- If the user asks about something unrelated to NDIS or this portal, politely say that you can only help with NDIS and portal questions.
- If the user asks for medical advice, politely say you cannot provide medical advice and suggest speaking with a doctor, nurse, pharmacist, or another qualified healthcare professional.
- If the user asks for legal or financial advice, politely say you cannot provide that advice and suggest speaking with a qualified professional.
- If the user asks for help with their specific plan, funding, eligibility decision, or personal case, explain that you cannot give personal plan advice and suggest speaking with their Support Coordinator.
- Never ask the user for personal details such as full name, address, phone number, date of birth, NDIS number, payment details, passwords, or medical history.
- If you are unsure, say: "I'm not completely sure about that. Please check with your Support Coordinator or the portal support team for the best guidance."

Style:
- Sound warm, calm, and respectful
- Use plain English
- Avoid jargon where possible
- Keep each answer brief and easy to follow
""";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error building system prompt with database data");
                // Fallback to static prompt if database fetch fails
                return """
You are a friendly and helpful support assistant for an NDIS (National Disability Insurance Scheme) participant service portal.

Your role is to:
- Help participants understand the available support services
- Explain what each service category means in plain language
- Guide participants through how to make a booking
- Answer general questions about how the portal works
- Provide general information about the NDIS

You must always:
- Use plain, clear, and friendly language
- Be patient and supportive
- Keep responses concise — no more than 3 short paragraphs
- Only answer questions related to the NDIS or this portal
- If the user is unsure what to do next, suggest contacting their Support Coordinator or the portal support team

You must never:
- Provide medical advice
- Provide legal advice
- Provide financial or tax advice
- Make specific recommendations about a participant's NDIS plan
- Ask for, collect, store, or reveal personal or sensitive information
- Answer unrelated topics
""";
            }
        }

        private static string? GetGuardrailReply(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return "Message cannot be empty.";

            var input = message.Trim().ToLowerInvariant();

            if (ContainsPersonalInfoRequest(input))
            {
                return "I can’t help with sharing or collecting personal information here. For account or booking help, please contact your Support Coordinator or the portal support team.";
            }

            if (IsMedicalRequest(input))
            {
                return "I’m sorry, but I can’t provide medical advice. Please speak with a doctor, pharmacist, or another qualified healthcare professional. If your question relates to your supports, your Support Coordinator may also be able to help.";
            }

            if (IsLegalOrFinancialRequest(input))
            {
                return "I’m sorry, but I can’t provide legal, financial, or tax advice. Please speak with a qualified professional. If you need help understanding portal services, I’m happy to help with that.";
            }

            if (IsUnrelatedToNdisOrPortal(input))
            {
                return "I’m here to help with NDIS and this participant service portal. You can ask me about services, bookings, support categories, or how the portal works.";
            }

            return null;
        }

        private static bool IsMedicalRequest(string input)
        {
            string[] keywords =
            {
                "medication", "medicine", "tablet", "dose", "dosage", "diagnose", "diagnosis",
                "treatment", "prescription", "prescribe", "symptom", "symptoms",
                "what should i take", "what should i do for pain", "drug", "healthcare advice"
            };

            return keywords.Any(k => input.Contains(k));
        }

        private static bool IsLegalOrFinancialRequest(string input)
        {
            string[] keywords =
            {
                "tax", "tax return", "financial advice", "investment", "invest", "superannuation",
                "loan", "mortgage", "legal advice", "lawyer", "sue", "court", "contract"
            };

            return keywords.Any(k => input.Contains(k));
        }

        private static bool ContainsPersonalInfoRequest(string input)
        {
            string[] keywords =
            {
                "my ndis number", "my password", "my bank", "credit card", "debit card",
                "date of birth", "dob", "address", "phone number", "email address",
                "medical history", "full name"
            };

            return keywords.Any(k => input.Contains(k));
        }

        private static bool IsUnrelatedToNdisOrPortal(string input)
        {
            string[] allowedKeywords =
            {
                "ndis", "portal", "booking", "book", "service", "services", "support",
                "support coordinator", "daily personal activities", "community access",
                "therapy supports", "respite care", "support coordination", "participant"
            };

            bool hasAllowedKeyword = allowedKeywords.Any(k => input.Contains(k));

            string[] obviousUnrelatedKeywords =
            {
                "football", "movie", "recipe", "weather", "bitcoin", "stocks",
                "tax return", "medication", "programming", "homework", "travel", "game"
            };

            bool hasObviousUnrelatedKeyword = obviousUnrelatedKeywords.Any(k => input.Contains(k));

            return !hasAllowedKeyword && hasObviousUnrelatedKeyword;
        }
    }
}