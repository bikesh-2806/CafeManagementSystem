using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagement.Api.Data;
using RestaurantManagement.Api.DTOs;

namespace RestaurantManagement.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin,Waiter,Staff")]
[Route("api/bills")]
public class BillsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public BillsController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(ApiResponse<object>.Ok(await _db.Bills
            .Include(x => x.Order).ThenInclude(x => x!.Table)
            .Include(x => x.Order).ThenInclude(x => x!.OrderItems).ThenInclude(x => x.MenuItem)
            .OrderByDescending(x => x.BillDate)
            .ToListAsync()));

    [HttpPatch("{id:int}/payment")]
    public async Task<IActionResult> UpdatePayment(int id, PaymentRequest request)
    {
        var bill = await _db.Bills.FindAsync(id);
        if (bill is null) return NotFound(ApiResponse<object>.Fail("Bill not found"));
        bill.PaymentStatus = request.PaymentStatus;
        bill.PaymentMethod = request.PaymentMethod;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(bill, "Payment updated successfully"));
    }
}
