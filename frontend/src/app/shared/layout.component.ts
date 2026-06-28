import { Component } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { OrderNotificationService } from './order-notification.service';

@Component({
  selector: 'app-layout',
  template: `
    <div class="shell">
      <aside class="sidebar" [class.nav-open]="navOpen" *ngIf="auth.user as user">
        <div class="sidebar-head">
          <div class="brand-block">
            <h2><i class="fa-solid fa-mug-hot"></i> HomeTown Cafe</h2>
            <p>{{ user.fullName }} - {{ user.role }}</p>
          </div>
          <button type="button" class="nav-toggle" (click)="navOpen = !navOpen" [attr.aria-expanded]="navOpen" aria-label="Toggle navigation">
            <i class="fa-solid" [class.fa-bars]="!navOpen" [class.fa-xmark]="navOpen"></i>
          </button>
        </div>
        <details class="notification-panel" (toggle)="notifications.markRead()">
          <summary>
            <span><i class="fa-solid fa-bell"></i> Notifications</span>
            <b *ngIf="notifications.unread$ | async as unread">{{ unread }}</b>
          </summary>
          <div class="notification-list">
            <article *ngFor="let item of notifications.notifications$ | async">
              <strong>{{ item.title }}</strong>
              <span>{{ item.text }}</span>
            </article>
            <p *ngIf="!(notifications.notifications$ | async)?.length">No new orders yet.</p>
            <button type="button" class="ghost" (click)="notifications.clear()">Clear</button>
          </div>
        </details>
        <ng-container [ngSwitch]="user.role">
          <nav class="app-nav" [class.open]="navOpen" *ngSwitchCase="'Admin'">
            <a routerLink="/admin/dashboard" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-chart-line"></i><span>Dashboard</span></a>
            <a routerLink="/admin/users" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-users"></i><span>Users</span></a>
            <a routerLink="/admin/categories" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-layer-group"></i><span>Menu Categories</span></a>
            <a routerLink="/admin/items" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-utensils"></i><span>Menu Items</span></a>
            <a routerLink="/admin/tables" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-chair"></i><span>Tables</span></a>
            <a routerLink="/admin/orders" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-receipt"></i><span>Orders</span></a>
            <a routerLink="/admin/bills" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-file-invoice-dollar"></i><span>Bills</span></a>
            <a routerLink="/admin/reports" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-chart-pie"></i><span>Reports</span></a>
            <a routerLink="/admin/fonepay" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-qrcode"></i><span>Fonepay</span></a>
          </nav>
          <nav class="app-nav" [class.open]="navOpen" *ngSwitchDefault>
            <a routerLink="/staff/dashboard" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-chart-line"></i><span>Dashboard</span></a>
            <a routerLink="/staff/tables" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-chair"></i><span>Tables</span></a>
            <a routerLink="/staff/new-order" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-circle-plus"></i><span>New Order</span></a>
            <a routerLink="/staff/orders" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-kitchen-set"></i><span>Current Orders</span></a>
            <a routerLink="/staff/bills" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-file-invoice-dollar"></i><span>Bills</span></a>
          </nav>
        </ng-container>
        <button class="ghost logout-button" (click)="auth.logout()"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
      </aside>
      <main class="content"><router-outlet></router-outlet></main>
    </div>
  `
})
export class LayoutComponent {
  navOpen = false;
  constructor(public auth: AuthService, public notifications: OrderNotificationService) {}
  closeNav() { this.navOpen = false; }
}
