import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { UiService } from '../../shared/ui.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-list-page',
  templateUrl: './admin-list-page.component.html',
  styleUrls: ['./admin-list-page.component.scss']
})
export class AdminListPageComponent implements OnInit {
  title = 'Orders';
  rows: any[] = [];
  path = 'orders';
  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any[]>(this.path).subscribe(data => this.rows = data); }
}
