import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { MenuItem } from '../core/models';
import { UiService } from '../shared/ui.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home-page',
  template: `<section class="hero"><div><span class="eyebrow">Restaurant management</span><h1>HomeTown Cafe</h1><p>Fresh tableside ordering, reservations, billing, and reporting in one calm workspace.</p><a class="button" routerLink="/menu">View Menu</a></div></section><section class="page"><div class="page-title"><div><span class="eyebrow">Operations</span><h1>Today at the cafe</h1></div></div><div class="stats"><div><b>Fast orders</b><span>Staff can create and track orders by table.</span></div><div><b>Simple billing</b><span>Bills and payment status are one click away.</span></div><div><b>Reservations</b><span>Customers can request tables online.</span></div></div></section>`
})
export class HomePageComponent {}

@Component({
  selector: 'app-menu-page',
  template: `<section class="page"><div class="toolbar-line"><div><span class="eyebrow">Browse</span><h1>Menu</h1></div><label class="field search-field">Search menu<input class="form-control" [(ngModel)]="search" (input)="load()" placeholder="Search dishes" /></label></div><div class="grid menu-grid"><article class="card menu-card" *ngFor="let item of items"><img *ngIf="item.imageUrl; else initial" class="menu-image" [src]="imageUrl(item)" [alt]="item.name"><ng-template #initial><div class="image-fill">{{ item.name[0] }}</div></ng-template><div class="menu-card-body"><h3>{{ item.name }}</h3><p>{{ item.description || 'Freshly prepared by HomeTown Cafe.' }}</p><b>{{ item.price | currency:'NPR ' }}</b></div></article></div><p class="empty-state" *ngIf="!items.length">No menu items found.</p></section>`
})
export class MenuPageComponent implements OnInit {
  items: MenuItem[] = [];
  search = '';
  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<MenuItem[]>(`menu-items${this.search ? '?search=' + this.search : ''}`).subscribe(data => this.items = data); }
  imageUrl(item: MenuItem) {
    const url = item.imageUrl ?? '';
    return url.startsWith('/uploads') ? `${environment.apiBaseUrl.replace('/api', '')}${url}` : url;
  }
}

@Component({
  selector: 'app-login-page',
  template: `<section class="auth-page"><form class="panel" [formGroup]="form" (ngSubmit)="submit()" appFocusNext><span class="eyebrow">Welcome back</span><h1>Login</h1><label class="field">Email address<input class="form-control" formControlName="email" /></label><label class="field">Password<input class="form-control" type="password" formControlName="password" /></label><button class="btn btn-primary" [disabled]="form.invalid || loading">Login</button><p class="error" *ngIf="error">{{ error }}</p><a routerLink="/register">Create customer account</a></form></section>`
})
export class LoginPageComponent {
  loading = false;
  error = '';
  form = this.fb.group({ email: ['admin@hometowncafe.com', [Validators.required, Validators.email]], password: ['Admin@123', Validators.required] });
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private ui: UiService) {}
  submit() {
    this.loading = true;
    this.auth.login(this.form.value.email!, this.form.value.password!).subscribe({
      next: user => { this.ui.toast('Login successful'); this.router.navigate([user.role === 'Admin' ? '/admin/dashboard' : user.role === 'Customer' ? '/customer/dashboard' : '/staff/dashboard']); },
      error: err => { this.error = err.error?.message ?? 'Login failed'; this.ui.toast(this.error, 'error'); this.loading = false; }
    });
  }
}

@Component({
  selector: 'app-register-page',
  template: `<section class="auth-page"><form class="panel" [formGroup]="form" (ngSubmit)="submit()" appFocusNext><span class="eyebrow">Customer account</span><h1>Register</h1><label class="field">Full name<input class="form-control" formControlName="fullName" /></label><label class="field">Email address<input class="form-control" formControlName="email" /></label><label class="field">Phone number<input class="form-control" formControlName="phoneNumber" /></label><label class="field">Password<input class="form-control" type="password" formControlName="password" /></label><button class="btn btn-primary" [disabled]="form.invalid">Register</button></form></section>`
})
export class RegisterPageComponent {
  form = this.fb.group({ fullName: ['', Validators.required], email: ['', [Validators.required, Validators.email]], phoneNumber: [''], password: ['', [Validators.required, Validators.minLength(6)]], role: ['Customer'] });
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private ui: UiService) {}
  submit() { this.auth.register(this.form.value).subscribe(() => { this.ui.toast('Registration completed'); this.router.navigate(['/customer/dashboard']); }); }
}

@Component({ selector: 'app-simple-page', template: `<section class="page"><div class="page-title"><div><span class="eyebrow">Info</span><h1>{{ title }}</h1></div></div><p>{{ body }}</p></section>` })
export class SimplePageComponent {
  title = 'About HomeTown Cafe';
  body = 'A full-stack restaurant management system for admins, staff, and customers.';
}
