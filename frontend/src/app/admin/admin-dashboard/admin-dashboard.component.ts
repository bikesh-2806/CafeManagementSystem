import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { UiService } from '../../shared/ui.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  cards = [{ label: 'Users', value: 0 }, { label: 'Menu Items', value: 0 }, { label: 'Tables', value: 0 }, { label: 'Orders', value: 0 }];
  constructor(private api: ApiService) {}
  ngOnInit() { ['users', 'menu-items', 'tables', 'orders'].forEach((path, i) => this.api.get<any[]>(path).subscribe(data => this.cards[i].value = data.length)); }
}
