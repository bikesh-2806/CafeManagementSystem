import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { UiService } from '../../shared/ui.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-users-page',
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.scss']
})
export class UsersPageComponent implements OnInit {
  users: any[] = [];
  form = this.fb.group({ fullName: ['', Validators.required], email: ['', Validators.required], phoneNumber: [''], role: ['Waiter'], password: ['Password@123'], isActive: [true] });
  constructor(private api: ApiService, private fb: FormBuilder, private ui: UiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any[]>('users').subscribe(data => this.users = data); }
  save() { this.api.post('users', this.form.value).subscribe({ next: () => { this.ui.toast('User saved successfully'); this.form.reset({ role: 'Waiter', isActive: true, password: 'Password@123' }); this.load(); }, error: () => this.ui.toast('Unable to save user', 'error') }); }
  async delete(row: any) { if (await this.ui.confirm(`Delete ${row.fullName}?`, 'Delete user', 'Delete')) this.api.delete(`users/${row.userId}`).subscribe(() => { this.ui.toast('User deleted'); this.load(); }); }
}
