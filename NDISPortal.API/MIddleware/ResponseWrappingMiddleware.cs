using System.Text.Json;
using NdisPortal.BookingsApi.Common;

namespace NdisPortal.BookingsApi.Middleware;

public class ResponseWrappingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ResponseWrappingMiddleware> _logger;

    // Cached to avoid creating new instances
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ResponseWrappingMiddleware(RequestDelegate next, ILogger<ResponseWrappingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/swagger"))
        {
            await _next(context);
            return;
        }

        var originalBodyStream = context.Response.Body;
        await using var newBodyStream = new MemoryStream();
        context.Response.Body = newBodyStream;

        try
        {
            await _next(context);

            newBodyStream.Seek(0, SeekOrigin.Begin);
            var responseBody = await new StreamReader(newBodyStream).ReadToEndAsync();
            var statusCode = context.Response.StatusCode;

            if (context.Response.ContentType is not null &&
                !context.Response.ContentType.Contains("application/json"))
            {
                context.Response.Body = originalBodyStream;
                await context.Response.WriteAsync(responseBody);
                return;
            }

            if (!string.IsNullOrWhiteSpace(responseBody) &&
                responseBody.Contains("\"success\"") &&
                responseBody.Contains("\"data\""))
            {
                context.Response.Body = originalBodyStream;
                await context.Response.WriteAsync(responseBody);
                return;
            }

            object? data = null;
            if (!string.IsNullOrWhiteSpace(responseBody) && responseBody != "{}")
            {
                try
                {
                    data = JsonSerializer.Deserialize<object>(responseBody, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }
                catch (JsonException)
                {
                    data = responseBody;
                }
            }

            var apiResponse = new ApiResponse<object>
            {
                Success = statusCode >= 200 && statusCode < 300,
                Data = data,
                Message = GetDefaultMessage(statusCode),
                Errors = []
            };

            var wrappedResponse = JsonSerializer.Serialize(apiResponse, _jsonOptions);

            context.Response.Body = originalBodyStream;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(wrappedResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred");

            context.Response.Body = originalBodyStream;
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";

            var errorResponse = ApiResponse<object>.FailResponse(
                "An unexpected error occurred",
                new List<string> { ex.Message }
            );

            var json = JsonSerializer.Serialize(errorResponse, _jsonOptions);
            await context.Response.WriteAsync(json);
        }
    }

    private static string GetDefaultMessage(int statusCode) => statusCode switch
    {
        200 => "Request successful",
        201 => "Created successfully",
        204 => "No content",
        400 => "Bad request",
        401 => "Unauthorized",
        403 => "Forbidden",
        404 => "Not found",
        409 => "Conflict",
        500 => "Internal server error",
        _ => "Request processed"
    };
}