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
        /// Get AI-powered service recommendations based on user needs
        /// </summary>
        /// <param name="request">User's needs and preferences</param>
        /// <returns>List of recommended services with explanations</returns>
        [HttpPost]
        [ProducesResponseType(typeof(RecommendResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
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

            if (request.Answers == null)
            {
                _logger.LogWarning("Request answers are null");
                return BadRequest(new { error = "Request answers cannot be null" });
            }

            // Check if at least one input is provided
            var hasInput = (request.Answers.DailyActivities != null && request.Answers.DailyActivities.Any()) ||
                          !string.IsNullOrWhiteSpace(request.Answers.Mobility) ||
                          !string.IsNullOrWhiteSpace(request.Answers.Notes) ||
                          request.Answers.NeedsSocialSupport;

            if (!hasInput)
            {
                _logger.LogWarning("No input provided in request");
                return BadRequest(new { error = "At least one input must be provided (daily activities, mobility, notes, or social support need)" });
            }

            try
            {
                _logger.LogInformation("Processing recommendation request with inputs - Daily Activities: {count}, Mobility: {mobility}, Notes: {hasNotes}, SocialSupport: {socialSupport}",
                    request.Answers.DailyActivities?.Count ?? 0,
                    string.IsNullOrEmpty(request.Answers.Mobility) ? "N/A" : "Specified",
                    string.IsNullOrEmpty(request.Answers.Notes) ? "No" : "Yes",
                    request.Answers.NeedsSocialSupport);

                var result = await _recommendationService.GetRecommendationsAsync(request);

                if (result == null || result.Recommendations == null)
                {
                    _logger.LogWarning("Recommendation service returned null result");
                    return StatusCode(500, new { error = "Unexpected error generating recommendations" });
                }

                if (!result.Recommendations.Any())
                {
                    _logger.LogInformation("No recommendations found for the request");
                    return NotFound(new { 
                        error = "No suitable services found for your needs",
                        recommendations = new List<object>()
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