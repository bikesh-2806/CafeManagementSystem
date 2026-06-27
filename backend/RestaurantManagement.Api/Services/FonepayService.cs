using System.Globalization;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Xml.Linq;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using QRCoder;
using RestaurantManagement.Api.Data;
using RestaurantManagement.Api.DTOs;
using RestaurantManagement.Api.Interfaces;
using RestaurantManagement.Api.Models;

namespace RestaurantManagement.Api.Services;

public class FonepayService : IFonepayService
{
    private readonly ApplicationDbContext _db;
    private readonly HttpClient _http;
    private readonly IDataProtector _protector;

    public FonepayService(ApplicationDbContext db, HttpClient http, IDataProtectionProvider protection)
    {
        _db = db;
        _http = http;
        _http.Timeout = TimeSpan.FromSeconds(20);
        _protector = protection.CreateProtector("HomeTownCafe.FonepayCredentials.v1");
    }

    public async Task<FonepayConfigurationResponse> GetConfigurationAsync()
        => ToResponse(await _db.PaymentGatewayConfigurations.AsNoTracking().FirstOrDefaultAsync());

    public async Task<FonepayConfigurationResponse> SaveConfigurationAsync(FonepayConfigurationRequest request)
    {
        if (!Uri.TryCreate(request.BaseUrl, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps)
            throw new InvalidOperationException("Fonepay base URL must be a valid HTTPS URL.");

        var config = await _db.PaymentGatewayConfigurations.FirstOrDefaultAsync();
        if (config is null)
        {
            config = new PaymentGatewayConfiguration();
            _db.PaymentGatewayConfigurations.Add(config);
        }

        config.IsEnabled = request.IsEnabled;
        config.UseDemoMode = request.UseDemoMode;
        config.BaseUrl = request.BaseUrl.Trim().TrimEnd('/');
        config.MerchantCode = request.MerchantCode.Trim();
        if (!string.IsNullOrWhiteSpace(request.MerchantSecret)) config.ProtectedMerchantSecret = _protector.Protect(request.MerchantSecret);
        if (!string.IsNullOrWhiteSpace(request.Username)) config.ProtectedUsername = _protector.Protect(request.Username);
        if (!string.IsNullOrWhiteSpace(request.Password)) config.ProtectedPassword = _protector.Protect(request.Password);
        config.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return ToResponse(config);
    }

    public async Task<FonepayQrResponse> GenerateBillQrAsync(int billId)
    {
        var bill = await _db.Bills.AsNoTracking().FirstOrDefaultAsync(x => x.BillId == billId)
            ?? throw new InvalidOperationException("Bill not found.");
        var config = await GetEntityAsync();
        var prn = $"HTC-{bill.BillId}-{bill.BillDate:yyyyMMddHHmmss}";

        if (config.UseDemoMode)
        {
            var demoPayload = $"HOMETOWN-CAFE-DEMO|PRN={prn}|AMOUNT={bill.FinalAmount:0.00}|CURRENCY=NPR";
            return new FonepayQrResponse(prn, bill.FinalAmount, RenderQr(demoPayload), true, "Demo",
                "Demo QR only. It is not payable through Fonepay.");
        }

        EnsureCredentials(config);
        var remarks1 = $"Bill {bill.BillId}";
        const string remarks2 = "HomeTown Cafe";
        var amount = bill.FinalAmount.ToString("0.00", CultureInfo.InvariantCulture);
        var validation = Sign($"{amount},{prn},{config.MerchantCode},{remarks1},{remarks2}", Unprotect(config.ProtectedMerchantSecret));
        var payload = new
        {
            amount,
            remarks1,
            remarks2,
            prn,
            merchantCode = config.MerchantCode,
            dataValidation = validation,
            username = Unprotect(config.ProtectedUsername),
            password = Unprotect(config.ProtectedPassword)
        };

        using var response = await _http.PostAsJsonAsync($"{config.BaseUrl}/thirdPartyDynamicQrDownload", payload);
        var bytes = await response.Content.ReadAsByteArrayAsync();
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"Fonepay QR request failed ({(int)response.StatusCode}).");

        var qrImage = NormalizeQrResponse(bytes, response.Content.Headers.ContentType?.MediaType);
        return new FonepayQrResponse(prn, bill.FinalAmount, qrImage, false, "Pending", "Scan to pay the exact bill amount.");
    }

