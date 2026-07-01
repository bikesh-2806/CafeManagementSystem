import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { UiService } from '../../shared/ui.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-fonepay-settings',
  templateUrl: './fonepay-settings.component.html',
  styleUrls: ['./fonepay-settings.component.scss']
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
