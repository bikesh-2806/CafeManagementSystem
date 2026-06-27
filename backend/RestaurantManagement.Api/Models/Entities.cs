using System.ComponentModel.DataAnnotations;

namespace RestaurantManagement.Api.Models;

public class User
{
    [Key]
    public int UserId { get; set; }
    [MaxLength(120)] public string FullName { get; set; } = string.Empty;
    [MaxLength(150)] public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    [MaxLength(30)] public string PhoneNumber { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Order> CustomerOrders { get; set; } = new List<Order>();
    public ICollection<Order> StaffOrders { get; set; } = new List<Order>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}

public class MenuCategory
{
    [Key]
    public int CategoryId { get; set; }
    [MaxLength(120)] public string CategoryName { get; set; } = string.Empty;
    [MaxLength(500)] public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
}

public class MenuItem
{
    [Key]
    public int MenuItemId { get; set; }
    [MaxLength(150)] public string Name { get; set; } = string.Empty;
    [MaxLength(700)] public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    [MaxLength(500)] public string ImageUrl { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public bool IsAvailable { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public MenuCategory? Category { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}

public class RestaurantTable
{
    [Key]
    public int TableId { get; set; }
    [MaxLength(20)] public string TableNumber { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public TableStatus Status { get; set; } = TableStatus.Available;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}

public class Order
{
    [Key]
    public int OrderId { get; set; }
    public int? CustomerId { get; set; }
    public int WaiterId { get; set; }
    public int TableId { get; set; }
    public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public decimal TotalAmount { get; set; }
    public User? Customer { get; set; }
    public User? Waiter { get; set; }
    public RestaurantTable? Table { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public Bill? Bill { get; set; }
}

public class OrderItem
{
    [Key]
    public int OrderItemId { get; set; }
    public int OrderId { get; set; }
    public int MenuItemId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal { get; set; }
    [MaxLength(500)] public string SpecialNote { get; set; } = string.Empty;
    public Order? Order { get; set; }
    public MenuItem? MenuItem { get; set; }
}

public class Bill
{
    [Key]
    public int BillId { get; set; }
    public int OrderId { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public DateTime BillDate { get; set; } = DateTime.UtcNow;
    public Order? Order { get; set; }
}

public class PaymentGatewayConfiguration
{
    [Key]
    public int PaymentGatewayConfigurationId { get; set; }
    public bool IsEnabled { get; set; }
    public bool UseDemoMode { get; set; } = true;
    [MaxLength(500)] public string BaseUrl { get; set; } = "https://merchantapi.fonepay.com/api/merchant/merchantDetailsForThirdParty";
    [MaxLength(200)] public string MerchantCode { get; set; } = string.Empty;
    public string ProtectedMerchantSecret { get; set; } = string.Empty;
    public string ProtectedUsername { get; set; } = string.Empty;
    public string ProtectedPassword { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class Reservation
{
    [Key]
    public int ReservationId { get; set; }
    public int CustomerId { get; set; }
    public int TableId { get; set; }
    public DateTime ReservationDate { get; set; }
    public int NumberOfGuests { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public User? Customer { get; set; }
    public RestaurantTable? Table { get; set; }
}
