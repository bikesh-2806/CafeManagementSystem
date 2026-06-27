import { Component } from '@angular/core';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-customer-nav',
  template: `
    <header class="top-nav">
      <strong>HomeTown Cafe</strong>
      <nav>
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a><a routerLink="/menu" routerLinkActive="active">Menu</a><a routerLink="/customer/orders" routerLinkActive="active">My Orders</a><a routerLink="/customer/reservation" routerLinkActive="active">Reservation</a><a routerLink="/customer/profile" routerLinkActive="active">Profile</a>
        <button *ngIf="auth.user; else loginLink" class="ghost" (click)="auth.logout()">Logout</button>
        <ng-template #loginLink><a routerLink="/login" routerLinkActive="active">Login</a></ng-template>
      </nav>
    </header>
    <router-outlet></router-outlet>
  `
})
export class CustomerNavComponent {
  constructor(public auth: AuthService) {}
}
