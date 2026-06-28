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
  template: `
    <section class="page">
      <div class="toolbar-line">
        <div><span class="eyebrow">Browse</span><h1>Menu</h1></div>
        <div class="menu-tools">
          <label class="field search-field">Search menu
            <span class="input-with-icon"><i class="fa-solid fa-magnifying-glass"></i><input class="form-control" [(ngModel)]="search" (input)="load()" placeholder="Search dishes"></span>
          </label>
          <label class="field sort-field">Sort by
            <select class="form-select" [(ngModel)]="sort">
              <option value="name">Name</option>
              <option value="priceAsc">Price: low to high</option>
              <option value="priceDesc">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>
      <div class="category-strip" aria-label="Menu categories">
        <button type="button" [class.active]="selectedCategoryId === null && !showFavorites" (click)="selectCategory(null)">
          <i class="fa-solid fa-border-all"></i><span>All items</span><b>{{ totalItemCount }}</b>
        </button>
        <button type="button" [class.active]="showFavorites" (click)="selectFavorites()">
          <i class="fa-solid fa-heart"></i><span>Favorites</span><b>{{ favoriteIds.size }}</b>
        </button>
        <button type="button" *ngFor="let category of categories" [class.active]="selectedCategoryId === category.categoryId" (click)="selectCategory(category.categoryId)">
          <i class="fa-solid fa-bowl-food"></i><span>{{ category.categoryName }}</span><b>{{ category.menuItems?.length || 0 }}</b>
        </button>
      </div>
      <div class="menu-result-line"><span>{{ visibleItems.length }} {{ visibleItems.length === 1 ? 'item' : 'items' }}</span><span *ngIf="showFavorites">Saved on this device</span></div>
      <div class="grid menu-grid">
        <article class="card menu-card" *ngFor="let item of visibleItems">
          <button type="button" class="favorite-button" [class.active]="favoriteIds.has(item.menuItemId)" (click)="toggleFavorite(item)" [attr.aria-label]="favoriteIds.has(item.menuItemId) ? 'Remove from favorites' : 'Add to favorites'" [title]="favoriteIds.has(item.menuItemId) ? 'Remove from favorites' : 'Add to favorites'">
            <i class="fa-solid fa-heart"></i>
          </button>
          <img *ngIf="hasImage(item); else initial" class="menu-image" [src]="imageUrl(item)" [alt]="item.name" (error)="imageFailed(item)">
          <ng-template #initial><div class="image-fill">{{ item.name[0] }}</div></ng-template>
          <div class="menu-card-body"><h3>{{ item.name }}</h3><p>{{ item.description || 'Freshly prepared by HomeTown Cafe.' }}</p><b>{{ item.price | currency:'NPR ' }}</b></div>
        </article>
      </div>
      <p class="empty-state" *ngIf="!visibleItems.length"><i class="fa-solid fa-utensils"></i> {{ showFavorites ? 'No favorites saved yet.' : 'No menu items found in this category.' }}</p>
    </section>`
})
export class MenuPageComponent implements OnInit {
  items: MenuItem[] = [];
  categories: any[] = [];
  search = '';
  sort = 'name';
  selectedCategoryId: number | null = null;
  showFavorites = false;
  favoriteIds = this.readFavorites();
  failedImages = new Set<number>();
  constructor(private api: ApiService) {}
  get totalItemCount() { return this.categories.reduce((total, category) => total + (category.menuItems?.length || 0), 0); }
  get visibleItems() {
    const filtered = this.showFavorites ? this.items.filter(item => this.favoriteIds.has(item.menuItemId)) : [...this.items];
    return filtered.sort((a, b) => {
      if (this.sort === 'priceAsc') return a.price - b.price;
      if (this.sort === 'priceDesc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
  }
  ngOnInit() {
    this.api.get<any[]>('menu-categories').subscribe(data => this.categories = data.filter(category => category.isActive));
    this.load();
  }
  selectCategory(categoryId: number | null) {
    this.showFavorites = false;
    this.selectedCategoryId = categoryId;
    this.load();
  }
  selectFavorites() {
    this.showFavorites = true;
    this.selectedCategoryId = null;
    this.load();
  }
  toggleFavorite(item: MenuItem) {
    if (this.favoriteIds.has(item.menuItemId)) this.favoriteIds.delete(item.menuItemId);
    else this.favoriteIds.add(item.menuItemId);
    this.favoriteIds = new Set(this.favoriteIds);
    localStorage.setItem('homeTownCafeFavorites', JSON.stringify([...this.favoriteIds]));
  }
  load() {
    const query = [
      this.selectedCategoryId !== null ? `categoryId=${this.selectedCategoryId}` : '',
      this.search ? `search=${encodeURIComponent(this.search)}` : ''
    ].filter(Boolean).join('&');
    this.api.get<MenuItem[]>(`menu-items${query ? '?' + query : ''}`).subscribe(data => this.items = data);
  }
  hasImage(item: MenuItem) { return !!item.imageUrl && !this.failedImages.has(item.menuItemId); }
  imageFailed(item: MenuItem) { this.failedImages.add(item.menuItemId); }
  private readFavorites() {
    try {
      return new Set<number>(JSON.parse(localStorage.getItem('homeTownCafeFavorites') ?? '[]'));
    } catch {
      return new Set<number>();
    }
  }
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
