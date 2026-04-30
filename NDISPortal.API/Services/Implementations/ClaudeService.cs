using NDISPortal.API.Services.Interfaces;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

public class ClaudeService : IClaudeService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<ClaudeService> _logger;

    public ClaudeService(HttpClient httpClient, IConfiguration config, ILogger<ClaudeService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    public async Task<string> GetRecommendationsAsync(string prompt)
    {
        try
        {
            var apiKey = _config["Claude:ApiKey"];

            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("Claude API key is not configured");
                throw new Exception("Claude API key is not configured");
            }

            var requestBody = new
            {
                model = "claude-3-haiku-20240307",
                max_tokens = 1024,
                messages = new[]
                {
                    new { role = "user", content = prompt }
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages");
            request.Headers.Add("x-api-key", apiKey);
            request.Headers.Add("anthropic-version", "2023-06-01");

            request.Content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            _logger.LogInformation("Sending request to Claude API");
            var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Claude API error: {statusCode} - {response}", response.StatusCode, responseContent);
                throw new Exception($"Claude API error: {response.StatusCode}");
            }

            // Parse the response to extract the content
            using var jsonDoc = JsonDocument.Parse(responseContent);
            var root = jsonDoc.RootElement;

            if (root.TryGetProperty("content", out var contentArray) && contentArray.ValueKind == JsonValueKind.Array)
            {
                var firstContent = contentArray.EnumerateArray().FirstOrDefault();
                if (firstContent.TryGetProperty("text", out var textElement))
                {
                    var text = textElement.GetString();
                    _logger.LogInformation("Received Claude response with text length: {length}", text?.Length ?? 0);
                    return text ?? "";
                }
            }

            _logger.LogError("Unexpected Claude API response structure: {response}", responseContent);
            throw new Exception("Unexpected Claude API response structure");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error communicating with Claude API");
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetRecommendationsAsync");
            throw;
        }
    }
}