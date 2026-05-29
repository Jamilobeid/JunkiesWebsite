using Junkies.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Junkies.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await db.Categories
            .Include(category => category.MenuItems)
            .OrderBy(category => category.SortOrder)
            .Select(category => new
            {
                category.Id,
                category.Name,
                Items = category.MenuItems.OrderBy(item => item.Name).Select(item => new
                {
                    item.Id,
                    item.Name,
                    item.Description,
                    item.Price,
                    Category = category.Name,
                    item.CategoryId
                })
            })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("category/{categoryName}")]
    public async Task<IActionResult> GetByCategory(string categoryName)
    {
        var items = await db.MenuItems
            .Include(item => item.Category)
            .Where(item => item.Category != null && item.Category.Name == categoryName)
            .Select(item => new
            {
                item.Id,
                item.Name,
                item.Description,
                item.Price,
                Category = item.Category!.Name,
                item.CategoryId
            })
            .ToListAsync();

        return Ok(items);
    }
}
