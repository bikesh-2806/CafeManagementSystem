import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MenuItem, Table } from '../../core/models';
import { UiService } from '../../shared/ui.service';

@Component({
  selector: 'app-bills-page',
  templateUrl: './bills-page.component.html',
  styleUrls: ['./bills-page.component.scss']
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
