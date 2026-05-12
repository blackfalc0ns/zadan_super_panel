import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-change-temporary-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <section class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl">
        <div class="mb-7">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zadna-primary/10 text-zadna-primary">
            <span class="material-symbols-outlined text-[24px]">lock_reset</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900">Change temporary password</h1>
          <p class="mt-2 text-[13px] font-bold leading-6 text-slate-500">
            This account was created with a temporary password. Set a new password before continuing.
          </p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <label class="block">
            <span class="mb-2 block text-[11px] font-black uppercase tracking-widest text-slate-500">Current password</span>
            <input
              formControlName="currentPassword"
              type="password"
              autocomplete="current-password"
              class="h-12 w-full rounded-2xl border-2 border-slate-200 px-4 text-[14px] font-bold outline-none focus:border-zadna-primary" />
          </label>

          <label class="block">
            <span class="mb-2 block text-[11px] font-black uppercase tracking-widest text-slate-500">New password</span>
            <input
              formControlName="newPassword"
              type="password"
              autocomplete="new-password"
              class="h-12 w-full rounded-2xl border-2 border-slate-200 px-4 text-[14px] font-bold outline-none focus:border-zadna-primary" />
          </label>

          <label class="block">
            <span class="mb-2 block text-[11px] font-black uppercase tracking-widest text-slate-500">Confirm password</span>
            <input
              formControlName="confirmPassword"
              type="password"
              autocomplete="new-password"
              class="h-12 w-full rounded-2xl border-2 border-slate-200 px-4 text-[14px] font-bold outline-none focus:border-zadna-primary" />
          </label>

          <p *ngIf="errorMessage" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            [disabled]="isLoading || form.invalid"
            class="h-12 w-full rounded-2xl bg-gradient-to-br from-zadna-primary to-teal-700 text-[14px] font-black text-white shadow-lg shadow-zadna-primary/20 disabled:opacity-50">
            {{ isLoading ? 'Saving...' : 'Save new password' }}
          </button>
        </form>
      </section>
    </div>
  `
})
export class ChangeTemporaryPasswordComponent {
  isLoading = false;
  errorMessage = '';
  readonly form: FormGroup;
  private readonly returnUrl: string;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      this.errorMessage = 'New password and confirmation do not match.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.authService.changeTemporaryPassword(value.currentPassword ?? '', value.newPassword ?? '').subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl),
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Could not change password. Check the current password and try again.';
      }
    });
  }
}
