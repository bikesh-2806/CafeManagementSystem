using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantManagement.Api.DTOs;
using RestaurantManagement.Api.Interfaces;

namespace RestaurantManagement.Api.Controllers;

[ApiController]
[Route("api/fonepay")]
public class FonepayController : ControllerBase
{
    private readonly IFonepayService _fonepay;
    public FonepayController(IFonepayService fonepay) => _fonepay = fonepay;

    [Authorize(Roles = "Admin")]
    [HttpGet("configuration")]
    public async Task<IActionResult> GetConfiguration()
        => Ok(ApiResponse<FonepayConfigurationResponse>.Ok(await _fonepay.GetConfigurationAsync()));

    [Authorize(Roles = "Admin")]
    [HttpPut("configuration")]
    public async Task<IActionResult> SaveConfiguration(FonepayConfigurationRequest request)
        => Ok(ApiResponse<FonepayConfigurationResponse>.Ok(await _fonepay.SaveConfigurationAsync(request), "Fonepay configuration saved."));

    [Authorize(Roles = "Admin,Waiter,Staff")]
    [HttpPost("bills/{billId:int}/qr")]
    public async Task<IActionResult> GenerateQr(int billId)
        => Ok(ApiResponse<FonepayQrResponse>.Ok(await _fonepay.GenerateBillQrAsync(billId)));

    [Authorize(Roles = "Admin,Waiter,Staff")]
    [HttpGet("bills/{billId:int}/status")]
    public async Task<IActionResult> GetStatus(int billId)
        => Ok(ApiResponse<object>.Ok(await _fonepay.GetPaymentStatusAsync(billId)));
}
