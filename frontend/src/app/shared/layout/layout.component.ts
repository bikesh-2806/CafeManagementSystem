import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { OrderNotificationService } from '.././order-notification.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  navOpen = false;
  @ViewChild('profileMenu') profileMenu?: ElementRef<HTMLDetailsElement>;
  @ViewChild('notificationMenu') notificationMenu?: ElementRef<HTMLDetailsElement>;

  constructor(public auth: AuthService, public notifications: OrderNotificationService) {}
  closeNav() { this.navOpen = false; }

  profileToggled(event: Event) {
    const details = event.target as HTMLDetailsElement;
    if (details.open && this.notificationMenu) this.notificationMenu.nativeElement.open = false;
  }

  notificationsToggled(event: Event) {
    const details = event.target as HTMLDetailsElement;
    if (!details.open) return;
    if (this.profileMenu) this.profileMenu.nativeElement.open = false;
    this.notifications.markRead();
  }
}
