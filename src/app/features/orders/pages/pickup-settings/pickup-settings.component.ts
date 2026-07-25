import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { PlatformPickupSettings } from '../../models/pickup-settings.models';
import { PickupSettingsService } from '../../services/pickup-settings.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-pickup-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, AppPageHeaderComponent, AppButtonComponent],
  template: `
    <div class="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
      <app-page-header
        [title]="'ORDERS.PICKUP_SETTINGS.TITLE' | translate"
        [subtitle]="'ORDERS.PICKUP_SETTINGS.SUBTITLE' | translate">
        <div actions class="flex flex-wrap gap-2">
          <a routerLink="/finances/pricing" class="inline-flex h-10 items-center rounded-xl border border-slate-200 px-4 text-xs font-extrabold text-slate-600 hover:border-zadna-primary/30 hover:text-zadna-primary">
            {{ 'ORDERS.PICKUP_SETTINGS.BACK_TO_FINANCE' | translate }}
          </a>
          <a routerLink="/orders" class="inline-flex h-10 items-center rounded-xl border border-slate-200 px-4 text-xs font-extrabold text-slate-600 hover:border-zadna-primary/30 hover:text-zadna-primary">
            {{ 'ORDERS.PICKUP_SETTINGS.BACK_TO_ORDERS' | translate }}
          </a>
        </div>
      </app-page-header>

      <section *ngIf="isLoading" class="rounded-3xl border border-slate-100 bg-white p-8 text-center text-sm font-bold text-slate-500">
        {{ 'COMMON.LOADING' | translate }}
      </section>

      <section *ngIf="!isLoading" class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
        <div class="grid gap-4 md:grid-cols-2">
          <label class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4">
            <span class="text-sm font-extrabold text-slate-700">{{ 'ORDERS.PICKUP_SETTINGS.DELIVERY_ENABLED' | translate }}</span>
            <input type="checkbox" [(ngModel)]="form.deliveryOptionEnabled" class="h-5 w-5 rounded border-slate-300" />
          </label>
          <label class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4">
            <span class="text-sm font-extrabold text-slate-700">{{ 'ORDERS.PICKUP_SETTINGS.PICKUP_ENABLED' | translate }}</span>
            <input type="checkbox" [(ngModel)]="form.pickupOptionEnabled" class="h-5 w-5 rounded border-slate-300" />
          </label>
          <label class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4 md:col-span-2">
            <span class="text-sm font-extrabold text-slate-700">{{ 'ORDERS.PICKUP_SETTINGS.CASH_ON_PICKUP_ENABLED' | translate }}</span>
            <input type="checkbox" [(ngModel)]="form.pickupCashOnPickupEnabled" class="h-5 w-5 rounded border-slate-300" />
          </label>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="block">
            <span class="text-xs font-extrabold uppercase tracking-wider text-slate-500">{{ 'ORDERS.PICKUP_SETTINGS.COMMISSION_PERCENT' | translate }}</span>
            <input type="number" min="0" step="0.01" [(ngModel)]="form.pickupCommissionPercent" class="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" />
          </label>
          <label class="block">
            <span class="text-xs font-extrabold uppercase tracking-wider text-slate-500">{{ 'ORDERS.PICKUP_SETTINGS.NO_SHOW_HOURS' | translate }}</span>
            <input type="number" min="1" step="1" [(ngModel)]="form.pickupNoShowTimeoutHours" class="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" />
          </label>
          <label class="block">
            <span class="text-xs font-extrabold uppercase tracking-wider text-slate-500">{{ 'ORDERS.PICKUP_SETTINGS.OTP_MAX_ATTEMPTS' | translate }}</span>
            <input type="number" min="1" step="1" [(ngModel)]="form.pickupOtpMaxAttempts" class="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" />
          </label>
          <label class="block">
            <span class="text-xs font-extrabold uppercase tracking-wider text-slate-500">{{ 'ORDERS.PICKUP_SETTINGS.OTP_LOCKOUT_MINUTES' | translate }}</span>
            <input type="number" min="1" step="1" [(ngModel)]="form.pickupOtpLockoutMinutes" class="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" />
          </label>
        </div>

        <p *ngIf="updatedAtUtc" class="text-xs font-semibold text-slate-400">
          {{ 'ORDERS.PICKUP_SETTINGS.LAST_UPDATED' | translate }}: {{ updatedAtUtc | date:'medium' }}
        </p>

        <div class="flex justify-end">
          <app-button variant="primary" [isLoading]="isSaving" (btnClick)="save()">
            {{ 'ORDERS.PICKUP_SETTINGS.SAVE' | translate }}
          </app-button>
        </div>
      </section>
    </div>
  `
})
export class PickupSettingsComponent implements OnInit {
  private readonly pickupSettingsService = inject(PickupSettingsService);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoading = true;
  isSaving = false;
  updatedAtUtc: string | null = null;
  form = {
    deliveryOptionEnabled: true,
    pickupOptionEnabled: true,
    pickupCashOnPickupEnabled: false,
    pickupCommissionPercent: 0,
    pickupNoShowTimeoutHours: 24,
    pickupOtpMaxAttempts: 5,
    pickupOtpLockoutMinutes: 30
  };

  ngOnInit(): void {
    this.pickupSettingsService.getSettings().subscribe({
      next: (settings) => {
        this.applySettings(settings);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.toastService.show({ type: 'error', title: 'ORDERS.PICKUP_SETTINGS.LOAD_ERROR', message: '' });
        this.cdr.markForCheck();
      }
    });
  }

  save(): void {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.pickupSettingsService.updateSettings({ ...this.form }).subscribe({
      next: (settings) => {
        this.applySettings(settings);
        this.isSaving = false;
        this.toastService.show({ type: 'success', title: 'ORDERS.PICKUP_SETTINGS.SAVE_SUCCESS', message: '' });
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSaving = false;
        this.toastService.show({ type: 'error', title: 'ORDERS.PICKUP_SETTINGS.SAVE_ERROR', message: '' });
        this.cdr.markForCheck();
      }
    });
  }

  private applySettings(settings: PlatformPickupSettings): void {
    this.form = {
      deliveryOptionEnabled: settings.deliveryOptionEnabled,
      pickupOptionEnabled: settings.pickupOptionEnabled,
      pickupCashOnPickupEnabled: settings.pickupCashOnPickupEnabled,
      pickupCommissionPercent: settings.pickupCommissionPercent,
      pickupNoShowTimeoutHours: settings.pickupNoShowTimeoutHours,
      pickupOtpMaxAttempts: settings.pickupOtpMaxAttempts,
      pickupOtpLockoutMinutes: settings.pickupOtpLockoutMinutes
    };
    this.updatedAtUtc = settings.updatedAtUtc ?? null;
  }
}
