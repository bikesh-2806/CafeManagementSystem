import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { UiService } from '../../shared/ui.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reports-page',
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.scss']
})
export class ReportsPageComponent implements OnInit {
  revenue: any;
  popular: any[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.get<any>('reports/revenue').subscribe(x => this.revenue = x); this.api.get<any[]>('reports/popular-items').subscribe(x => this.popular = x); }
}
