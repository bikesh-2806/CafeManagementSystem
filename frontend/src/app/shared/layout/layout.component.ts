import { Component } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { OrderNotificationService } from '.././order-notification.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  navOpen = false;
  constructor(public auth: AuthService, public notifications: OrderNotificationService) {}
  closeNav() { this.navOpen = false; }
}
