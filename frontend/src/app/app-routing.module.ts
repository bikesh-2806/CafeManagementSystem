import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent, AdminListPageComponent, CategoriesPageComponent, FonepaySettingsComponent, ItemsPageComponent, ReportsPageComponent, TablesAdminPageComponent, UsersPageComponent } from './admin/admin-pages.component';
import { AuthGuard } from './core/auth.guard';
import { RoleGuard } from './core/role.guard';
import { CustomerDashboardComponent, MyOrdersComponent, ProfilePageComponent, ReservationPageComponent } from './customer/customer-pages.component';
import { HomePageComponent, LoginPageComponent, MenuPageComponent, RegisterPageComponent, SimplePageComponent } from './public/public-pages.component';
import { CustomerNavComponent } from './shared/customer-nav.component';
import { LayoutComponent } from './shared/layout.component';
import { BillsPageComponent, CurrentOrdersComponent, NewOrderComponent, StaffDashboardComponent, StaffTablesComponent } from './staff/staff-pages.component';

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
