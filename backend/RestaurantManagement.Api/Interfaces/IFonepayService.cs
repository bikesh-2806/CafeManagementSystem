using RestaurantManagement.Api.DTOs;

namespace RestaurantManagement.Api.Interfaces;

public interface IFonepayService
{
    Task<FonepayConfigurationResponse> GetConfigurationAsync();
    Task<FonepayConfigurationResponse> SaveConfigurationAsync(FonepayConfigurationRequest request);
    Task<FonepayQrResponse> GenerateBillQrAsync(int billId);
    Task<object> GetPaymentStatusAsync(int billId);
}
