using System.ComponentModel.DataAnnotations.Schema;

namespace Junkies.Api.Models;

public class AppUser
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PasswordSalt { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal PointsBalance { get; set; }

    public List<Order> Orders { get; set; } = [];
    public List<UserSession> Sessions { get; set; } = [];
}
