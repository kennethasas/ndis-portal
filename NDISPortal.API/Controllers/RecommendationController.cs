using Microsoft.AspNetCore.Mvc;
using NDISPortal.API.DTOs.Ai;
using NDISPortal.API.Services.Interfaces;

namespace NDISPortal.API.Controllers
{
    [ApiController]
    [Route("api/ai/recommend-services")]
    public class RecommendationController : ControllerBase
    {
        private readonly IRecommendationService _recommendationService;
        private readonly ILogger<RecommendationController> _logger;

        public RecommendationController(
            IRecommendationService recommendationService,
            ILogger<RecommendationController> logger)
        {
            _recommendationService = recommendationService;
            _logger = logger;
        }

        /// <summary>
        /// Get AI-powered service recommendations based on user's situation description
        /// </summary>
        /// <param name="request">User's free-text description of their physical disability and needs</param>
        /// <returns>List of recommended services with explanations, or out-of-scope message</returns>
        [HttpPost]
        [ProducesResponseType(typeof(RecommendResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<RecommendResponse>> GetRecommendations(
            [FromBody] RecommendRequest request)
        {
            // Validate request
            if (request == null)
            {
                _logger.LogWarning("Request is null");
                return BadRequest(new { error = "Request cannot be null" });
            }

            if (string.IsNullOrWhiteSpace(request.Message))
            {
                _logger.LogWarning("Request message is empty");
                return BadRequest(new { error = "Please describe your situation and needs" });
            }

            try
            {
                _logger.LogInformation("Processing recommendation request with message length: {length}", request.Message.Length);

                var result = await _recommendationService.GetRecommendationsAsync(request);

                if (result == null)
                {
                    _logger.LogWarning("Recommendation service returned null result");
                    return StatusCode(500, new { error = "Unexpected error generating recommendations" });
                }

                // Handle out-of-scope requests
                if (result.IsOutOfScope)
                {
                    _logger.LogInformation("Request is out of scope: {message}", result.OutOfScopeMessage);
                    return Ok(result);
                }

                if (result.Recommendations == null || !result.Recommendations.Any())
                {
                    _logger.LogInformation("No recommendations found for the request");
                    return Ok(new RecommendResponse
                    {
                        Recommendations = new List<RecommendationDto>(),
                        IsOutOfScope = true,
                        OutOfScopeMessage = "Sorry, we couldn't find any suitable services matching your needs. This may be beyond the scope of our available NDIS services."
                    });
                }

                _logger.LogInformation("Successfully generated {count} recommendations", result.Recommendations.Count);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating recommendations: {message}", ex.Message);
                return StatusCode(500, new { error = "An error occurred while generating recommendations. Please try again later." });
            }
        }
    }
}