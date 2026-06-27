using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagement.Api.Data;
using RestaurantManagement.Api.DTOs;
using RestaurantManagement.Api.Interfaces;
using RestaurantManagement.Api.Models;

namespace RestaurantManagement.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IOrderService _orders;
    public OrdersController(ApplicationDbContext db, IOrderService orders) { _db = db; _orders = orders; }

    [Authorize(Roles = "Admin,Waiter,Staff,Customer")]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool mine = false)
    {
        var query = _db.Orders.Include(x => x.Customer).Include(x => x.Waiter).Include(x => x.Table).Include(x => x.OrderItems).ThenInclude(x => x.MenuItem).Include(x => x.Bill).AsQueryable();
        if (mine)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role);
            query = role == nameof(UserRole.Customer) ? query.Where(x => x.CustomerId == userId) : query.Where(x => x.WaiterId == userId);
        }
        return Ok(ApiResponse<object>.Ok(await query.OrderByDescending(x => x.OrderDate).ToListAsync()));
    }

    [Authorize(Roles = "Admin,Waiter,Staff")]
    [HttpGet("open")]
    public async Task<IActionResult> GetOpen([FromQuery] int tableId)
    {
        var order = await _db.Orders
            .Include(x => x.Table)
            .Include(x => x.OrderItems).ThenInclude(x => x.MenuItem)
            .Include(x => x.Bill)
            .FirstOrDefaultAsync(x => x.TableId == tableId
                && x.Bill == null
                && x.OrderStatus != OrderStatus.Completed
                && x.OrderStatus != OrderStatus.Cancelled);
        return order is null ? NotFound(ApiResponse<object>.Fail("No open order found for this table")) : Ok(ApiResponse<object>.Ok(order));
    }

    [Authorize(Roles = "Waiter,Staff,Customer")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderRequest request)
        => Ok(ApiResponse<Order>.Ok(await _orders.CreateAsync(request), "Order created successfully"));

    [Authorize(Roles = "Admin,Waiter,Staff")]
    [HttpPost("{id:int}/items")]
    public async Task<IActionResult> AddItem(int id, OrderItemRequest request)
    {
        var order = await EditableOrder(id);
        if (order is null) return BadRequest(ApiResponse<object>.Fail("Order cannot be edited after bill generation, completion, or cancellation."));
        var menuItem = await _db.MenuItems.FindAsync(request.MenuItemId);
        if (menuItem is null || !menuItem.IsAvailable) return BadRequest(ApiResponse<object>.Fail("Menu item is unavailable."));
        var existingItem = order.OrderItems.FirstOrDefault(x => x.MenuItemId == request.MenuItemId && x.SpecialNote == request.SpecialNote);
        if (existingItem is null)
        {
            order.OrderItems.Add(new OrderItem { MenuItemId = request.MenuItemId, Quantity = request.Quantity, UnitPrice = menuItem.Price, SubTotal = menuItem.Price * request.Quantity, SpecialNote = request.SpecialNote });
        }
        else
        {
            existingItem.Quantity += request.Quantity;
            existingItem.SubTotal = existingItem.UnitPrice * existingItem.Quantity;
        }
        Recalculate(order);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(order, "Order item added successfully"));
    }

    [Authorize(Roles = "Admin,Waiter,Staff")]
    [HttpPut("{id:int}/items/{orderItemId:int}")]
    public async Task<IActionResult> UpdateItem(int id, int orderItemId, UpdateOrderItemRequest request)
    {
        var order = await EditableOrder(id);
        var item = order?.OrderItems.FirstOrDefault(x => x.OrderItemId == orderItemId);
        if (order is null || item is null) return BadRequest(ApiResponse<object>.Fail("Order item cannot be edited."));
        item.Quantity = request.Quantity;
        item.SpecialNote = request.SpecialNote;
        item.SubTotal = item.UnitPrice * item.Quantity;
        Recalculate(order);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(order, "Order item updated successfully"));
    }

    [Authorize(Roles = "Admin,Waiter,Staff")]
    [HttpDelete("{id:int}/items/{orderItemId:int}")]
    public async Task<IActionResult> DeleteItem(int id, int orderItemId)
    {
        var order = await EditableOrder(id);
        var item = order?.OrderItems.FirstOrDefault(x => x.OrderItemId == orderItemId);
        if (order is null || item is null) return BadRequest(ApiResponse<object>.Fail("Order item cannot be deleted."));
        _db.OrderItems.Remove(item);
        Recalculate(order);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(order, "Order item deleted successfully"));
    }

    [Authorize(Roles = "Admin,Waiter,Staff")]
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusRequest request)
    {
        var order = await _orders.UpdateStatusAsync(id, request.Status);
        return order is null ? NotFound(ApiResponse<object>.Fail("Order not found")) : Ok(ApiResponse<Order>.Ok(order, "Order status updated successfully"));
    }

    [Authorize(Roles = "Admin,Waiter,Staff")]
    [HttpPost("{id:int}/bill")]
    public async Task<IActionResult> GenerateBill(int id, BillRequest request)
    {
        var bill = await _orders.GenerateBillAsync(id, request);
        return bill is null ? NotFound(ApiResponse<object>.Fail("Order not found")) : Ok(ApiResponse<Bill>.Ok(bill, "Bill generated successfully"));
    }

    private Task<Order?> EditableOrder(int id) => _db.Orders
        .Include(x => x.OrderItems)
        .Include(x => x.Bill)
        .FirstOrDefaultAsync(x => x.OrderId == id
            && x.Bill == null
            && x.OrderStatus != OrderStatus.Completed
            && x.OrderStatus != OrderStatus.Cancelled);

    private static void Recalculate(Order order) => order.TotalAmount = order.OrderItems.Sum(x => x.SubTotal);
}
