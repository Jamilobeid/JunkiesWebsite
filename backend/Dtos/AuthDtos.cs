namespace Junkies.Api.Dtos;

public record RegisterRequest(string FullName, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, UserProfileResponse User);

public record UserProfileResponse(
    int Id,
    string FullName,
    string Email,
    decimal PointsBalance,
    IEnumerable<OrderResponse> Orders);
