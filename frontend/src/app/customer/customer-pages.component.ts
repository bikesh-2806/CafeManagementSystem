import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { UiService } from '../shared/ui.service';

@Component({ selector: 'app-customer-dashboard', template: `<section class="page"><div class="page-title"><span class="eyebrow">Customer</span><h1>Dashboard</h1></div><div class="stats"><div><b>Menu</b><span>Browse by category and search.</span></div><div><b>Orders</b><span>Track your order history.</span></div><div><b>Reservations</b><span>Request a table.</span></div></div></section>` })
export class CustomerDashboardComponent {}

@Component({ selector: 'app-my-orders', template: `<section class="page"><div class="page-title"><span class="eyebrow">Customer</span><h1>My orders</h1></div><app-data-table [rows]="orders"></app-data-table></section>` })
export class MyOrdersComponent implements OnInit {
  orders: any[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.get<any[]>('orders?mine=true').subscribe(data => this.orders = data); }
}

@Component({
  selector: 'app-reservation-page',
  template: `<section class="page"><div class="page-title"><span class="eyebrow">Booking</span><h1>Reservation</h1></div><form class="panel wide" [formGroup]="form" (ngSubmit)="submit()" appFocusNext><div class="form-row"><label class="field">Table ID<input class="form-control" type="number" formControlName="tableId"></label><label class="field">Reservation date and time<input class="form-control" type="datetime-local" formControlName="reservationDate"></label><label class="field">Number of guests<input class="form-control" type="number" formControlName="numberOfGuests"></label></div><div class="actions"><button class="btn btn-primary">Reserve table</button></div></form><app-data-table [rows]="reservations"></app-data-table></section>`
})
export class ReservationPageComponent implements OnInit {
  reservations: any[] = [];
  form = this.fb.group({ customerId: [this.auth.user?.userId], tableId: [1], reservationDate: [''], numberOfGuests: [2] });
  constructor(private api: ApiService, private fb: FormBuilder, private auth: AuthService, private ui: UiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any[]>('reservations?mine=true').subscribe(data => this.reservations = data); }
  submit() { this.api.post('reservations', this.form.value).subscribe(() => { this.ui.toast('Reservation submitted'); this.load(); }); }
}

@Component({ selector: 'app-profile-page', template: `<section class="page"><div class="page-title"><span class="eyebrow">Account</span><h1>Profile</h1></div><div class="panel"><p><b>Name:</b> {{ auth.user?.fullName }}</p><p><b>Email:</b> {{ auth.user?.email }}</p><p><b>Role:</b> {{ auth.user?.role }}</p></div></section>` })
export class ProfilePageComponent {
  constructor(public auth: AuthService) {}
}
