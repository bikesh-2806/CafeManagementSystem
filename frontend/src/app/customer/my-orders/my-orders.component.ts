import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { UiService } from '../../shared/ui.service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  orders: any[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.get<any[]>('orders?mine=true').subscribe(data => this.orders = data); }
}
