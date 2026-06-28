import { Component } from '@angular/core';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-customer-nav',
  template: `
    <header class="top-nav" [class.nav-open]="navOpen">
      <strong><i class="fa-solid fa-mug-hot"></i> HomeTown Cafe</strong>
      <button type="button" class="nav-toggle" (click)="navOpen = !navOpen" [attr.aria-expanded]="navOpen" aria-label="Toggle navigation">
        <i class="fa-solid" [class.fa-bars]="!navOpen" [class.fa-xmark]="navOpen"></i>
      </button>
      <nav [class.open]="navOpen">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeNav()"><i class="fa-solid fa-house"></i><span>Home</span></a>
        <a routerLink="/menu" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-utensils"></i><span>Menu</span></a>
        <a routerLink="/customer/orders" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-receipt"></i><span>My Orders</span></a>
        <a routerLink="/customer/reservation" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-calendar-check"></i><span>Reservation</span></a>
        <a routerLink="/customer/profile" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-user"></i><span>Profile</span></a>
        <button *ngIf="auth.user; else loginLink" class="ghost" (click)="auth.logout()"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
        <ng-template #loginLink><a routerLink="/login" routerLinkActive="active" (click)="closeNav()"><i class="fa-solid fa-right-to-bracket"></i><span>Login</span></a></ng-template>
      </nav>
    </header>
    <router-outlet></router-outlet>
  `
})
export class CustomerNavComponent {
  navOpen = false;
  constructor(public auth: AuthService) {}
  closeNav() { this.navOpen = false; }
}
