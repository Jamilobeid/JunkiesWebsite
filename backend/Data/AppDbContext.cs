using Junkies.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Junkies.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<UserSession> UserSessions => Set<UserSession>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>().HasIndex(user => user.Email).IsUnique();
        modelBuilder.Entity<UserSession>().HasIndex(session => session.Token).IsUnique();
        modelBuilder.Entity<Category>().HasMany(category => category.MenuItems)
            .WithOne(item => item.Category)
            .HasForeignKey(item => item.CategoryId);
    }
}
