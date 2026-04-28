using System.Text.Json;
using Service.API.Commons;

namespace NDISPortalErrorHandling.Middleware
{
    public class error_handling_middleware
    {
        private readonly RequestDelegate _next;

        public error_handling_middleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
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

                var statusCode = context.Response.StatusCode;

                newBodyStream.Seek(0, SeekOrigin.Begin);
                var responseBody = await new StreamReader(newBodyStream).ReadToEndAsync();

                context.Response.Body = originalBodyStream;

                // IMPORTANT: 204 must not have response body
                if (statusCode == StatusCodes.Status204NoContent ||
                    statusCode == StatusCodes.Status304NotModified)
                {
                    context.Response.ContentLength = null;
                    return;
                }

                if (context.Response.ContentType != null &&
                    !context.Response.ContentType.Contains("application/json"))
                {
                    await context.Response.WriteAsync(responseBody);
                    return;
                }

                if (!string.IsNullOrWhiteSpace(responseBody) &&
                    responseBody.Contains("\"success\"") &&
                    responseBody.Contains("\"data\""))
                {
                    await context.Response.WriteAsync(responseBody);
                    return;
                }

                object? data = null;

                if (!string.IsNullOrWhiteSpace(responseBody))
                {
                    data = JsonSerializer.Deserialize<object>(
                        responseBody,
                        new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });
                }

                var apiResponse = new api_response<object>
                {
                    Success = statusCode >= 200 && statusCode < 300,
                    Data = data,
                    Message = statusCode switch
                    {
                        200 => "Request successful",
                        201 => "Created successfully",
                        204 => "No content",
                        400 => "Bad request",
                        401 => "Unauthorized",
                        403 => "Forbidden",
                        404 => "Not found",
                        500 => "Internal server error",
                        _ => "Request processed"
                    },
                    Errors = new List<string>()
                };

                var wrappedResponse = JsonSerializer.Serialize(apiResponse);

                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(wrappedResponse);
            }
            catch (Exception ex)
            {
                if (context.Response.HasStarted)
                {
                    Console.WriteLine($"Error after response started: {ex.Message}");
                    throw;
                }

                context.Response.Body = originalBodyStream;
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "application/json";

                var errorResponse = api_response<object>.FailResponse(
                    "An unexpected error occurred",
                    new List<string> { ex.Message }
                );

                var json = JsonSerializer.Serialize(errorResponse);

                await context.Response.WriteAsync(json);
            }
        }
    }
}