    public async Task<object> GetPaymentStatusAsync(int billId)
    {
        var bill = await _db.Bills.AsNoTracking().FirstOrDefaultAsync(x => x.BillId == billId)
            ?? throw new InvalidOperationException("Bill not found.");
        var config = await GetEntityAsync();
        if (config.UseDemoMode) return new { status = "Demo", paid = false, message = "Demo mode does not process payments." };
        EnsureCredentials(config);

        var prn = $"HTC-{bill.BillId}-{bill.BillDate:yyyyMMddHHmmss}";
        var payload = new
        {
            prn,
            merchantCode = config.MerchantCode,
            dataValidation = Sign($"{prn},{config.MerchantCode}", Unprotect(config.ProtectedMerchantSecret)),
            username = Unprotect(config.ProtectedUsername),
            password = Unprotect(config.ProtectedPassword)
        };
        using var response = await _http.PostAsJsonAsync($"{config.BaseUrl}/thirdPartyDynamicQrGetStatus", payload);
        var content = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"Fonepay status request failed ({(int)response.StatusCode}).");
        try
        {
            return JsonSerializer.Deserialize<JsonElement>(content);
        }
        catch (JsonException)
        {
            return new { raw = content };
        }
    }

    private async Task<PaymentGatewayConfiguration> GetEntityAsync()
    {
        var config = await _db.PaymentGatewayConfigurations.AsNoTracking().FirstOrDefaultAsync()
            ?? throw new InvalidOperationException("Fonepay configuration has not been saved.");
        if (!config.IsEnabled) throw new InvalidOperationException("Fonepay is disabled.");
        return config;
    }

    private static void EnsureCredentials(PaymentGatewayConfiguration config)
    {
        if (string.IsNullOrWhiteSpace(config.MerchantCode) ||
            string.IsNullOrWhiteSpace(config.ProtectedMerchantSecret) ||
            string.IsNullOrWhiteSpace(config.ProtectedUsername) ||
            string.IsNullOrWhiteSpace(config.ProtectedPassword))
            throw new InvalidOperationException("Fonepay credentials are incomplete.");
    }

    private string Unprotect(string value) => _protector.Unprotect(value);

    private static string Sign(string value, string secret)
    {
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(secret));
        return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(value))).ToLowerInvariant();
    }

    private static string RenderQr(string payload)
    {
        using var data = QRCodeGenerator.GenerateQrCode(payload, QRCodeGenerator.ECCLevel.Q);
        using var qr = new PngByteQRCode(data);
        return $"data:image/png;base64,{Convert.ToBase64String(qr.GetGraphic(8))}";
    }

    private static string NormalizeQrResponse(byte[] bytes, string? mediaType)
    {
        if (mediaType?.StartsWith("image/", StringComparison.OrdinalIgnoreCase) == true)
            return $"data:{mediaType};base64,{Convert.ToBase64String(bytes)}";

        var text = Encoding.UTF8.GetString(bytes).Trim();
        if (text.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase)) return text;
        if (TryFindQrValue(text, out var value))
        {
            if (value.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase)) return value;
            if (IsBase64(value)) return $"data:image/png;base64,{value}";
            return RenderQr(value);
        }
        if (text.Length is > 20 and < 10000 && !text.StartsWith("<!DOCTYPE", StringComparison.OrdinalIgnoreCase))
            return RenderQr(text);
        throw new InvalidOperationException("Fonepay returned an unsupported QR response.");
    }

    private static bool TryFindQrValue(string json, out string value)
    {
        value = string.Empty;
        try
        {
            using var document = JsonDocument.Parse(json);
            return FindValue(document.RootElement, out value);
        }
        catch (JsonException)
        {
            try
            {
                var document = XDocument.Parse(json);
                var element = document.Descendants().FirstOrDefault(x => x.Name.LocalName.Contains("qr", StringComparison.OrdinalIgnoreCase));
                value = element?.Value?.Trim() ?? string.Empty;
                return value.Length > 0;
            }
            catch
            {
                return false;
            }
        }
    }

    private static bool FindValue(JsonElement element, out string value)
    {
        value = string.Empty;
        if (element.ValueKind == JsonValueKind.Object)
        {
            foreach (var property in element.EnumerateObject())
            {
                if (property.Value.ValueKind == JsonValueKind.String &&
                    property.Name.Contains("qr", StringComparison.OrdinalIgnoreCase))
                {
                    value = property.Value.GetString() ?? string.Empty;
                    if (value.Length > 0) return true;
                }
                if (FindValue(property.Value, out value)) return true;
            }
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in element.EnumerateArray())
                if (FindValue(item, out value)) return true;
        }
        return false;
    }

    private static bool IsBase64(string value)
    {
        if (value.Length < 100) return false;
        Span<byte> buffer = new byte[value.Length];
        return Convert.TryFromBase64String(value, buffer, out _);
    }

    private static FonepayConfigurationResponse ToResponse(PaymentGatewayConfiguration? config)
        => config is null
            ? new(false, true, "https://merchantapi.fonepay.com/api/merchant/merchantDetailsForThirdParty", string.Empty, false, false, false, null)
            : new(config.IsEnabled, config.UseDemoMode, config.BaseUrl, config.MerchantCode,
                config.ProtectedMerchantSecret.Length > 0, config.ProtectedUsername.Length > 0,
                config.ProtectedPassword.Length > 0, config.UpdatedAt);
}
