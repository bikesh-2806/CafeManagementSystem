import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { MenuItem, Table } from '../core/models';
import { UiService } from '../shared/ui.service';

@Component({ selector: 'app-staff-dashboard', template: `<section class="page"><div class="page-title"><span class="eyebrow">Service</span><h1>Staff dashboard</h1></div><div class="stats"><div><b>Tables</b><span>View open tables</span></div><div><b>Orders</b><span>Create and update order status</span></div><div><b>Bills</b><span>Generate bills and mark paid</span></div></div></section>` })
export class StaffDashboardComponent {}

@Component({ selector: 'app-staff-tables', template: `<section class="page"><div class="page-title"><span class="eyebrow">Floor</span><h1>Table selection</h1></div><div class="grid compact"><article class="card" *ngFor="let table of tables"><h3>{{ table.tableNumber }}</h3><p>{{ table.capacity }} seats</p><span class="badge text-bg-success">{{ table.status }}</span></article></div></section>` })
export class StaffTablesComponent implements OnInit {
  tables: Table[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.get<Table[]>('tables?availableOnly=true').subscribe(data => this.tables = data); }
}

@Component({
  selector: 'app-new-order',
  template: `
    <section class="page">
      <div class="page-title"><span class="eyebrow">Orders</span><h1>New order</h1></div>
      <form class="panel wide" [formGroup]="form" (ngSubmit)="submit()" appFocusNext>
        <div class="form-row">
          <label class="field">Table ID<input class="form-control" type="number" formControlName="tableId"></label>
          <label class="field">Customer ID optional<input class="form-control" type="number" formControlName="customerId"></label>
          <button type="button" class="btn btn-outline-primary align-self-end" (click)="loadOpenOrder()">Load open order</button>
        </div>
        <div class="open-order-box" *ngIf="currentOrder">
          <div class="d-flex justify-content-between gap-2 flex-wrap">
            <div><b>Editing order #{{ currentOrder.orderId }}</b><p>Table {{ currentOrder.table?.tableNumber }} - {{ currentOrder.orderStatus }} - {{ currentOrder.totalAmount | currency:'NPR ' }}</p></div>
            <span class="badge text-bg-info align-self-start">Single active bill</span>
          </div>
          <div class="order-edit-row" *ngFor="let item of currentOrder.orderItems">
            <span>{{ item.menuItem?.name }}</span>
            <input class="form-control" type="number" min="1" [(ngModel)]="item.quantity" [ngModelOptions]="{standalone: true}">
            <input class="form-control" [(ngModel)]="item.specialNote" [ngModelOptions]="{standalone: true}" placeholder="Special note">
            <button type="button" class="btn btn-sm btn-outline-primary" (click)="updateExistingItem(item)">Update</button>
            <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteExistingItem(item)">Delete</button>
          </div>
        </div>
        <h2 class="section-heading">{{ currentOrder ? 'Add more items to this order' : 'Create order items' }}</h2>
        <div formArrayName="items">
          <div class="form-row order-line" *ngFor="let group of items.controls; let i = index" [formGroupName]="i">
            <label class="field">Menu item<select class="form-select" formControlName="menuItemId"><option *ngFor="let item of menu" [value]="item.menuItemId">{{ item.name }} - {{ item.price | currency:'NPR ' }}</option></select></label>
            <label class="field">Quantity<input class="form-control" type="number" formControlName="quantity"></label>
            <label class="field">Special note<input class="form-control" formControlName="specialNote"></label>
            <button type="button" class="btn btn-outline-danger align-self-end" (click)="removeItem(i)" *ngIf="items.length > 1">Remove</button>
          </div>
        </div>
        <div class="actions"><button type="button" class="btn btn-outline-primary" (click)="addItem()">Add item</button><button class="btn btn-primary" [disabled]="form.invalid">{{ currentOrder ? 'Add to existing order' : 'Submit order' }}</button></div>
      </form>
    </section>`
})
export class NewOrderComponent implements OnInit {
  menu: MenuItem[] = [];
  currentOrder: any = null;
  form = this.fb.group({ customerId: [null], waiterId: [this.auth.user?.userId], tableId: [1, Validators.required], items: this.fb.array([]) });
  get items() { return this.form.get('items') as FormArray; }
  constructor(private api: ApiService, private fb: FormBuilder, private auth: AuthService, private ui: UiService) {}
  ngOnInit() { this.api.get<MenuItem[]>('menu-items').subscribe(data => { this.menu = data; this.addItem(); }); }
  addItem() { this.items.push(this.fb.group({ menuItemId: [this.menu[0]?.menuItemId ?? 1], quantity: [1, Validators.required], specialNote: [''] })); }
  removeItem(index: number) { this.items.removeAt(index); }
  loadOpenOrder() {
    const tableId = this.form.value.tableId;
    this.api.get<any>(`orders/open?tableId=${tableId}`).subscribe({
      next: order => { this.currentOrder = order; this.ui.toast(`Loaded order #${order.orderId}`, 'info'); },
      error: () => { this.currentOrder = null; this.ui.toast('No open editable order found for this table', 'info'); }
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

@Component({
  selector: 'app-current-orders',
  template: `<section class="page"><div class="page-title"><span class="eyebrow">Kitchen flow</span><h1>Current orders</h1></div><div class="grid"><article class="card" *ngFor="let order of orders"><div class="d-flex justify-content-between gap-2"><h3>Order #{{ order.orderId }}</h3><span class="badge text-bg-warning">{{ order.orderStatus }}</span></div><p>Table {{ order.table?.tableNumber }}</p><b>{{ order.totalAmount | currency:'NPR ' }}</b><div class="actions"><button class="btn btn-sm btn-outline-secondary" (click)="status(order, 'Preparing')">Preparing</button><button class="btn btn-sm btn-outline-secondary" (click)="status(order, 'Served')">Served</button><button class="btn btn-sm btn-success" (click)="status(order, 'Completed')">Completed</button></div></article></div></section>`
})
export class CurrentOrdersComponent implements OnInit {
  orders: any[] = [];
  constructor(private api: ApiService, private ui: UiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any[]>('orders?mine=true').subscribe(data => this.orders = data); }
  status(order: any, state: string) { this.api.patch(`orders/${order.orderId}/status`, { status: state }).subscribe(() => { this.ui.toast(`Order marked ${state}`); this.load(); }); }
}

@Component({
  selector: 'app-bills-page',
  template: `
    <section class="page">
      <div class="page-title"><span class="eyebrow">Billing</span><h1>Generate bill / payment update</h1></div>
      <form class="panel wide" [formGroup]="form" (ngSubmit)="generate()" appFocusNext>
        <div class="form-row">
          <label class="field">Order ID<input class="form-control" type="number" formControlName="orderId"></label>
          <label class="field">Discount amount<input class="form-control" type="number" formControlName="discountAmount"></label>
          <label class="field">Tax amount<input class="form-control" type="number" formControlName="taxAmount"></label>
          <label class="field">Payment method<select class="form-select" formControlName="paymentMethod"><option>Cash</option><option>Card</option><option>Online</option></select></label>
        </div>
        <div class="actions"><button class="btn btn-primary" [disabled]="form.invalid">Generate bill</button></div>
      </form>

      <div class="grid bills-grid">
        <article class="card" *ngFor="let bill of bills">
          <div class="d-flex justify-content-between gap-2"><h3>Bill #{{ bill.billId }}</h3><span class="badge" [class.text-bg-success]="bill.paymentStatus === 'Paid'" [class.text-bg-secondary]="bill.paymentStatus !== 'Paid'">{{ bill.paymentStatus }}</span></div>
          <p>Order #{{ bill.orderId }}<span *ngIf="bill.order?.table"> - Table {{ bill.order.table.tableNumber }}</span> - {{ bill.paymentMethod }}</p>
          <b>{{ bill.finalAmount | currency:'NPR ' }}</b>
          <div class="actions"><button class="btn btn-sm btn-outline-primary" [disabled]="loadingBill" (click)="preview(bill)">Preview</button><button class="btn btn-sm btn-success" (click)="markPaid(bill)">Mark paid</button><button class="btn btn-sm btn-dark" [disabled]="loadingBill" (click)="print(bill)">Print</button></div>
        </article>
      </div>
      <p class="text-muted" *ngIf="loadingBill">Loading bill item details...</p>

      <div class="modal-backdrop-custom" *ngIf="selectedBill">
        <div class="bill-preview">
          <div id="printable-bill">
            <h2>HomeTown Cafe</h2>
            <p>Bill #{{ selectedBill.billId }} | Order #{{ selectedBill.orderId }}<span *ngIf="selectedBill.order?.table"> | Table {{ selectedBill.order.table.tableNumber }}</span></p>
            <hr>
            <div class="bill-items" *ngIf="billItems(selectedBill).length; else noItems">
              <div class="bill-item bill-item-head"><span>Item</span><span>Qty</span><span>Rate</span><span>Amount</span></div>
              <div class="bill-item" *ngFor="let item of billItems(selectedBill)">
                <span><b>{{ item.menuItem?.name || ('Item #' + item.menuItemId) }}</b><small *ngIf="item.specialNote">{{ item.specialNote }}</small></span>
                <span>{{ item.quantity }}</span>
                <span>{{ item.unitPrice | currency:'NPR ' }}</span>
                <span>{{ item.subTotal | currency:'NPR ' }}</span>
              </div>
            </div>
            <ng-template #noItems><p class="text-muted">No item details available for this bill.</p></ng-template>
            <hr>
            <div class="bill-row"><span>Items subtotal</span><b>{{ selectedBill.totalAmount | currency:'NPR ' }}</b></div>
            <div class="bill-row discount"><span>Discount applied</span><b>- {{ selectedBill.discountAmount | currency:'NPR ' }}</b></div>
            <div class="bill-row tax"><span>Tax applied</span><b>+ {{ selectedBill.taxAmount | currency:'NPR ' }}</b></div>
            <div class="bill-row final"><span>Final amount</span><b>{{ selectedBill.finalAmount | currency:'NPR ' }}</b></div>
            <div class="payment-qr" *ngIf="fonepayQr">
              <img [src]="fonepayQr.qrImage" alt="Fonepay payment QR">
              <b>{{ fonepayQr.isDemo ? 'DEMO QR - NOT PAYABLE' : 'Scan with Fonepay-supported app' }}</b>
              <span>{{ fonepayQr.amount | currency:'NPR ' }} | {{ fonepayQr.prn }}</span>
            </div>
            <p>Payment: {{ selectedBill.paymentStatus }} / {{ selectedBill.paymentMethod }}</p>
            <p>Date: {{ selectedBill.billDate | date:'medium' }}</p>
          </div>
          <div class="actions"><button class="btn btn-outline-secondary" (click)="selectedBill = null">Close</button><button class="btn btn-outline-primary" [disabled]="qrLoading" (click)="generatePaymentQr()">{{ qrLoading ? 'Generating...' : 'Generate payment QR' }}</button><button class="btn btn-outline-success" *ngIf="fonepayQr && !fonepayQr.isDemo" (click)="checkPayment()">Check payment</button><button class="btn btn-dark" [disabled]="loadingBill" (click)="print(selectedBill)">Print bill</button></div>
        </div>
      </div>
    </section>`
})
export class BillsPageComponent implements OnInit {
  bills: any[] = [];
  selectedBill: any = null;
  loadingBill = false;
  qrLoading = false;
  fonepayQr: any = null;
  form = this.fb.group({ orderId: [1, Validators.required], discountAmount: [0], taxAmount: [0], paymentMethod: ['Cash'] });
  constructor(private api: ApiService, private fb: FormBuilder, private ui: UiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any[]>('bills').subscribe(data => this.bills = data); }
  generate() {
    const v = this.form.value;
    this.api.post<any>(`orders/${v.orderId}/bill`, v).subscribe({ next: bill => { this.ui.toast('Bill generated'); this.preview(bill); this.load(); }, error: () => this.ui.toast('Unable to generate bill. Make sure the order exists and is completed.', 'error') });
  }
  preview(bill: any) { this.prepareBill(bill, false); }
  billItems(bill: any) { return bill?.order?.orderItems ?? []; }
  markPaid(bill: any) { this.api.patch(`bills/${bill.billId}/payment`, { paymentStatus: 'Paid', paymentMethod: bill.paymentMethod ?? 'Cash' }).subscribe(() => { this.ui.toast('Payment marked paid'); this.load(); }); }
  print(bill: any) { this.prepareBill(bill, true); }
  generatePaymentQr() {
    if (!this.selectedBill) return;
    this.qrLoading = true;
    this.api.post<any>(`fonepay/bills/${this.selectedBill.billId}/qr`, {}).subscribe({
      next: result => {
        this.fonepayQr = result;
        this.qrLoading = false;
        this.ui.toast(result.isDemo ? 'Demo payment QR generated' : 'Fonepay QR generated', result.isDemo ? 'info' : 'success');
      },
      error: err => {
        this.qrLoading = false;
        this.ui.toast(err.error?.message ?? 'Unable to generate payment QR', 'error');
      }
    });
  }
  checkPayment() {
    if (!this.selectedBill) return;
    this.api.get<any>(`fonepay/bills/${this.selectedBill.billId}/status`).subscribe({
      next: result => this.ui.toast(result.message ?? result.status ?? 'Payment status received', 'info'),
      error: err => this.ui.toast(err.error?.message ?? 'Unable to check payment', 'error')
    });
  }

  private prepareBill(bill: any, printAfterLoad: boolean) {
    if (this.selectedBill?.billId !== bill.billId) this.fonepayQr = null;
    if (this.billItems(bill).length) {
      this.selectedBill = bill;
      if (printAfterLoad) window.setTimeout(() => window.print(), 100);
      return;
    }

    this.loadingBill = true;
    this.api.get<any[]>('orders').subscribe({
      next: orders => {
        const order = orders.find(item => item.orderId === bill.orderId);
        this.selectedBill = { ...bill, order: order ?? bill.order };
        this.loadingBill = false;
        if (!this.billItems(this.selectedBill).length) {
          this.ui.toast('No order items were found for this bill', 'error');
          return;
        }
        if (printAfterLoad) window.setTimeout(() => window.print(), 100);
      },
      error: () => {
        this.loadingBill = false;
        this.ui.toast('Unable to load bill item details', 'error');
      }
    });
  }
}
