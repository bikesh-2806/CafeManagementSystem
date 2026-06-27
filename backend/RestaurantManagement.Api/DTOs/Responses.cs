using RestaurantManagement.Api.Models;

namespace RestaurantManagement.Api.DTOs;

public record AuthResponse(int UserId, string FullName, string Email, UserRole Role, string Token);
public record SalesSummary(decimal DailyRevenue, decimal WeeklyRevenue, decimal MonthlyRevenue);
public record PopularItem(string Name, int QuantityOrdered, decimal Revenue);
public record FonepayConfigurationResponse(bool IsEnabled, bool UseDemoMode, string BaseUrl, string MerchantCode, bool HasMerchantSecret, bool HasUsername, bool HasPassword, DateTime? UpdatedAt);
public record FonepayQrResponse(string Prn, decimal Amount, string QrImage, bool IsDemo, string Status, string Message);
