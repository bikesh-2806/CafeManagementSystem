using Microsoft.EntityFrameworkCore;
using RestaurantManagement.Api.Data;
using RestaurantManagement.Api.DTOs;
using RestaurantManagement.Api.Interfaces;
using RestaurantManagement.Api.Models;

namespace RestaurantManagement.Api.Services;

public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _db;
    public OrderService(ApplicationDbContext db) => _db = db;

    public async Task<Order> CreateAsync(CreateOrderRequest request)
    {
        if (request.Items.Count == 0) throw new InvalidOperationException("At least one order item is required.");
        var menuIds = request.Items.Select(x => x.MenuItemId).ToList();
        var menuItems = await _db.MenuItems.Where(x => menuIds.Contains(x.MenuItemId) && x.IsAvailable).ToDictionaryAsync(x => x.MenuItemId);
        var order = await _db.Orders
            .Include(x => x.OrderItems)
            .Include(x => x.Bill)
            .FirstOrDefaultAsync(x => x.TableId == request.TableId
                && x.Bill == null
                && x.OrderStatus != OrderStatus.Completed
                && x.OrderStatus != OrderStatus.Cancelled);

        if (order is null)
        {
            order = new Order { CustomerId = request.CustomerId, WaiterId = request.WaiterId, TableId = request.TableId, OrderStatus = OrderStatus.Pending };
            _db.Orders.Add(order);
        }
        else
        {
            order.CustomerId ??= request.CustomerId;
            order.WaiterId = request.WaiterId;
        }

        foreach (var item in request.Items)
        {
            if (!menuItems.TryGetValue(item.MenuItemId, out var menuItem)) throw new InvalidOperationException($"Menu item {item.MenuItemId} is unavailable.");
            var existingItem = order.OrderItems.FirstOrDefault(x => x.MenuItemId == item.MenuItemId && x.SpecialNote == item.SpecialNote);
            if (existingItem is null)
            {
                var subTotal = menuItem.Price * item.Quantity;
                order.OrderItems.Add(new OrderItem { MenuItemId = item.MenuItemId, Quantity = item.Quantity, UnitPrice = menuItem.Price, SubTotal = subTotal, SpecialNote = item.SpecialNote });
            }
            else
            {
                existingItem.Quantity += item.Quantity;
                existingItem.SubTotal = existingItem.UnitPrice * existingItem.Quantity;
            }
        }

        order.TotalAmount = order.OrderItems.Sum(x => x.SubTotal);
        var table = await _db.RestaurantTables.FindAsync(request.TableId);
        if (table is not null) table.Status = TableStatus.Occupied;
        await _db.SaveChangesAsync();
        return order;
    }

    public async Task<Order?> UpdateStatusAsync(int orderId, OrderStatus status)
    {
        var order = await _db.Orders.Include(x => x.Table).FirstOrDefaultAsync(x => x.OrderId == orderId);
        if (order is null) return null;
        order.OrderStatus = status;
        if (status is OrderStatus.Completed or OrderStatus.Cancelled && order.Table is not null) order.Table.Status = TableStatus.Available;
        await _db.SaveChangesAsync();
        return order;
    }

    public async Task<Bill?> GenerateBillAsync(int orderId, BillRequest request)
    {
        var order = await _db.Orders
            .Include(x => x.OrderItems).ThenInclude(x => x.MenuItem)
            .Include(x => x.Table)
            .Include(x => x.Bill)
            .FirstOrDefaultAsync(x => x.OrderId == orderId);
        if (order is null) return null;
        var finalAmount = Math.Max(0, order.TotalAmount - request.DiscountAmount + request.TaxAmount);
        var bill = order.Bill;
        if (bill is null)
        {
            bill = new Bill { OrderId = orderId, PaymentStatus = PaymentStatus.Unpaid };
            _db.Bills.Add(bill);
        }
        else if (bill.PaymentStatus == PaymentStatus.Paid)
        {
            return bill;
        }

        bill.TotalAmount = order.TotalAmount;
        bill.DiscountAmount = request.DiscountAmount;
        bill.TaxAmount = request.TaxAmount;
        bill.FinalAmount = finalAmount;
        bill.PaymentMethod = request.PaymentMethod;
        await _db.SaveChangesAsync();
        bill.Order = order;
        return bill;
    }
}
