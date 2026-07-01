import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { UiService } from '../../shared/ui.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-categories-page',
  templateUrl: './categories-page.component.html',
  styleUrls: ['./categories-page.component.scss']
})
export class CategoriesPageComponent implements OnInit {
  rows: any[] = [];
  form = this.fb.group({ categoryName: ['', Validators.required], description: [''], isActive: [true] });
  constructor(private api: ApiService, private fb: FormBuilder, private ui: UiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any[]>('menu-categories').subscribe(data => this.rows = data); }
  save() { this.api.post('menu-categories', this.form.value).subscribe(() => { this.ui.toast('Category saved'); this.form.reset({ isActive: true }); this.load(); }); }
  async delete(row: any) { if (await this.ui.confirm(`Delete ${row.categoryName}?`, 'Delete category', 'Delete')) this.api.delete(`menu-categories/${row.categoryId}`).subscribe(() => { this.ui.toast('Category deleted'); this.load(); }); }
}
