using System.Text.Json.Serialization;

namespace Register.API.DTO
{
    public class ChatRequestDto
    {
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("conversationHistory")]
        public List<ConversationHistoryDto> ConversationHistory { get; set; } = new();
    }

    public class ConversationHistoryDto
    {
        [JsonPropertyName("role")]
        public string Role { get; set; } = string.Empty;

        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty;
    }
}