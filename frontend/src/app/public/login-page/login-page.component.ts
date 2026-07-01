import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { UiService } from '../../shared/ui.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  loading = false;
  error = '';
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private ui: UiService
  ) {}

  submit() {
    this.loading = true;
    this.auth.login(this.form.value.email!, this.form.value.password!).subscribe({
      next: user => {
        this.ui.toast('Login successful');
        this.router.navigate([
          user.role === 'Admin'
            ? '/admin/dashboard'
            : user.role === 'Customer'
              ? '/customer/dashboard'
              : '/staff/dashboard'
        ]);
      },
      error: err => {
        this.error = err.error?.message ?? 'Login failed';
        this.ui.toast(this.error, 'error');
        this.loading = false;
      }
    });
  }
}
