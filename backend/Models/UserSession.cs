namespace Junkies.Api.Models;

public class UserSession
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(30);
    public int UserId { get; set; }
    public AppUser? User { get; set; }
}
