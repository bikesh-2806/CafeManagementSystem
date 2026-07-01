import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { UiService } from '../../shared/ui.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  @Input() rows: any[] = [];
  @Output() editRow = new EventEmitter<any>();
  @Output() deleteRow = new EventEmitter<any>();
  get keys() { return this.rows.length ? Object.keys(this.rows[0]).filter(k => typeof this.rows[0][k] !== 'object' && k !== 'categoryId').slice(0, 8) : []; }
  label(key: string) { return key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()); }
  value(v: any) { return typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v; }
}
