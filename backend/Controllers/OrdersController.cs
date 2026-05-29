using Junkies.Api.Data;
using Junkies.Api.Dtos;
using Junkies.Api.Models;
using Junkies.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Junkies.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(AppDbContext db, AuthService authService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderRequest request)
    {
        if (!request.Items.Any())
        {
            return BadRequest("Your cart is empty.");
        }

        var user = await authService.GetUserFromHeader(Request);
        var requestedItems = request.Items.Where(item => item.Quantity > 0).ToList();
        var ids = requestedItems.Select(item => item.MenuItemId).ToList();
        var menuItems = await db.MenuItems.Where(item => ids.Contains(item.Id)).ToListAsync();

        if (menuItems.Count != ids.Distinct().Count())
        {
            return BadRequest("One or more menu items could not be found.");
        }

        var orderItems = requestedItems.Select(requestItem =>
        {
            var menuItem = menuItems.First(item => item.Id == requestItem.MenuItemId);
            return new OrderItem
            {
                MenuItemId = menuItem.Id,
                ItemName = menuItem.Name,
                Quantity = requestItem.Quantity,
                UnitPrice = menuItem.Price
            };
        }).ToList();

        var total = orderItems.Sum(item => item.UnitPrice * item.Quantity);
        var pointsUsed = 0m;
        var discount = 0m;

        const decimal pointSpendRate = 100000m;
        const decimal pointsPerDiscountBlock = 100m;
        const decimal discountPerBlock = 500000m;

        if (user is not null && request.UsePoints && user.PointsBalance >= pointsPerDiscountBlock)
        {
            var redeemableBlocks = Math.Floor(user.PointsBalance / pointsPerDiscountBlock);
            var maxDiscount = redeemableBlocks * discountPerBlock;
            discount = Math.Min(maxDiscount, total);
            pointsUsed = Math.Ceiling(discount / discountPerBlock) * pointsPerDiscountBlock;
            user.PointsBalance -= pointsUsed;
        }

        var finalPrice = total - discount;
        var pointsEarned = user is null ? 0 : Math.Floor(finalPrice / pointSpendRate);
        if (user is not null)
        {
            user.PointsBalance += pointsEarned;
        }

        var order = new Order
        {
            UserId = user?.Id,
            CustomerName = request.CustomerName,
            PhoneNumber = request.PhoneNumber,
            DeliveryAddress = request.DeliveryAddress,
            TotalPrice = total,
            PointsUsed = pointsUsed,
            DiscountAmount = discount,
            FinalPrice = finalPrice,
            PointsEarned = pointsEarned,
            Items = orderItems
        };

        db.Orders.Add(order);
        await db.SaveChangesAsync();

        return Ok(new OrderResponse(order.Id, order.CustomerName, order.PhoneNumber, order.DeliveryAddress,
            order.TotalPrice, order.PointsEarned, order.PointsUsed, order.DiscountAmount, order.FinalPrice,
            order.OrderDate, order.Items.Select(item => new OrderItemResponse(item.ItemName, item.Quantity, item.UnitPrice))));
    }
}
