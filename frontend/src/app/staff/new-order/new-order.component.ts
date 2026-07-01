import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MenuItem, Table } from '../../core/models';
import { UiService } from '../../shared/ui.service';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss']
})
export class NewOrderComponent implements OnInit {
  menu: MenuItem[] = [];
  tables: Table[] = [];
  itemQueries: string[] = [];
  pickerOpen: boolean[] = [];
  tableQuery = '';
  tablePickerOpen = false;
  currentOrder: any = null;
  loadingOpenOrder = false;
  openOrderMessage = '';
  form = this.fb.group({
    customerId: [null],
    waiterId: [this.auth.user?.userId],
    tableId: [null as number | null, Validators.required],
    items: this.fb.array([])
  });
  get items() { return this.form.get('items') as FormArray; }
  constructor(private api: ApiService, private fb: FormBuilder, private auth: AuthService, private ui: UiService) {}
  ngOnInit() {
    this.api.get<MenuItem[]>('menu-items').subscribe(data => {
      this.menu = data;
      this.addItem();
    });
    this.api.get<Table[]>('tables').subscribe(data => this.tables = data);
  }

  resolveTable(query: string) {
    this.tableQuery = query;
    this.tablePickerOpen = true;
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const match = this.tables.find(table => table.tableNumber.toLocaleLowerCase() === normalizedQuery);
    this.form.get('tableId')?.setValue(match?.tableId ?? null);
    this.form.get('tableId')?.markAsTouched();
  }

  openTablePicker() {
    this.pickerOpen = this.pickerOpen.map(() => false);
    this.tablePickerOpen = true;
  }

  filteredTables() {
    const query = this.tableQuery.trim().toLocaleLowerCase();
    if (!query) return this.tables;
    return this.tables.filter(table =>
      table.tableNumber.toLocaleLowerCase().includes(query)
      || table.status.toLocaleLowerCase().includes(query)
      || String(table.capacity).includes(query)
    );
  }

  chooseTable(table: Table) {
    this.tableQuery = table.tableNumber;
    this.form.get('tableId')?.setValue(table.tableId);
    this.form.get('tableId')?.markAsTouched();
    this.tablePickerOpen = false;
  }

  selectedTable() {
    const tableId = this.form.get('tableId')?.value;
    return this.tables.find(table => table.tableId === tableId);
  }

  handleTableKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.tablePickerOpen = false;
      return;
    }
    if (event.key === 'Enter') {
      const firstMatch = this.filteredTables()[0];
      if (!firstMatch) return;
      event.preventDefault();
      this.chooseTable(firstMatch);
    }
  }

  closeTablePicker() {
    window.setTimeout(() => this.tablePickerOpen = false, 150);
  }
  addItem() {
    this.items.push(this.fb.group({
      menuItemId: [null as number | null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      specialNote: ['']
    }));
    this.itemQueries.push('');
    this.pickerOpen.push(false);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.itemQueries.splice(index, 1);
    this.pickerOpen.splice(index, 1);
  }

  cancelDraft() {
    this.currentOrder = null;
    this.openOrderMessage = '';
    this.items.clear();
    this.itemQueries = [];
    this.pickerOpen = [];
    this.addItem();
    this.ui.toast('Order draft cleared', 'info');
  }

  resolveMenuItem(index: number, query: string) {
    this.itemQueries[index] = query;
    this.pickerOpen[index] = true;
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const match = this.menu.find(item => item.name.toLocaleLowerCase() === normalizedQuery);
    this.items.at(index).get('menuItemId')?.setValue(match?.menuItemId ?? null);
    this.items.at(index).get('menuItemId')?.markAsTouched();
  }

  openMenuPicker(index: number) {
    this.tablePickerOpen = false;
    this.pickerOpen = this.pickerOpen.map((_, itemIndex) => itemIndex === index);
  }

  filteredMenu(index: number) {
    const query = (this.itemQueries[index] ?? '').trim().toLocaleLowerCase();
    const availableItems = this.menu.filter(item => item.isAvailable);
    if (!query) return availableItems.slice(0, 12);

    return availableItems
      .filter(item =>
        item.name.toLocaleLowerCase().includes(query)
        || item.category?.categoryName.toLocaleLowerCase().includes(query)
        || item.description?.toLocaleLowerCase().includes(query)
      )
      .slice(0, 12);
  }

  chooseMenuItem(index: number, item: MenuItem) {
    this.itemQueries[index] = item.name;
    this.items.at(index).get('menuItemId')?.setValue(item.menuItemId);
    this.items.at(index).get('menuItemId')?.markAsTouched();
    this.pickerOpen[index] = false;
  }

  handlePickerKeydown(index: number, event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.pickerOpen[index] = false;
      return;
    }

    if (event.key === 'Enter') {
      const firstMatch = this.filteredMenu(index)[0];
      if (!firstMatch) return;
      event.preventDefault();
      this.chooseMenuItem(index, firstMatch);
    }
  }

  closePicker(index: number) {
    window.setTimeout(() => this.pickerOpen[index] = false, 150);
  }

  selectedMenuItem(index: number) {
    const menuItemId = this.items.at(index).get('menuItemId')?.value;
    return this.menu.find(item => item.menuItemId === menuItemId);
  }
  loadOpenOrder() {
    const tableId = this.form.value.tableId;
    if (!tableId) {
      this.ui.toast('Select a table first', 'error');
      return;
    }
    this.loadingOpenOrder = true;
    this.openOrderMessage = '';
    this.api.get<any>(`orders/open?tableId=${tableId}`).subscribe({
      next: order => {
        this.loadingOpenOrder = false;
        this.currentOrder = order;
        if (order) {
          this.ui.toast(`Loaded order #${order.orderId}`, 'info');
        } else {
          this.openOrderMessage = `No open order for table ${tableId}. Add items below and submit to create a new order.`;
          this.ui.toast('No open order found. You can create a new one below.', 'info');
        }
      },
      error: () => {
        this.loadingOpenOrder = false;
        this.currentOrder = null;
        this.openOrderMessage = 'Unable to check open orders. Please try again.';
        this.ui.toast('Unable to check open orders', 'error');
      }
    });
  }
  submit() {
    this.api.post<any>('orders', this.form.value).subscribe({
      next: order => {
        this.ui.toast(this.currentOrder ? 'Items added to existing order' : 'Order submitted');
        this.currentOrder = order;
        this.items.clear();
        this.itemQueries = [];
        this.pickerOpen = [];
        this.addItem();
        this.loadOpenOrder();
      },
      error: () => this.ui.toast('Unable to submit order', 'error')
    });
  }
  updateExistingItem(item: any) {
    this.api.put(`orders/${this.currentOrder.orderId}/items/${item.orderItemId}`, { quantity: item.quantity, specialNote: item.specialNote ?? '' }).subscribe(() => {
      this.ui.toast('Order item updated');
      this.loadOpenOrder();
    });
  }
  async deleteExistingItem(item: any) {
    if (!await this.ui.confirm(`Remove ${item.menuItem?.name} from this order?`, 'Delete order item', 'Remove')) return;
    this.api.delete(`orders/${this.currentOrder.orderId}/items/${item.orderItemId}`).subscribe(() => {
      this.ui.toast('Order item removed');
      this.loadOpenOrder();
    });
  }
}
