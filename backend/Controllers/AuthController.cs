using Junkies.Api.Data;
using Junkies.Api.Dtos;
using Junkies.Api.Models;
using Junkies.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Junkies.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db, AuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            request.Password.Length < 6)
        {
            return BadRequest("Name, email, and a password of at least 6 characters are required.");
        }

        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(user => user.Email == email))
        {
            return Conflict("An account with this email already exists.");
        }

        var (hash, salt) = AuthService.HashPassword(request.Password);
        var user = new AppUser
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = hash,
            PasswordSalt = salt
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();
        var token = await authService.CreateSession(user);

        return Ok(new AuthResponse(token, ToProfile(user, [])));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(item => item.Email == email);
        if (user is null || !AuthService.VerifyPassword(request.Password, user.PasswordHash, user.PasswordSalt))
        {
            return Unauthorized("Invalid email or password.");
        }

        var token = await authService.CreateSession(user);
        return Ok(new AuthResponse(token, ToProfile(user, [])));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var header = Request.Headers.Authorization.ToString();
        if (header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var token = header["Bearer ".Length..].Trim();
            var session = await db.UserSessions.FirstOrDefaultAsync(item => item.Token == token);
            if (session is not null)
            {
                db.UserSessions.Remove(session);
                await db.SaveChangesAsync();
            }
        }

        return NoContent();
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var user = await authService.GetUserFromHeader(Request);
        if (user is null)
        {
            return Unauthorized();
        }

        var orders = await db.Orders
            .Include(order => order.Items)
            .Where(order => order.UserId == user.Id)
            .OrderByDescending(order => order.OrderDate)
            .ToListAsync();

        return Ok(ToProfile(user, orders));
    }

    private static UserProfileResponse ToProfile(AppUser user, IEnumerable<Order> orders) =>
        new(user.Id, user.FullName, user.Email, user.PointsBalance, orders.Select(ToOrder));

    private static OrderResponse ToOrder(Order order) =>
        new(order.Id, order.CustomerName, order.PhoneNumber, order.DeliveryAddress, order.TotalPrice,
            order.PointsEarned, order.PointsUsed, order.DiscountAmount, order.FinalPrice, order.OrderDate,
            order.Items.Select(item => new OrderItemResponse(item.ItemName, item.Quantity, item.UnitPrice)));
}
