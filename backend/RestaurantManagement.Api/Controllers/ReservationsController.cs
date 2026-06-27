using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagement.Api.Data;
using RestaurantManagement.Api.DTOs;
using RestaurantManagement.Api.Models;

namespace RestaurantManagement.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/reservations")]
public class ReservationsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public ReservationsController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool mine = false)
    {
        var query = _db.Reservations.Include(x => x.Customer).Include(x => x.Table).AsQueryable();
        if (mine)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            query = query.Where(x => x.CustomerId == userId);
        }
        return Ok(ApiResponse<object>.Ok(await query.OrderByDescending(x => x.ReservationDate).ToListAsync()));
    }

    [Authorize(Roles = "Customer,Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(ReservationRequest request)
    {
        var reservation = new Reservation { CustomerId = request.CustomerId, TableId = request.TableId, ReservationDate = request.ReservationDate, NumberOfGuests = request.NumberOfGuests, Status = ReservationStatus.Pending };
        _db.Reservations.Add(reservation);
        var table = await _db.RestaurantTables.FindAsync(request.TableId);
        if (table is not null) table.Status = TableStatus.Reserved;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<Reservation>.Ok(reservation, "Reservation created successfully"));
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateReservationStatusRequest request)
    {
        var reservation = await _db.Reservations.Include(x => x.Table).FirstOrDefaultAsync(x => x.ReservationId == id);
        if (reservation is null) return NotFound(ApiResponse<object>.Fail("Reservation not found"));
        reservation.Status = request.Status;
        if (request.Status == ReservationStatus.Cancelled && reservation.Table is not null) reservation.Table.Status = TableStatus.Available;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<Reservation>.Ok(reservation, "Reservation updated successfully"));
    }
}
