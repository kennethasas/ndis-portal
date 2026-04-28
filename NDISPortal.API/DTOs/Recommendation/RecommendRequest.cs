namespace NDISPortal.API.DTOs.Ai
{
    public class RecommendRequest
    {
        public UserAnswers Answers { get; set; }
    }

    public class UserAnswers
    {
        public List<string> DailyActivities { get; set; }
        public string Mobility { get; set; }
        public bool NeedsSocialSupport { get; set; }
        public string Notes { get; set; }
    }
}