using System.Text.Json;
using NdisPortal.BookingsApi.Common;

namespace NdisPortal.BookingsApi.Middleware;

public class ResponseWrappingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ResponseWrappingMiddleware> _logger;

    public ResponseWrappingMiddleware(RequestDelegate next, ILogger<ResponseWrappingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        // Skip Swagger and non-API requests
        if (context.Request.Path.StartsWithSegments("/swagger"))
        {
            await _next(context);
            return;
        }

        var originalBodyStream = context.Response.Body;
        using var newBodyStream = new MemoryStream();
        context.Response.Body = newBodyStream;

        try
        {
            await _next(context);

            newBodyStream.Seek(0, SeekOrigin.Begin);
            var responseBody = await new StreamReader(newBodyStream).ReadToEndAsync();
            var statusCode = context.Response.StatusCode;

            // Skip wrapping if not JSON
            if (context.Response.ContentType == null ||
                !context.Response.ContentType.Contains("application/json"))
            {
                context.Response.Body = originalBodyStream;
                await context.Response.WriteAsync(responseBody);
                return;
            }

            // Prevent double wrapping
            if (!string.IsNullOrWhiteSpace(responseBody) &&
                responseBody.Contains("\"success\"") &&
                responseBody.Contains("\"data\""))
            {
                context.Response.Body = originalBodyStream;
                await context.Response.WriteAsync(responseBody);
                return;
            }

            // Handle empty responses (like 204 No Content)
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
                Errors = new List<string>()
            };

            var wrappedResponse = JsonSerializer.Serialize(apiResponse, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            context.Response.Body = originalBodyStream;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(wrappedResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while processing the request");

            context.Response.Body = originalBodyStream;
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";

            var errorResponse = ApiResponse<object>.FailResponse(
                "An unexpected error occurred",
                new List<string> { ex.Message }
            );

            var json = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
            await context.Response.WriteAsync(json);
        }
    }

    private static string GetDefaultMessage(int statusCode)
    {
        return statusCode switch
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
}