using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagement.Api.Data;
using RestaurantManagement.Api.DTOs;
using RestaurantManagement.Api.Models;

namespace RestaurantManagement.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public ReportsController(ApplicationDbContext db) => _db = db;

    [HttpGet("revenue")]
    public async Task<IActionResult> Revenue()
    {
        var today = DateTime.UtcNow.Date;
        var week = today.AddDays(-7);
        var month = today.AddMonths(-1);
        var paidBills = _db.Bills.Where(x => x.PaymentStatus == PaymentStatus.Paid);
        var summary = new SalesSummary(
            await paidBills.Where(x => x.BillDate >= today).SumAsync(x => x.FinalAmount),
            await paidBills.Where(x => x.BillDate >= week).SumAsync(x => x.FinalAmount),
            await paidBills.Where(x => x.BillDate >= month).SumAsync(x => x.FinalAmount));
        return Ok(ApiResponse<SalesSummary>.Ok(summary));
    }

    [HttpGet("popular-items")]
    public async Task<IActionResult> PopularItems()
    {
        var items = await _db.OrderItems
            .Include(x => x.MenuItem)
            .GroupBy(x => x.MenuItem!.Name)
            .Select(g => new PopularItem(g.Key, g.Sum(x => x.Quantity), g.Sum(x => x.SubTotal)))
            .OrderByDescending(x => x.QuantityOrdered)
            .Take(10)
            .ToListAsync();
        return Ok(ApiResponse<object>.Ok(items));
    }
}
