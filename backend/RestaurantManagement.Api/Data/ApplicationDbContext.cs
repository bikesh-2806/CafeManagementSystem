using Microsoft.EntityFrameworkCore;
using RestaurantManagement.Api.Models;

namespace RestaurantManagement.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<MenuCategory> MenuCategories => Set<MenuCategory>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<RestaurantTable> RestaurantTables => Set<RestaurantTable>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Bill> Bills => Set<Bill>();
    public DbSet<PaymentGatewayConfiguration> PaymentGatewayConfigurations => Set<PaymentGatewayConfiguration>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Entity<User>().HasIndex(x => x.Email).IsUnique();
        builder.Entity<MenuItem>().Property(x => x.Price).HasPrecision(18, 2);
        builder.Entity<Order>().Property(x => x.TotalAmount).HasPrecision(18, 2);
        builder.Entity<OrderItem>().Property(x => x.UnitPrice).HasPrecision(18, 2);
        builder.Entity<OrderItem>().Property(x => x.SubTotal).HasPrecision(18, 2);
        builder.Entity<Bill>().Property(x => x.TotalAmount).HasPrecision(18, 2);
        builder.Entity<Bill>().Property(x => x.DiscountAmount).HasPrecision(18, 2);
        builder.Entity<Bill>().Property(x => x.TaxAmount).HasPrecision(18, 2);
        builder.Entity<Bill>().Property(x => x.FinalAmount).HasPrecision(18, 2);

        builder.Entity<Order>()
            .HasOne(x => x.Customer).WithMany(x => x.CustomerOrders)
            .HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
        builder.Entity<Order>()
            .HasOne(x => x.Waiter).WithMany(x => x.StaffOrders)
            .HasForeignKey(x => x.WaiterId).OnDelete(DeleteBehavior.Restrict);
        builder.Entity<Order>()
            .HasOne(x => x.Bill).WithOne(x => x.Order)
            .HasForeignKey<Bill>(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
        builder.Entity<Reservation>()
            .HasOne(x => x.Customer).WithMany(x => x.Reservations)
            .HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);

        builder.Entity<User>().HasData(
            new User { UserId = 1, FullName = "System Admin", Email = "admin@hometowncafe.com", PasswordHash = "YWRtaW4tc2VlZC1zYWx0LQ==.tlfGrAOTDjJqE/KuLasAOSqSkKTgcPXEgfmwk/6JPI0=", PhoneNumber = "9800000000", Role = UserRole.Admin, IsActive = true, CreatedAt = new DateTime(2026, 1, 1) },
            new User { UserId = 2, FullName = "Demo Waiter", Email = "waiter@hometowncafe.com", PasswordHash = "d2FpdGVyLXNlZWQtc2FsdA==.cKCgvaDzxIoQA7z6rU5twjGtsMz5igq6QKc50p2fC1Q=", PhoneNumber = "9800000001", Role = UserRole.Waiter, IsActive = true, CreatedAt = new DateTime(2026, 1, 1) },
            new User { UserId = 3, FullName = "Demo Customer", Email = "customer@hometowncafe.com", PasswordHash = "Y3VzdG9tZXItc2VlZC0xeA==.lJN2SqO73GkoHEM3Aj382qOiIrk1kmiJelQR7zIENG4=", PhoneNumber = "9800000002", Role = UserRole.Customer, IsActive = true, CreatedAt = new DateTime(2026, 1, 1) }
        );
        builder.Entity<MenuCategory>().HasData(
            new MenuCategory { CategoryId = 1, CategoryName = "Breakfast", Description = "Morning favorites", IsActive = true },
            new MenuCategory { CategoryId = 2, CategoryName = "Mains", Description = "Lunch and dinner plates", IsActive = true },
            new MenuCategory { CategoryId = 3, CategoryName = "Drinks", Description = "Coffee, tea, and cold drinks", IsActive = true }
        );
        builder.Entity<MenuItem>().HasData(
            new MenuItem { MenuItemId = 1, Name = "Masala Omelette", Description = "Eggs with herbs and spices", Price = 350, ImageUrl = "assets/menu/omelette.jpg", CategoryId = 1, IsAvailable = true, CreatedAt = new DateTime(2026, 1, 1) },
            new MenuItem { MenuItemId = 2, Name = "Chicken Momo", Description = "Steamed dumplings with achar", Price = 520, ImageUrl = "assets/menu/momo.jpg", CategoryId = 2, IsAvailable = true, CreatedAt = new DateTime(2026, 1, 1) },
            new MenuItem { MenuItemId = 3, Name = "Cafe Latte", Description = "Espresso with steamed milk", Price = 240, ImageUrl = "assets/menu/latte.jpg", CategoryId = 3, IsAvailable = true, CreatedAt = new DateTime(2026, 1, 1) }
        );
        builder.Entity<RestaurantTable>().HasData(
            new RestaurantTable { TableId = 1, TableNumber = "T-01", Capacity = 2, Status = TableStatus.Available },
            new RestaurantTable { TableId = 2, TableNumber = "T-02", Capacity = 4, Status = TableStatus.Available },
            new RestaurantTable { TableId = 3, TableNumber = "T-03", Capacity = 6, Status = TableStatus.Available }
        );
    }
}
