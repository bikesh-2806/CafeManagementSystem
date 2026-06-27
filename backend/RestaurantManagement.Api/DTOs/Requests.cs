using System.ComponentModel.DataAnnotations;
using RestaurantManagement.Api.Models;

namespace RestaurantManagement.Api.DTOs;

public record RegisterRequest([Required] string FullName, [Required, EmailAddress] string Email, [Required, MinLength(6)] string Password, string PhoneNumber, UserRole Role);
public record LoginRequest([Required, EmailAddress] string Email, [Required] string Password);
public record UserRequest([Required] string FullName, [Required, EmailAddress] string Email, string? Password, string PhoneNumber, UserRole Role, bool IsActive);
public record MenuCategoryRequest([Required] string CategoryName, string Description, bool IsActive);
public record MenuItemRequest([Required] string Name, string Description, [Range(0.01, 999999)] decimal Price, string ImageUrl, int CategoryId, bool IsAvailable);
public record TableRequest([Required] string TableNumber, [Range(1, 50)] int Capacity, TableStatus Status);
public record OrderItemRequest(int MenuItemId, [Range(1, 100)] int Quantity, string SpecialNote);
public record CreateOrderRequest(int? CustomerId, int WaiterId, int TableId, List<OrderItemRequest> Items);
public record UpdateOrderItemRequest([Range(1, 100)] int Quantity, string SpecialNote);
public record UpdateOrderStatusRequest(OrderStatus Status);
public record BillRequest(decimal DiscountAmount, decimal TaxAmount, PaymentMethod PaymentMethod);
public record PaymentRequest(PaymentStatus PaymentStatus, PaymentMethod PaymentMethod);
public record FonepayConfigurationRequest(bool IsEnabled, bool UseDemoMode, [Required] string BaseUrl, string MerchantCode, string MerchantSecret, string Username, string Password);
public record ReservationRequest(int CustomerId, int TableId, DateTime ReservationDate, [Range(1, 50)] int NumberOfGuests);
public record UpdateReservationStatusRequest(ReservationStatus Status);
