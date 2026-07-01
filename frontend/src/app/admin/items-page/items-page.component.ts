import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { UiService } from '../../shared/ui.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-items-page',
  templateUrl: './items-page.component.html',
  styleUrls: ['./items-page.component.scss']
})
export class ItemsPageComponent implements OnInit {
  rows: any[] = [];
  categories: any[] = [];
  editingItemId: number | null = null;
  uploadingImage = false;
  form = this.fb.group({ name: ['', Validators.required], description: [''], price: [0, Validators.required], imageUrl: [''], categoryId: [1], isAvailable: [true] });
  constructor(private api: ApiService, private fb: FormBuilder, private ui: UiService) {}
  get imagePreviewUrl() {
    const url = this.form.value.imageUrl ?? '';
    return url.startsWith('/uploads') ? `${environment.apiBaseUrl.replace('/api', '')}${url}` : url;
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
    this.uploadingImage = true;
    const formData = new FormData();
    formData.append('image', file);
    this.api.upload<any>('menu-items/upload-image', formData).subscribe({
      next: result => {
        this.form.patchValue({ imageUrl: result.imageUrl });
        this.uploadingImage = false;
        this.ui.toast('Image uploaded. Save the item to apply it.');
      },
      error: () => {
        this.uploadingImage = false;
        this.ui.toast('Image upload failed', 'error');
      }
    });
  }
  async delete(row: any) { if (await this.ui.confirm(`Delete ${row.name}?`, 'Delete menu item', 'Delete')) this.api.delete(`menu-items/${row.menuItemId}`).subscribe(() => { this.ui.toast('Menu item deleted'); this.load(); }); }
}
