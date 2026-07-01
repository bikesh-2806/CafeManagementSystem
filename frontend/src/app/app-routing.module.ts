import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminListPageComponent } from './admin/admin-list-page/admin-list-page.component';
import { CategoriesPageComponent } from './admin/categories-page/categories-page.component';
import { FonepaySettingsComponent } from './admin/fonepay-settings/fonepay-settings.component';
import { ItemsPageComponent } from './admin/items-page/items-page.component';
import { ReportsPageComponent } from './admin/reports-page/reports-page.component';
import { TablesAdminPageComponent } from './admin/tables-admin-page/tables-admin-page.component';
import { UsersPageComponent } from './admin/users-page/users-page.component';
import { AuthGuard } from './core/auth.guard';
import { RoleGuard } from './core/role.guard';
import { CustomerDashboardComponent } from './customer/customer-dashboard/customer-dashboard.component';
import { MyOrdersComponent } from './customer/my-orders/my-orders.component';
import { ProfilePageComponent } from './customer/profile-page/profile-page.component';
import { ReservationPageComponent } from './customer/reservation-page/reservation-page.component';
import { HomePageComponent } from './public/home-page/home-page.component';
import { LoginPageComponent } from './public/login-page/login-page.component';
import { MenuPageComponent } from './public/menu-page/menu-page.component';
import { RegisterPageComponent } from './public/register-page/register-page.component';
import { SimplePageComponent } from './public/simple-page/simple-page.component';
import { CustomerNavComponent } from './shared/customer-nav/customer-nav.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { BillsPageComponent } from './staff/bills-page/bills-page.component';
import { CurrentOrdersComponent } from './staff/current-orders/current-orders.component';
import { NewOrderComponent } from './staff/new-order/new-order.component';
import { StaffDashboardComponent } from './staff/staff-dashboard/staff-dashboard.component';
import { StaffTablesComponent } from './staff/staff-tables/staff-tables.component';

const routes: Routes = [
  {
    path: '',
    component: CustomerNavComponent,
    children: [
      { path: '', component: HomePageComponent },
      { path: 'menu', component: MenuPageComponent },
      { path: 'about', component: SimplePageComponent },
      { path: 'contact', component: SimplePageComponent },
      { path: 'login', component: LoginPageComponent },
      { path: 'register', component: RegisterPageComponent },
      { path: 'customer/dashboard', component: CustomerDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Customer'] } },
      { path: 'customer/orders', component: MyOrdersComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Customer'] } },
      { path: 'customer/reservation', component: ReservationPageComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Customer'] } },
      { path: 'customer/profile', component: ProfilePageComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Customer'] } }
    ]
  },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] },
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: UsersPageComponent },
      { path: 'categories', component: CategoriesPageComponent },
      { path: 'items', component: ItemsPageComponent },
      { path: 'tables', component: TablesAdminPageComponent },
      { path: 'orders', component: AdminListPageComponent },
      { path: 'bills', component: BillsPageComponent },
      { path: 'reports', component: ReportsPageComponent },
      { path: 'fonepay', component: FonepaySettingsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'staff',
    component: LayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Waiter', 'Staff'] },
    children: [
      { path: 'dashboard', component: StaffDashboardComponent },
      { path: 'tables', component: StaffTablesComponent },
      { path: 'new-order', component: NewOrderComponent },
      { path: 'orders', component: CurrentOrdersComponent },
      { path: 'bills', component: BillsPageComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
