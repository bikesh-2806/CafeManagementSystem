import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MenuItem, Table } from '../../core/models';
import { UiService } from '../../shared/ui.service';

@Component({
  selector: 'app-current-orders',
  templateUrl: './current-orders.component.html',
  styleUrls: ['./current-orders.component.scss']
})
export class CurrentOrdersComponent implements OnInit {
  orders: any[] = [];
  constructor(private api: ApiService, private ui: UiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any[]>('orders?mine=true').subscribe(data => this.orders = data); }
  status(order: any, state: string) { this.api.patch(`orders/${order.orderId}/status`, { status: state }).subscribe(() => { this.ui.toast(`Order marked ${state}`); this.load(); }); }
}
