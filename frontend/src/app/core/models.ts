export type UserRole = 'Admin' | 'Waiter' | 'Staff' | 'Customer';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthUser {
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface MenuItem {
  menuItemId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  isAvailable: boolean;
}

export interface Table {
  tableId: number;
  tableNumber: string;
  capacity: number;
  status: string;
}
