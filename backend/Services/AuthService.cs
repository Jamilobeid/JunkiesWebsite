using System.Security.Cryptography;
using Junkies.Api.Data;
using Junkies.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Junkies.Api.Services;

public class AuthService(AppDbContext db)
{
    public async Task<AppUser?> GetUserFromHeader(HttpRequest request)
    {
        var header = request.Headers.Authorization.ToString();
        if (!header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var token = header["Bearer ".Length..].Trim();
        var session = await db.UserSessions
            .Include(item => item.User)
            .FirstOrDefaultAsync(item => item.Token == token && item.ExpiresAt > DateTime.UtcNow);

        return session?.User;
    }

    public static (string Hash, string Salt) HashPassword(string password)
    {
        var saltBytes = RandomNumberGenerator.GetBytes(16);
        var hashBytes = Rfc2898DeriveBytes.Pbkdf2(password, saltBytes, 100_000, HashAlgorithmName.SHA256, 32);
        return (Convert.ToBase64String(hashBytes), Convert.ToBase64String(saltBytes));
    }

    public static bool VerifyPassword(string password, string hash, string salt)
    {
        var saltBytes = Convert.FromBase64String(salt);
        var passwordHash = Rfc2898DeriveBytes.Pbkdf2(password, saltBytes, 100_000, HashAlgorithmName.SHA256, 32);
        return CryptographicOperations.FixedTimeEquals(passwordHash, Convert.FromBase64String(hash));
    }

    public async Task<string> CreateSession(AppUser user)
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        db.UserSessions.Add(new UserSession { Token = token, UserId = user.Id });
        await db.SaveChangesAsync();
        return token;
    }
}
