import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { MenuItem } from '../../core/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-menu-page',
  templateUrl: './menu-page.component.html',
  styleUrls: ['./menu-page.component.scss']
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

  get totalItemCount() {
    return this.categories.reduce((total, category) => total + (category.menuItems?.length || 0), 0);
  }

  get visibleItems() {
    const filtered = this.showFavorites
      ? this.items.filter(item => this.favoriteIds.has(item.menuItemId))
      : [...this.items];

    return filtered.sort((a, b) => {
      if (this.sort === 'priceAsc') return a.price - b.price;
      if (this.sort === 'priceDesc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
  }

  ngOnInit() {
    this.api.get<any[]>('menu-categories').subscribe(data => {
      this.categories = data.filter(category => category.isActive);
    });
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

    this.api.get<MenuItem[]>(`menu-items${query ? '?' + query : ''}`).subscribe(data => {
      this.items = data;
    });
  }

  hasImage(item: MenuItem) {
    return !!item.imageUrl
      && !item.imageUrl.toLowerCase().includes('loremflickr.com')
      && !this.failedImages.has(item.menuItemId);
  }

  imageFailed(item: MenuItem) {
    this.failedImages.add(item.menuItemId);
  }

  imageUrl(item: MenuItem) {
    const url = item.imageUrl ?? '';
    return url.startsWith('/uploads') ? `${environment.apiBaseUrl.replace('/api', '')}${url}` : url;
  }

  private readFavorites() {
    try {
      return new Set<number>(JSON.parse(localStorage.getItem('homeTownCafeFavorites') ?? '[]'));
    } catch {
      return new Set<number>();
    }
  }
}
