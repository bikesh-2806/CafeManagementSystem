using RestaurantManagement.Api.DTOs;
using RestaurantManagement.Api.Models;

namespace RestaurantManagement.Api.Interfaces;

public interface IOrderService
{
    Task<Order> CreateAsync(CreateOrderRequest request);
    Task<Order?> UpdateStatusAsync(int orderId, OrderStatus status);
    Task<Bill?> GenerateBillAsync(int orderId, BillRequest request);
}
