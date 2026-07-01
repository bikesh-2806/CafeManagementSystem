import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { UiService } from '../../shared/ui.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-tables-admin-page',
  templateUrl: './tables-admin-page.component.html',
  styleUrls: ['./tables-admin-page.component.scss']
})
export class TablesAdminPageComponent implements OnInit {
  rows: any[] = [];
  form = this.fb.group({ tableNumber: ['', Validators.required], capacity: [2], status: ['Available'] });
  constructor(private api: ApiService, private fb: FormBuilder, private ui: UiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any[]>('tables').subscribe(data => this.rows = data); }
  save() { this.api.post('tables', this.form.value).subscribe(() => { this.ui.toast('Table saved'); this.form.reset({ capacity: 2, status: 'Available' }); this.load(); }); }
  async delete(row: any) { if (await this.ui.confirm(`Delete table ${row.tableNumber}?`, 'Delete table', 'Delete')) this.api.delete(`tables/${row.tableId}`).subscribe(() => { this.ui.toast('Table deleted'); this.load(); }); }
}
