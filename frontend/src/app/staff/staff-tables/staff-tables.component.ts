import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MenuItem, Table } from '../../core/models';
import { UiService } from '../../shared/ui.service';

@Component({
  selector: 'app-staff-tables',
  templateUrl: './staff-tables.component.html',
  styleUrls: ['./staff-tables.component.scss']
})
export class StaffTablesComponent implements OnInit {
  tables: Table[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.get<Table[]>('tables?availableOnly=true').subscribe(data => this.tables = data); }
}
