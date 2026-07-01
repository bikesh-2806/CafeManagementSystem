import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { UiService } from '../../shared/ui.service';

@Component({
  selector: 'app-reservation-page',
  templateUrl: './reservation-page.component.html',
  styleUrls: ['./reservation-page.component.scss']
})
export class ReservationPageComponent implements OnInit {
  reservations: any[] = [];
  form = this.fb.group({ customerId: [this.auth.user?.userId], tableId: [1], reservationDate: [''], numberOfGuests: [2] });
  constructor(private api: ApiService, private fb: FormBuilder, private auth: AuthService, private ui: UiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any[]>('reservations?mine=true').subscribe(data => this.reservations = data); }
  submit() { this.api.post('reservations', this.form.value).subscribe(() => { this.ui.toast('Reservation submitted'); this.load(); }); }
}
