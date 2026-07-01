import { Component } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-customer-nav',
  templateUrl: './customer-nav.component.html',
  styleUrls: ['./customer-nav.component.scss']
})
export class CustomerNavComponent {
  navOpen = false;
  constructor(public auth: AuthService) {}
  closeNav() { this.navOpen = false; }
}
