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
  currentOrder: any = null;
  loadingOpenOrder = false;
  openOrderMessage = '';
  form = this.fb.group({ customerId: [null], waiterId: [this.auth.user?.userId], tableId: [1, Validators.required], items: this.fb.array([]) });
  get items() { return this.form.get('items') as FormArray; }
  constructor(private api: ApiService, private fb: FormBuilder, private auth: AuthService, private ui: UiService) {}
  ngOnInit() { this.api.get<MenuItem[]>('menu-items').subscribe(data => { this.menu = data; this.addItem(); }); }
  addItem() { this.items.push(this.fb.group({ menuItemId: [this.menu[0]?.menuItemId ?? 1], quantity: [1, Validators.required], specialNote: [''] })); }
  removeItem(index: number) { this.items.removeAt(index); }
  loadOpenOrder() {
    const tableId = this.form.value.tableId;
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
      next: order => { this.ui.toast(this.currentOrder ? 'Items added to existing order' : 'Order submitted'); this.currentOrder = order; this.items.clear(); this.addItem(); this.loadOpenOrder(); },
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
