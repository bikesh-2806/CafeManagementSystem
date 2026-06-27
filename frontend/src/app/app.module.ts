import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './shared/layout.component';
import { CustomerNavComponent } from './shared/customer-nav.component';
import { FocusNextDirective } from './shared/focus-next.directive';
import { UiShellComponent } from './shared/ui-shell.component';
import { HomePageComponent, LoginPageComponent, MenuPageComponent, RegisterPageComponent, SimplePageComponent } from './public/public-pages.component';
import { AdminDashboardComponent, AdminListPageComponent, CategoriesPageComponent, DataTableComponent, FonepaySettingsComponent, ItemsPageComponent, ReportsPageComponent, TablesAdminPageComponent, UsersPageComponent } from './admin/admin-pages.component';
import { BillsPageComponent, CurrentOrdersComponent, NewOrderComponent, StaffDashboardComponent, StaffTablesComponent } from './staff/staff-pages.component';
import { CustomerDashboardComponent, MyOrdersComponent, ProfilePageComponent, ReservationPageComponent } from './customer/customer-pages.component';
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
