import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { ToastService } from '../../../../shared/services/toast.service';
import {
  OrdersService,
  type PlatformPickupSettingsDto,
  type UpdatePlatformPickupSettingsRequest,
} from '../../services/orders.service';

@Component({
  selector: 'app-pickup-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, AppPageHeaderComponent],
  template: `
    <div class="flex flex-col gap-6">
      <app-page-header
        [title]="'ORDERS.PICKUP_SETTINGS.TITLE' | translate"
        [subtitle]="'ORDERS.PICKUP_SETTINGS.SUBTITLE' | translate"
        [showToolbar]="true"
      >
        <div actions class="flex flex-wrap items-center gap-3">
          <a
            routerLink="/finances/pricing"
            class="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span class="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_back</span>
            {{ 'ORDERS.PICKUP_SETTINGS.BACK_TO_FINANCE' | translate }}
          </a>
          <button
            type="button"
            class="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            [disabled]="loading()"
            (click)="load()"
          >
            <span class="material-symbols-outlined text-[18px]" [class.animate-spin]="loading()">refresh</span>
            {{ 'COMMON.REFRESH' | translate }}
          </button>
          <button
            type="button"
            class="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-5 text-[12px] font-black text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
            [disabled]="loading() || saving() || !settings()"
            (click)="save()"
          >
            <span class="material-symbols-outlined text-[18px]">{{ saving() ? 'hourglass_empty' : 'save' }}</span>
            {{ saving() ? ('ORDERS.PICKUP_SETTINGS.SAVING' | translate) : ('ORDERS.PICKUP_SETTINGS.SAVE' | translate) }}
          </button>
        </div>
      </app-page-header>

      @if (loading() && !settings()) {
        <div class="grid gap-4 md:grid-cols-2">
          @for (item of [1, 2, 3, 4]; track item) {
            <div class="h-24 animate-pulse rounded-2xl bg-slate-100"></div>
          }
        </div>
      } @else if (settings(); as s) {
        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="mb-6 flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
              <span class="material-symbols-outlined text-[22px]">local_shipping</span>
            </div>
            <div>
              <h2 class="text-[16px] font-black text-slate-950">{{ 'ORDERS.PICKUP_SETTINGS.CHANNELS_TITLE' | translate }}</h2>
              <p class="mt-1 max-w-2xl text-[13px] font-medium leading-relaxed text-slate-500">
                {{ 'ORDERS.PICKUP_SETTINGS.CHANNELS_HINT' | translate }}
              </p>
            </div>
          </div>

          <div class="grid gap-3 md:grid-cols-1">
            <label class="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <span>
                <span class="block text-[13px] font-black text-slate-900">{{ 'ORDERS.PICKUP_SETTINGS.DELIVERY_ENABLED' | translate }}</span>
                <span class="mt-1 block text-[12px] font-medium text-slate-500">{{ 'ORDERS.PICKUP_SETTINGS.DELIVERY_HINT' | translate }}</span>
              </span>
              <input
                type="checkbox"
                class="h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-200"
                [(ngModel)]="s.deliveryEnabled"
                name="deliveryEnabled"
              />
            </label>

            <label class="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <span>
                <span class="block text-[13px] font-black text-slate-900">{{ 'ORDERS.PICKUP_SETTINGS.PICKUP_ENABLED' | translate }}</span>
                <span class="mt-1 block text-[12px] font-medium text-slate-500">{{ 'ORDERS.PICKUP_SETTINGS.PICKUP_HINT' | translate }}</span>
              </span>
              <input
                type="checkbox"
                class="h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-200"
                [(ngModel)]="s.pickupEnabled"
                name="pickupEnabled"
              />
            </label>

            <label
              class="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
              [class.opacity-60]="!s.pickupEnabled"
            >
              <span>
                <span class="block text-[13px] font-black text-slate-900">{{ 'ORDERS.PICKUP_SETTINGS.CASH_ON_PICKUP_ENABLED' | translate }}</span>
                <span class="mt-1 block text-[12px] font-medium text-slate-500">{{ 'ORDERS.PICKUP_SETTINGS.CASH_HINT' | translate }}</span>
              </span>
              <input
                type="checkbox"
                class="h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-200"
                [(ngModel)]="s.pickupCashOnPickupEnabled"
                name="pickupCashOnPickupEnabled"
                [disabled]="!s.pickupEnabled"
              />
            </label>
          </div>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="mb-6 flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-700">
              <span class="material-symbols-outlined text-[22px]">tune</span>
            </div>
            <div>
              <h2 class="text-[16px] font-black text-slate-950">{{ 'ORDERS.PICKUP_SETTINGS.RULES_TITLE' | translate }}</h2>
              <p class="mt-1 max-w-2xl text-[13px] font-medium leading-relaxed text-slate-500">
                {{ 'ORDERS.PICKUP_SETTINGS.RULES_HINT' | translate }}
              </p>
            </div>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <label class="flex flex-col gap-2">
              <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">
                {{ 'ORDERS.PICKUP_SETTINGS.COMMISSION_PERCENT' | translate }}
              </span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                [(ngModel)]="s.pickupCommissionPercent"
                name="pickupCommissionPercent"
              />
            </label>

            <label class="flex flex-col gap-2">
              <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">
                {{ 'ORDERS.PICKUP_SETTINGS.NO_SHOW_HOURS' | translate }}
              </span>
              <input
                type="number"
                min="1"
                max="168"
                class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                [(ngModel)]="s.pickupNoShowGraceHours"
                name="pickupNoShowGraceHours"
              />
            </label>

            <label class="flex flex-col gap-2">
              <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">
                {{ 'ORDERS.PICKUP_SETTINGS.OTP_MAX_ATTEMPTS' | translate }}
              </span>
              <input
                type="number"
                min="1"
                max="20"
                class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                [(ngModel)]="s.pickupOtpMaxAttempts"
                name="pickupOtpMaxAttempts"
              />
            </label>

            <label class="flex flex-col gap-2">
              <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">
                {{ 'ORDERS.PICKUP_SETTINGS.OTP_LOCKOUT_MINUTES' | translate }}
              </span>
              <input
                type="number"
                min="1"
                max="1440"
                class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                [(ngModel)]="s.pickupOtpLockoutMinutes"
                name="pickupOtpLockoutMinutes"
              />
            </label>
          </div>

          @if (s.updatedAtUtc) {
            <p class="mt-5 text-[12px] font-medium text-slate-500">
              {{ 'ORDERS.PICKUP_SETTINGS.LAST_UPDATED' | translate }}:
              {{ s.updatedAtUtc | date: 'medium' }}
            </p>
          }
        </section>
      }
    </div>
  `,
})
export class PickupSettingsComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly settings = signal<PlatformPickupSettingsDto | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.ordersService.getPlatformPickupSettings().subscribe({
      next: (settings) => {
        this.settings.set({ ...settings });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error(this.translate.instant('ORDERS.PICKUP_SETTINGS.LOAD_ERROR'));
      },
    });
  }

  save(): void {
    const current = this.settings();
    if (!current || this.saving()) return;

    const body: UpdatePlatformPickupSettingsRequest = {
      deliveryEnabled: !!current.deliveryEnabled,
      pickupEnabled: !!current.pickupEnabled,
      pickupCashOnPickupEnabled: !!current.pickupCashOnPickupEnabled,
      pickupCommissionPercent: Number(current.pickupCommissionPercent ?? 0),
      pickupNoShowGraceHours: Number(current.pickupNoShowGraceHours ?? 24),
      pickupOtpMaxAttempts: Number(current.pickupOtpMaxAttempts ?? 5),
      pickupOtpLockoutMinutes: Number(current.pickupOtpLockoutMinutes ?? 30),
    };

    this.saving.set(true);
    this.ordersService.updatePlatformPickupSettings(body).subscribe({
      next: (settings) => {
        this.settings.set({ ...settings });
        this.saving.set(false);
        this.toastService.success(this.translate.instant('ORDERS.PICKUP_SETTINGS.SAVE_SUCCESS'));
      },
      error: () => {
        this.saving.set(false);
        this.toastService.error(this.translate.instant('ORDERS.PICKUP_SETTINGS.SAVE_ERROR'));
      },
    });
  }
}
