import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { UiService } from '../shared/ui.service';

@Component({
  selector: 'app-admin-dashboard',
  template: `<section class="page"><div class="page-title"><span class="eyebrow">Admin</span><h1>Dashboard</h1></div><div class="stats"><div *ngFor="let item of cards"><b>{{ item.value }}</b><span>{{ item.label }}</span></div></div></section>`
})
export class AdminDashboardComponent implements OnInit {
  cards = [{ label: 'Users', value: 0 }, { label: 'Menu Items', value: 0 }, { label: 'Tables', value: 0 }, { label: 'Orders', value: 0 }];
  constructor(private api: ApiService) {}
  ngOnInit() { ['users', 'menu-items', 'tables', 'orders'].forEach((path, i) => this.api.get<any[]>(path).subscribe(data => this.cards[i].value = data.length)); }
}

@Component({
  selector: 'app-users-page',
  template: `
    <section class="page">
      <div class="page-title"><span class="eyebrow">Admin</span><h1>User management</h1></div>
      <form class="panel wide" [formGroup]="form" (ngSubmit)="save()" appFocusNext>
        <div class="form-row">
          <label class="field">Full name<input class="form-control" formControlName="fullName"></label>
          <label class="field">Email<input class="form-control" formControlName="email"></label>
          <label class="field">Phone number<input class="form-control" formControlName="phoneNumber"></label>
          <label class="field">Role<select class="form-select" formControlName="role"><option>Waiter</option><option>Staff</option><option>Customer</option><option>Admin</option></select></label>
          <label class="field">Password<input class="form-control" formControlName="password"></label>
        </div>
        <div class="actions"><button class="btn btn-primary" [disabled]="form.invalid">Save user</button></div>
      </form>
      <app-data-table [rows]="users" (deleteRow)="delete($event)"></app-data-table>
    </section>`
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

@Component({
  selector: 'app-categories-page',
  template: `<section class="page"><div class="page-title"><span class="eyebrow">Menu</span><h1>Category management</h1></div><form class="panel wide" [formGroup]="form" (ngSubmit)="save()" appFocusNext><div class="form-row"><label class="field">Category name<input class="form-control" formControlName="categoryName"></label><label class="field">Description<input class="form-control" formControlName="description"></label></div><div class="actions"><button class="btn btn-primary" [disabled]="form.invalid">Save category</button></div></form><app-data-table [rows]="rows" (deleteRow)="delete($event)"></app-data-table></section>`
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

@Component({
  selector: 'app-items-page',
  template: `
    <section class="page">
      <div class="page-title"><span class="eyebrow">Menu</span><h1>Item management</h1></div>
      <form class="panel wide" [formGroup]="form" (ngSubmit)="save()" appFocusNext>
        <div class="form-row">
          <label class="field">Item name<input class="form-control" formControlName="name"></label>
          <label class="field">Description<input class="form-control" formControlName="description"></label>
          <label class="field">Price<input class="form-control" type="number" formControlName="price"></label>
          <label class="field">Category name<select class="form-select" formControlName="categoryId"><option *ngFor="let category of categories" [ngValue]="category.categoryId">{{ category.categoryName }}</option></select></label>
          <label class="field">Upload image<input class="form-control" type="file" accept="image/*" (change)="uploadImage($event)"></label>
          <label class="field">Available<select class="form-select" formControlName="isAvailable"><option [ngValue]="true">Yes</option><option [ngValue]="false">No</option></select></label>
        </div>
        <div class="image-preview" *ngIf="form.value.imageUrl"><img [src]="imagePreviewUrl" alt="Menu item preview"><span>{{ form.value.imageUrl }}</span></div>
        <div class="actions"><button class="btn btn-primary" [disabled]="form.invalid">{{ editingItemId ? 'Update item' : 'Save item' }}</button><button type="button" class="btn btn-outline-secondary" *ngIf="editingItemId" (click)="cancelEdit()">Cancel edit</button></div>
      </form>
      <app-data-table [rows]="rows" (editRow)="edit($event)" (deleteRow)="delete($event)"></app-data-table>
    </section>`
})
export class ItemsPageComponent implements OnInit {
  rows: any[] = [];
  categories: any[] = [];
  editingItemId: number | null = null;
  form = this.fb.group({ name: ['', Validators.required], description: [''], price: [0, Validators.required], imageUrl: [''], categoryId: [1], isAvailable: [true] });
  constructor(private api: ApiService, private fb: FormBuilder, private ui: UiService) {}
  get imagePreviewUrl() {
    const url = this.form.value.imageUrl ?? '';
    return url.startsWith('/uploads') ? `http://localhost:5116${url}` : url;
  }
  ngOnInit() { this.load(); this.api.get<any[]>('menu-categories').subscribe(data => this.categories = data); }
  load() {
    this.api.get<any[]>('menu-items').subscribe(data => this.rows = data.map(item => ({
      menuItemId: item.menuItemId,
      name: item.name,
      description: item.description,
      price: item.price,
      categoryName: item.category?.categoryName,
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      categoryId: item.categoryId
    })));
  }
  save() {
    const request = this.editingItemId
      ? this.api.put(`menu-items/${this.editingItemId}`, this.form.value)
      : this.api.post('menu-items', this.form.value);
    request.subscribe(() => { this.ui.toast(this.editingItemId ? 'Menu item updated' : 'Menu item saved'); this.cancelEdit(); this.load(); });
  }
  edit(row: any) {
    this.editingItemId = row.menuItemId;
    this.form.patchValue({ name: row.name, description: row.description, price: row.price, imageUrl: row.imageUrl, categoryId: row.categoryId, isAvailable: row.isAvailable });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  cancelEdit() {
    this.editingItemId = null;
    this.form.reset({ categoryId: this.categories[0]?.categoryId ?? 1, price: 0, isAvailable: true, imageUrl: '' });
  }
  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    this.api.upload<any>('menu-items/upload-image', formData).subscribe({
      next: result => { this.form.patchValue({ imageUrl: result.imageUrl }); this.ui.toast('Image uploaded'); },
      error: () => this.ui.toast('Image upload failed', 'error')
    });
  }
  async delete(row: any) { if (await this.ui.confirm(`Delete ${row.name}?`, 'Delete menu item', 'Delete')) this.api.delete(`menu-items/${row.menuItemId}`).subscribe(() => { this.ui.toast('Menu item deleted'); this.load(); }); }
}

@Component({
  selector: 'app-tables-admin-page',
  template: `<section class="page"><div class="page-title"><span class="eyebrow">Floor</span><h1>Table management</h1></div><form class="panel wide" [formGroup]="form" (ngSubmit)="save()" appFocusNext><div class="form-row"><label class="field">Table number<input class="form-control" formControlName="tableNumber"></label><label class="field">Capacity<input class="form-control" type="number" formControlName="capacity"></label><label class="field">Status<select class="form-select" formControlName="status"><option>Available</option><option>Occupied</option><option>Reserved</option></select></label></div><div class="actions"><button class="btn btn-primary" [disabled]="form.invalid">Save table</button></div></form><app-data-table [rows]="rows" (deleteRow)="delete($event)"></app-data-table></section>`
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

@Component({ selector: 'app-admin-list-page', template: `<section class="page"><div class="page-title"><span class="eyebrow">Records</span><h1>{{ title }}</h1></div><app-data-table [rows]="rows"></app-data-table></section>` })
export class AdminListPageComponent implements OnInit {
  title = 'Orders';
  rows: any[] = [];
  path = 'orders';
  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any[]>(this.path).subscribe(data => this.rows = data); }
}

@Component({
  selector: 'app-reports-page',
  template: `<section class="page"><div class="page-title"><span class="eyebrow">Reports</span><h1>Sales report</h1></div><div class="stats"><div><b>{{ revenue?.dailyRevenue | currency:'NPR ' }}</b><span>Daily revenue</span></div><div><b>{{ revenue?.weeklyRevenue | currency:'NPR ' }}</b><span>Weekly revenue</span></div><div><b>{{ revenue?.monthlyRevenue | currency:'NPR ' }}</b><span>Monthly revenue</span></div></div><h2 class="section-heading">Most ordered menu items</h2><app-data-table [rows]="popular"></app-data-table></section>`
})
export class ReportsPageComponent implements OnInit {
  revenue: any;
  popular: any[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.get<any>('reports/revenue').subscribe(x => this.revenue = x); this.api.get<any[]>('reports/popular-items').subscribe(x => this.popular = x); }
}

@Component({
  selector: 'app-fonepay-settings',
  template: `
    <section class="page">
      <div class="page-title"><div><span class="eyebrow">Payments</span><h1>Fonepay configuration</h1></div></div>
      <form class="panel wide" [formGroup]="form" (ngSubmit)="save()" appFocusNext>
        <div class="form-row">
          <label class="field">Enabled<select class="form-select" formControlName="isEnabled"><option [ngValue]="true">Yes</option><option [ngValue]="false">No</option></select></label>
          <label class="field">Mode<select class="form-select" formControlName="useDemoMode"><option [ngValue]="true">Local demo</option><option [ngValue]="false">Fonepay API</option></select></label>
          <label class="field">Merchant code<input class="form-control" formControlName="merchantCode"></label>
        </div>
        <label class="field">Dynamic QR base URL<input class="form-control" formControlName="baseUrl"></label>
        <div class="form-row">
          <label class="field">Merchant secret<input class="form-control" type="password" formControlName="merchantSecret" [placeholder]="saved?.hasMerchantSecret ? 'Saved - leave blank to keep' : ''"></label>
          <label class="field">Username<input class="form-control" formControlName="username" [placeholder]="saved?.hasUsername ? 'Saved - leave blank to keep' : ''"></label>
          <label class="field">Password<input class="form-control" type="password" formControlName="password" [placeholder]="saved?.hasPassword ? 'Saved - leave blank to keep' : ''"></label>
        </div>
        <div class="payment-mode-note" [class.demo]="form.value.useDemoMode">
          <b>{{ form.value.useDemoMode ? 'Demo mode' : 'Fonepay API mode' }}</b>
          <span>{{ form.value.useDemoMode ? 'Creates a local, non-payable QR for testing bill amount and printing.' : 'Uses encrypted credentials and sends requests to the configured Fonepay endpoint.' }}</span>
        </div>
        <div class="actions"><button class="btn btn-primary" [disabled]="form.invalid || saving">{{ saving ? 'Saving...' : 'Save configuration' }}</button></div>
      </form>
    </section>`
})
export class FonepaySettingsComponent implements OnInit {
  saved: any;
  saving = false;
  form = this.fb.group({
    isEnabled: [true],
    useDemoMode: [true],
    baseUrl: ['https://merchantapi.fonepay.com/api/merchant/merchantDetailsForThirdParty', Validators.required],
    merchantCode: [''],
    merchantSecret: [''],
    username: [''],
    password: ['']
  });
  constructor(private api: ApiService, private fb: FormBuilder, private ui: UiService) {}
  ngOnInit() {
    this.api.get<any>('fonepay/configuration').subscribe(config => {
      this.saved = config;
      this.form.patchValue({
        isEnabled: config.isEnabled,
        useDemoMode: config.useDemoMode,
        baseUrl: config.baseUrl,
        merchantCode: config.merchantCode
      });
    });
  }
  save() {
    this.saving = true;
    this.api.put<any>('fonepay/configuration', this.form.value).subscribe({
      next: config => {
        this.saved = config;
        this.form.patchValue({ merchantSecret: '', username: '', password: '' });
        this.saving = false;
        this.ui.toast('Fonepay configuration saved');
      },
      error: err => {
        this.saving = false;
        this.ui.toast(err.error?.message ?? 'Unable to save Fonepay configuration', 'error');
      }
    });
  }
}

@Component({
  selector: 'app-data-table',
  template: `<div class="table-wrap shadow-sm"><table class="table table-hover align-middle mb-0"><thead><tr><th *ngFor="let key of keys">{{ label(key) }}</th><th *ngIf="editRow.observers.length || deleteRow.observers.length">Action</th></tr></thead><tbody><tr *ngFor="let row of rows"><td *ngFor="let key of keys" [attr.data-label]="label(key)">{{ value(row[key]) }}</td><td data-label="Action" *ngIf="editRow.observers.length || deleteRow.observers.length"><button class="btn btn-sm btn-outline-primary me-2" *ngIf="editRow.observers.length" (click)="editRow.emit(row)">Edit</button><button class="btn btn-sm btn-danger" *ngIf="deleteRow.observers.length" (click)="deleteRow.emit(row)">Delete</button></td></tr><tr *ngIf="!rows.length"><td class="text-muted p-4" colspan="9">No records found.</td></tr></tbody></table></div>`
})
export class DataTableComponent {
  @Input() rows: any[] = [];
  @Output() editRow = new EventEmitter<any>();
  @Output() deleteRow = new EventEmitter<any>();
  get keys() { return this.rows.length ? Object.keys(this.rows[0]).filter(k => typeof this.rows[0][k] !== 'object' && k !== 'categoryId').slice(0, 8) : []; }
  label(key: string) { return key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()); }
  value(v: any) { return typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v; }
}
