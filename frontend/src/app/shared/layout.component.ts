import { Component } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { OrderNotificationService } from './order-notification.service';

@Component({
  selector: 'app-layout',
  template: `
    <div class="shell">
      <aside class="sidebar" *ngIf="auth.user as user">
        <div class="brand-block">
          <h2>HomeTown Cafe</h2>
          <p>{{ user.fullName }} - {{ user.role }}</p>
        </div>
        <details class="notification-panel" (toggle)="notifications.markRead()">
          <summary>
            <span>Notifications</span>
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
          <nav *ngSwitchCase="'Admin'">
            <a routerLink="/admin/dashboard" routerLinkActive="active">Dashboard</a><a routerLink="/admin/users" routerLinkActive="active">Users</a><a routerLink="/admin/categories" routerLinkActive="active">Menu Categories</a><a routerLink="/admin/items" routerLinkActive="active">Menu Items</a><a routerLink="/admin/tables" routerLinkActive="active">Tables</a><a routerLink="/admin/orders" routerLinkActive="active">Orders</a><a routerLink="/admin/bills" routerLinkActive="active">Bills</a><a routerLink="/admin/reports" routerLinkActive="active">Reports</a><a routerLink="/admin/fonepay" routerLinkActive="active">Fonepay</a>
          </nav>
          <nav *ngSwitchDefault>
            <a routerLink="/staff/dashboard" routerLinkActive="active">Dashboard</a><a routerLink="/staff/tables" routerLinkActive="active">Tables</a><a routerLink="/staff/new-order" routerLinkActive="active">New Order</a><a routerLink="/staff/orders" routerLinkActive="active">Current Orders</a><a routerLink="/staff/bills" routerLinkActive="active">Bills</a>
          </nav>
        </ng-container>
        <button class="ghost" (click)="auth.logout()">Logout</button>
      </aside>
      <main class="content"><router-outlet></router-outlet></main>
    </div>
  `
})
export class LayoutComponent {
  constructor(public auth: AuthService, public notifications: OrderNotificationService) {}
}
