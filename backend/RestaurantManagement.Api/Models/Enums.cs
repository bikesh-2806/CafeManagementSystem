namespace RestaurantManagement.Api.Models;

public enum UserRole { Admin, Waiter, Staff, Customer }
public enum TableStatus { Available, Occupied, Reserved }
public enum OrderStatus { Pending, Preparing, Served, Completed, Cancelled }
public enum PaymentStatus { Paid, Unpaid, Partial }
public enum PaymentMethod { Cash, Card, Online }
public enum ReservationStatus { Pending, Confirmed, Cancelled }
