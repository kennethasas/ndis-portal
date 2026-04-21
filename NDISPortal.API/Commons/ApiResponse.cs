namespace Service.API.Commons
{
    public class ApiResponse<T>
    {
        
            public bool Success { get; set; }
            public T? Data { get; set; }
            public string Message { get; set; } = string.Empty;
            public List<string> Errors { get; set; } = new();

            // Success response 
            public static ApiResponse<T> SuccessResponse(T data, string message = "")
            {
                return new ApiResponse<T>
                {
                    Success = true,
                    Data = data,
                    Message = message,
                    Errors = new List<string>()
                };
            }

            //  Failure response 
            public static ApiResponse<T> FailResponse(string message, List<string>? errors = null)
            {
                return new ApiResponse<T>
                {
                    Success = false,
                    Data = default,
                    Message = message,
                    Errors = errors ?? new List<string>()
                };
            }
        }
    
}
