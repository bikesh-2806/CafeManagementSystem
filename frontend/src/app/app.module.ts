import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { CustomerNavComponent } from './shared/customer-nav/customer-nav.component';
import { FocusNextDirective } from './shared/focus-next.directive';
import { UiShellComponent } from './shared/ui-shell/ui-shell.component';
import { HomePageComponent } from './public/home-page/home-page.component';
import { LoginPageComponent } from './public/login-page/login-page.component';
import { MenuPageComponent } from './public/menu-page/menu-page.component';
import { RegisterPageComponent } from './public/register-page/register-page.component';
import { SimplePageComponent } from './public/simple-page/simple-page.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminListPageComponent } from './admin/admin-list-page/admin-list-page.component';
import { CategoriesPageComponent } from './admin/categories-page/categories-page.component';
import { DataTableComponent } from './admin/data-table/data-table.component';
import { FonepaySettingsComponent } from './admin/fonepay-settings/fonepay-settings.component';
import { ItemsPageComponent } from './admin/items-page/items-page.component';
import { ReportsPageComponent } from './admin/reports-page/reports-page.component';
import { TablesAdminPageComponent } from './admin/tables-admin-page/tables-admin-page.component';
import { UsersPageComponent } from './admin/users-page/users-page.component';
import { BillsPageComponent } from './staff/bills-page/bills-page.component';
import { CurrentOrdersComponent } from './staff/current-orders/current-orders.component';
import { NewOrderComponent } from './staff/new-order/new-order.component';
import { StaffDashboardComponent } from './staff/staff-dashboard/staff-dashboard.component';
import { StaffTablesComponent } from './staff/staff-tables/staff-tables.component';
import { CustomerDashboardComponent } from './customer/customer-dashboard/customer-dashboard.component';
import { MyOrdersComponent } from './customer/my-orders/my-orders.component';
import { ProfilePageComponent } from './customer/profile-page/profile-page.component';
import { ReservationPageComponent } from './customer/reservation-page/reservation-page.component';
import { TokenInterceptor } from './core/token.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    CustomerNavComponent,
    FocusNextDirective,
    UiShellComponent,
    HomePageComponent,
    MenuPageComponent,
    LoginPageComponent,
    RegisterPageComponent,
    SimplePageComponent,
    AdminDashboardComponent,
    UsersPageComponent,
    CategoriesPageComponent,
    ItemsPageComponent,
    TablesAdminPageComponent,
    AdminListPageComponent,
    ReportsPageComponent,
    FonepaySettingsComponent,
    DataTableComponent,
    StaffDashboardComponent,
    StaffTablesComponent,
    NewOrderComponent,
    CurrentOrdersComponent,
    BillsPageComponent,
    CustomerDashboardComponent,
    MyOrdersComponent,
    ReservationPageComponent,
    ProfilePageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
