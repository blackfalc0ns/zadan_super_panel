import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin, map, switchMap, take } from 'rxjs';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { describeApiError } from '../../../../shared/utils/api-error.util';
import {
  AdminPlatformBankAccountDto,
  DEFAULT_SETTLEMENT_PAYOUT_DAYS,
  SETTLEMENT_PAYOUT_DAYS,
  SettlementPayoutDay,
  SettlementProcessingMode,
  AdminUpsertPlatformBankAccountRequest,
 WalletsService
} from '../../services/wallets.service';

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-platform-account',
 standalone: true,
 imports: [CommonModule, FormsModule, TranslateModule, AppPageHeaderComponent],
 template: `
 <div class="flex flex-col gap-6">
 <app-page-header
 [title]="'FINANCES.PLATFORM_ACCOUNT.HEADER_TITLE' | translate"
 [subtitle]="'FINANCES.PLATFORM_ACCOUNT.HEADER_SUBTITLE' | translate">
 <div actions class="flex flex-wrap items-center gap-3">
 <button type="button" (click)="load()" [disabled]="isLoading || isSaving || isSavingSettlementMode" class="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60">
 <span class="material-symbols-outlined text-[18px]">refresh</span>
 {{ 'FINANCES.PLATFORM_ACCOUNT.REFRESH' | translate }}
 </button>
 <button type="button" (click)="save()" [disabled]="isLoading || isSaving || isSavingSettlementMode || !canSave || !canSaveSettlementSettings" class="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-5 text-[12px] font-black text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60">
 <span class="material-symbols-outlined text-[18px]">{{ isSaving ? 'hourglass_empty' : 'save' }}</span>
 {{ (isSaving ? 'FINANCES.PLATFORM_ACCOUNT.SAVING' : 'FINANCES.PLATFORM_ACCOUNT.SAVE_ACCOUNT') | translate }}
 </button>
 </div>
 </app-page-header>

 <div *ngIf="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-700">
 {{ errorMessage }}
 </div>

 <div class="grid gap-6 xl:grid-cols-[1fr_360px]">
 <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
 <div class="mb-6 flex items-start gap-3">
 <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
 <span class="material-symbols-outlined text-[22px]">account_balance</span>
 </div>
 <div>
 <h2 class="text-[16px] font-black text-slate-950">{{ 'FINANCES.PLATFORM_ACCOUNT.DETAILS_TITLE' | translate }}</h2>
 <p class="mt-1 max-w-2xl text-[13px] font-medium leading-relaxed text-slate-500">
 {{ 'FINANCES.PLATFORM_ACCOUNT.DETAILS_DESC' | translate }}
 </p>
 </div>
 </div>

 <div *ngIf="isLoading" class="grid gap-4 md:grid-cols-2">
 <div *ngFor="let item of [1,2,3,4,5,6]" class="h-20 animate-pulse rounded-2xl bg-slate-100"></div>
 </div>

 <form *ngIf="!isLoading" class="grid gap-5 md:grid-cols-2" (ngSubmit)="save()">
 <label class="flex flex-col gap-2">
 <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ 'FINANCES.PLATFORM_ACCOUNT.BANK_NAME' | translate }}</span>
 <input [(ngModel)]="form.bankName" name="bankName" class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" [placeholder]="'FINANCES.PLATFORM_ACCOUNT.BANK_NAME_PLACEHOLDER' | translate" />
 </label>

 <label class="flex flex-col gap-2">
 <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ 'FINANCES.PLATFORM_ACCOUNT.ACCOUNT_HOLDER' | translate }}</span>
 <input [(ngModel)]="form.accountHolderName" name="accountHolderName" class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" [placeholder]="'FINANCES.PLATFORM_ACCOUNT.ACCOUNT_HOLDER_PLACEHOLDER' | translate" />
 </label>

 <label class="flex flex-col gap-2 md:col-span-2">
 <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ 'FINANCES.PLATFORM_ACCOUNT.IBAN' | translate }}</span>
 <input [(ngModel)]="form.iban" name="iban" dir="ltr" class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-black tracking-wide text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" [placeholder]="'FINANCES.PLATFORM_ACCOUNT.IBAN_PLACEHOLDER' | translate" />
 </label>

 <label class="flex flex-col gap-2">
 <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ 'FINANCES.PLATFORM_ACCOUNT.ACCOUNT_NUMBER' | translate }}</span>
 <input [(ngModel)]="form.accountNumber" name="accountNumber" dir="ltr" class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" />
 </label>

 <div class="grid grid-cols-2 gap-3">
 <label class="flex flex-col gap-2">
 <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ 'FINANCES.PLATFORM_ACCOUNT.COUNTRY' | translate }}</span>
 <input [(ngModel)]="form.countryCode" name="countryCode" maxlength="2" class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold uppercase text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" />
 </label>
 <label class="flex flex-col gap-2">
 <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ 'FINANCES.PLATFORM_ACCOUNT.CITY' | translate }}</span>
 <input [(ngModel)]="form.city" name="city" class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" />
 </label>
 </div>

 <label class="flex flex-col gap-2 md:col-span-2">
 <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ 'FINANCES.PLATFORM_ACCOUNT.MOYASAR_SOURCE_ID' | translate }}</span>
 <input [(ngModel)]="form.moyasarPayoutSourceId" name="moyasarPayoutSourceId" dir="ltr" class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" placeholder="src_..." />
 </label>

 <label class="flex flex-col gap-2 md:col-span-2">
 <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ 'FINANCES.PLATFORM_ACCOUNT.NOTES' | translate }}</span>
 <textarea [(ngModel)]="form.notes" name="notes" rows="3" class="resize-none rounded-2xl border border-slate-200 px-4 py-3 text-[14px] font-medium text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"></textarea>
 </label>

 <div class="md:col-span-2 grid gap-3 md:grid-cols-2">
 <label class="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
 <span>
 <span class="block text-[13px] font-black text-slate-900">{{ 'FINANCES.PLATFORM_ACCOUNT.ENABLE_BANK_TRANSFER' | translate }}</span>
 <span class="mt-1 block text-[12px] font-medium text-slate-500">{{ 'FINANCES.PLATFORM_ACCOUNT.ENABLE_BANK_TRANSFER_DESC' | translate }}</span>
 </span>
 <input type="checkbox" [(ngModel)]="form.isBankTransferEnabled" name="isBankTransferEnabled" class="h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-200" />
 </label>

 <label class="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
 <span>
 <span class="block text-[13px] font-black text-slate-900">{{ 'FINANCES.PLATFORM_ACCOUNT.ENABLE_MOYASAR_PAYOUTS' | translate }}</span>
 <span class="mt-1 block text-[12px] font-medium text-slate-500">{{ 'FINANCES.PLATFORM_ACCOUNT.ENABLE_MOYASAR_PAYOUTS_DESC' | translate }}</span>
 </span>
 <input type="checkbox" [(ngModel)]="form.isMoyasarPayoutsEnabled" name="isMoyasarPayoutsEnabled" class="h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-200" />
 </label>
 </div>

 <fieldset class="md:col-span-2 rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
 <legend class="px-2 text-[11px] font-black uppercase tracking-wide text-violet-700">{{ 'FINANCES.PLATFORM_ACCOUNT.SETTLEMENT_MODE' | translate }}</legend>
 <p class="mb-3 text-[12px] font-medium text-slate-600">{{ 'FINANCES.PLATFORM_ACCOUNT.SETTLEMENT_MODE_DESC' | translate }}</p>
 <div class="grid gap-3 md:grid-cols-2">
 <label class="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition" [ngClass]="settlementProcessingMode === 'Manual' ? 'border-violet-400 bg-white shadow-sm' : 'border-slate-200 bg-white/60'">
 <input type="radio" name="settlementProcessingMode" value="Manual" [(ngModel)]="settlementProcessingMode" class="mt-1 h-4 w-4 text-violet-600 focus:ring-violet-300" />
 <span><span class="block text-[13px] font-black text-slate-900">{{ 'FINANCES.PLATFORM_ACCOUNT.SETTLEMENT_MODE_MANUAL' | translate }}</span><span class="mt-1 block text-[12px] font-medium text-slate-500">{{ 'FINANCES.PLATFORM_ACCOUNT.SETTLEMENT_MODE_MANUAL_DESC' | translate }}</span></span>
 </label>
  <label class="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition" [ngClass]="settlementProcessingMode === 'Automatic' ? 'border-violet-400 bg-white shadow-sm' : 'border-slate-200 bg-white/60'">
  <input type="radio" name="settlementProcessingMode" value="Automatic" [(ngModel)]="settlementProcessingMode" class="mt-1 h-4 w-4 text-violet-600 focus:ring-violet-300" />
  <span><span class="block text-[13px] font-black text-slate-900">{{ 'FINANCES.PLATFORM_ACCOUNT.SETTLEMENT_MODE_AUTOMATIC' | translate }}</span><span class="mt-1 block text-[12px] font-medium text-slate-500">{{ 'FINANCES.PLATFORM_ACCOUNT.SETTLEMENT_MODE_AUTOMATIC_DESC' | translate }}</span></span>
  </label>
  </div>

  <label class="mt-4 flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-violet-200 bg-white px-4 py-3.5">
  <span>
  <span class="block text-[13px] font-black text-slate-900">{{ 'FINANCES.PLATFORM_ACCOUNT.MANUAL_DUAL_CONTROL' | translate }}</span>
  <span class="mt-1 block max-w-2xl text-[12px] font-medium leading-relaxed text-slate-600">{{ 'FINANCES.PLATFORM_ACCOUNT.MANUAL_DUAL_CONTROL_DESC' | translate }}</span>
  </span>
  <input type="checkbox" [(ngModel)]="requireManualPayoutDualControl" name="requireManualPayoutDualControl" class="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 text-violet-600 focus:ring-violet-300" />
  </label>

 <div class="mt-5 border-t border-violet-200 pt-4">
 <div class="flex flex-wrap items-start justify-between gap-2">
 <div>
 <h3 class="text-[13px] font-black text-slate-900">{{ 'FINANCES.PLATFORM_ACCOUNT.PAYOUT_DAYS_TITLE' | translate }}</h3>
 <p class="mt-1 max-w-2xl text-[12px] font-medium leading-relaxed text-slate-600">{{ 'FINANCES.PLATFORM_ACCOUNT.PAYOUT_DAYS_DESC' | translate }}</p>
 </div>
 <span class="rounded-full bg-violet-100 px-3 py-1 text-[10px] font-black text-violet-800">
 {{ 'FINANCES.PLATFORM_ACCOUNT.PAYOUT_DAYS_SELECTED' | translate:{ count: payoutDays.length } }}
 </span>
 </div>

 <div class="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
 <label *ngFor="let day of payoutDayOptions" class="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition" [ngClass]="isPayoutDayEnabled(day) ? 'border-violet-300 bg-white shadow-sm' : 'border-slate-200 bg-white/60'">
 <span class="text-[12px] font-black text-slate-800">{{ payoutDayTranslationKey(day) | translate }}</span>
 <input type="checkbox" [checked]="isPayoutDayEnabled(day)" [disabled]="isPayoutDayEnabled(day) && payoutDays.length === 1" (change)="togglePayoutDay(day, $any($event.target).checked)" class="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50" />
 </label>
 </div>

 <div class="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] font-bold leading-relaxed text-amber-800">
 <span class="material-symbols-outlined me-1 align-middle text-[16px]">info</span>
 {{ 'FINANCES.PLATFORM_ACCOUNT.PAYOUT_DAYS_REASSIGNMENT_HINT' | translate }}
 </div>
 <p *ngIf="payoutDays.length === 1" class="mt-2 text-[11px] font-bold text-rose-700">{{ 'FINANCES.PLATFORM_ACCOUNT.PAYOUT_DAYS_MINIMUM_HINT' | translate }}</p>
 </div>

 <div class="mt-4 flex justify-end border-t border-violet-200 pt-4">
 <button type="button" (click)="saveSettlementProcessingMode()" [disabled]="isLoading || isSaving || isSavingSettlementMode || !canSaveSettlementSettings" class="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-700 px-5 text-[12px] font-black text-white shadow-sm transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60">
 <span class="material-symbols-outlined text-[18px]">{{ isSavingSettlementMode ? 'hourglass_empty' : 'save' }}</span>
 {{ (isSavingSettlementMode ? 'FINANCES.PLATFORM_ACCOUNT.SAVING_SETTLEMENT_SETTINGS' : 'FINANCES.PLATFORM_ACCOUNT.SAVE_SETTLEMENT_SETTINGS') | translate }}
 </button>
 </div>
 </fieldset>
 </form>
 </section>

 <aside class="flex flex-col gap-4">
 <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
 <div class="mb-4 flex items-center justify-between gap-3">
 <h3 class="text-[14px] font-black text-slate-950">{{ 'FINANCES.PLATFORM_ACCOUNT.STATUS_TITLE' | translate }}</h3>
 <span class="rounded-full px-3 py-1 text-[10px] font-black" [ngClass]="account?.id ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
 {{ (account?.id ? 'FINANCES.PLATFORM_ACCOUNT.BADGE_DATABASE' : 'FINANCES.PLATFORM_ACCOUNT.BADGE_SETTINGS_FALLBACK') | translate }}
 </span>
 </div>

 <div class="space-y-3">
 <div class="rounded-2xl border px-4 py-3" [ngClass]="account?.canReceiveBankTransfers ? 'border-emerald-100 bg-emerald-50' : 'border-rose-100 bg-rose-50'">
 <p class="text-[12px] font-black" [ngClass]="account?.canReceiveBankTransfers ? 'text-emerald-700' : 'text-rose-700'">{{ 'FINANCES.PLATFORM_ACCOUNT.RECEIVE_CUSTOMER_TRANSFERS' | translate }}</p>
 <p class="mt-1 text-[12px] font-medium text-slate-600">{{ (account?.canReceiveBankTransfers ? 'FINANCES.PLATFORM_ACCOUNT.READY' : 'FINANCES.PLATFORM_ACCOUNT.INCOMPLETE') | translate }}</p>
 </div>

 <div class="rounded-2xl border px-4 py-3" [ngClass]="account?.canSendMoyasarPayouts ? 'border-emerald-100 bg-emerald-50' : 'border-amber-100 bg-amber-50'">
 <p class="text-[12px] font-black" [ngClass]="account?.canSendMoyasarPayouts ? 'text-emerald-700' : 'text-amber-700'">{{ 'FINANCES.PLATFORM_ACCOUNT.MERCHANT_DRIVER_PAYOUTS' | translate }}</p>
 <p class="mt-1 text-[12px] font-medium text-slate-600">{{ (account?.canSendMoyasarPayouts ? 'FINANCES.PLATFORM_ACCOUNT.READY_MOYASAR' : 'FINANCES.PLATFORM_ACCOUNT.NEEDS_SOURCE_ID') | translate }}</p>
 </div>

 <div class="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3">
 <p class="text-[12px] font-black text-violet-800">{{ 'FINANCES.PLATFORM_ACCOUNT.SETTLEMENT_MODE' | translate }}</p>
 <p class="mt-1 text-[12px] font-medium text-slate-600">{{ (settlementProcessingMode === 'Manual' ? 'FINANCES.PLATFORM_ACCOUNT.SETTLEMENT_MODE_MANUAL' : 'FINANCES.PLATFORM_ACCOUNT.SETTLEMENT_MODE_AUTOMATIC') | translate }}</p>
 <p class="mt-2 text-[11px] font-bold text-violet-700">{{ 'FINANCES.PLATFORM_ACCOUNT.PAYOUT_DAYS_STATUS' | translate:{ days: payoutDaysSummary } }}</p>
 </div>
 </div>
 </div>

 <div class="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
 <div class="mb-4 flex items-center gap-3">
 <span class="material-symbols-outlined text-cyan-300">info</span>
 <h3 class="text-[14px] font-black">{{ 'FINANCES.PLATFORM_ACCOUNT.IMPORTANT_TITLE' | translate }}</h3>
 </div>
 <p class="text-[12px] font-medium leading-relaxed text-slate-300">
 {{ 'FINANCES.PLATFORM_ACCOUNT.IMPORTANT_DESC' | translate }}
 </p>
 </div>
 </aside>
 </div>
 </div>
 `
})
export class PlatformAccountComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
 private readonly walletsService = inject(WalletsService);
 private readonly translate = inject(TranslateService);
 private readonly toast = inject(ToastService);

 account: AdminPlatformBankAccountDto | null = null;
 isLoading = false;
 isSaving = false;
 isSavingSettlementMode = false;
 errorMessage = '';
  settlementProcessingMode: SettlementProcessingMode = 'Manual';
   payoutDays: SettlementPayoutDay[] = [...DEFAULT_SETTLEMENT_PAYOUT_DAYS];
   requireManualPayoutDualControl = true;
   settlementSettingsRowVersion = '';

 form: AdminUpsertPlatformBankAccountRequest = this.emptyForm();

 get canSave(): boolean {
 return Boolean(
 this.form.bankName?.trim() &&
 this.form.accountHolderName?.trim() &&
 this.form.iban?.trim() &&
 (!this.form.isMoyasarPayoutsEnabled || this.form.moyasarPayoutSourceId?.trim())
 );
 }

 get canSaveSettlementSettings(): boolean {
 return this.payoutDays.length > 0;
 }

 get payoutDayOptions(): readonly SettlementPayoutDay[] {
 return SETTLEMENT_PAYOUT_DAYS;
 }

 get payoutDaysSummary(): string {
 return this.payoutDays.map((day) => this.translate.instant(this.payoutDayTranslationKey(day))).join(', ');
 }

 ngOnInit(): void {
 this.load();
 }

 load(): void {
 this.isLoading = true;
 this.errorMessage = '';

 forkJoin({
 account: this.walletsService.getPlatformAccount(),
 processingSettings: this.walletsService.getSettlementProcessingSettings()
 }).pipe(take(1)).subscribe({
 next: ({ account, processingSettings }) => {
 this.cdr.markForCheck();
  this.account = account;
  this.settlementProcessingMode = processingSettings.settlementProcessingMode;
   this.payoutDays = this.normalizePayoutDays(processingSettings.payoutDays);
   this.requireManualPayoutDualControl = processingSettings.requireManualPayoutDualControl ?? true;
   this.settlementSettingsRowVersion = processingSettings.rowVersion ?? '';
 this.form = {
 bankName: account.bankName || '',
 accountHolderName: account.accountHolderName || '',
 iban: account.iban || '',
 accountNumber: account.accountNumber || '',
 countryCode: account.countryCode || 'SA',
 city: account.city || 'Riyadh',
 isBankTransferEnabled: account.isBankTransferEnabled,
 isMoyasarPayoutsEnabled: account.isMoyasarPayoutsEnabled,
 moyasarPayoutSourceId: account.moyasarPayoutSourceId || '',
 notes: account.notes || ''
 };
 this.isLoading = false;
 },
 error: (error) => {
 this.cdr.markForCheck();
 this.errorMessage = describeApiError(error, this.translate, { fallbackKey: 'COMMON.FAILED_TO_LOAD' });
 this.toast.error(this.errorMessage, this.translate.instant('FINANCES.PLATFORM_ACCOUNT.TOAST_TITLE'));
 this.isLoading = false;
 }
 });
 }

 save(): void {
 if (!this.canSave || !this.canSaveSettlementSettings || this.isSaving || this.isSavingSettlementMode) {
 return;
 }

 this.isSaving = true;
 this.errorMessage = '';

 const payload: AdminUpsertPlatformBankAccountRequest = {...this.form,
 bankName: this.form.bankName.trim(),
 accountHolderName: this.form.accountHolderName.trim(),
 iban: this.form.iban.trim(),
 accountNumber: this.nullIfBlank(this.form.accountNumber),
 countryCode: this.form.countryCode?.trim() || 'SA',
 city: this.form.city?.trim() || 'Riyadh',
 moyasarPayoutSourceId: this.nullIfBlank(this.form.moyasarPayoutSourceId),
 notes: this.nullIfBlank(this.form.notes)
 };

 this.walletsService.updateSettlementProcessingSettings(
 this.settlementProcessingSettingsPayload(),
 this.settlementSettingsRowVersion
 ).pipe(
 take(1),
 switchMap((processingSettings) => this.walletsService.updatePlatformAccount(payload).pipe(
 map((account) => ({ account, processingSettings }))
 ))
 ).subscribe({
 next: ({ account, processingSettings }) => {
 this.cdr.markForCheck();
  this.account = account;
  this.settlementProcessingMode = processingSettings.settlementProcessingMode;
   this.payoutDays = this.normalizePayoutDays(processingSettings.payoutDays);
   this.requireManualPayoutDualControl = processingSettings.requireManualPayoutDualControl ?? true;
   this.settlementSettingsRowVersion = processingSettings.rowVersion ?? '';
 this.isSaving = false;
 this.toast.success(this.translate.instant('FINANCES.PLATFORM_ACCOUNT.SAVE_SUCCESS'));
 this.load();
 },
 error: (error) => {
 this.cdr.markForCheck();
 this.errorMessage = describeApiError(error, this.translate, { fallbackKey: 'COMMON.API_ERRORS.UNKNOWN' });
 this.toast.error(this.errorMessage, this.translate.instant('FINANCES.PLATFORM_ACCOUNT.TOAST_TITLE'));
 this.isSaving = false;
 }
 });
 }

 saveSettlementProcessingMode(): void {
 if (this.isLoading || this.isSaving || this.isSavingSettlementMode || !this.canSaveSettlementSettings) {
 return;
 }

 this.isSavingSettlementMode = true;
 this.errorMessage = '';

 this.walletsService.updateSettlementProcessingSettings(
 this.settlementProcessingSettingsPayload(),
 this.settlementSettingsRowVersion
 ).pipe(take(1)).subscribe({
 next: (processingSettings) => {
  this.settlementProcessingMode = processingSettings.settlementProcessingMode;
   this.payoutDays = this.normalizePayoutDays(processingSettings.payoutDays);
   this.requireManualPayoutDualControl = processingSettings.requireManualPayoutDualControl ?? true;
   this.settlementSettingsRowVersion = processingSettings.rowVersion ?? '';
 this.isSavingSettlementMode = false;
 this.cdr.markForCheck();
 this.toast.success(this.translate.instant('FINANCES.PLATFORM_ACCOUNT.SETTLEMENT_MODE_SAVE_SUCCESS'));
 },
 error: (error) => {
 this.errorMessage = describeApiError(error, this.translate, { fallbackKey: 'COMMON.API_ERRORS.UNKNOWN' });
 this.isSavingSettlementMode = false;
 this.cdr.markForCheck();
 this.toast.error(this.errorMessage, this.translate.instant('FINANCES.PLATFORM_ACCOUNT.TOAST_TITLE'));
 }
 });
 }

 isPayoutDayEnabled(day: SettlementPayoutDay): boolean {
 return this.payoutDays.includes(day);
 }

 togglePayoutDay(day: SettlementPayoutDay, enabled: boolean): void {
 if (enabled) {
 this.payoutDays = this.sortPayoutDays([...this.payoutDays, day]);
 return;
 }

 if (this.payoutDays.length === 1) {
 return;
 }

 this.payoutDays = this.payoutDays.filter((selectedDay) => selectedDay !== day);
 }

 payoutDayTranslationKey(day: SettlementPayoutDay): string {
 return `FINANCES.PLATFORM_ACCOUNT.PAYOUT_DAY_${day.toUpperCase()}`;
 }

 private emptyForm(): AdminUpsertPlatformBankAccountRequest {
 return {
 bankName: '',
 accountHolderName: '',
 iban: '',
 accountNumber: '',
 countryCode: 'SA',
 city: 'Riyadh',
 isBankTransferEnabled: true,
 isMoyasarPayoutsEnabled: false,
 moyasarPayoutSourceId: '',
 notes: ''
 };
 }

 private nullIfBlank(value: string | null | undefined): string | null {
 return value && value.trim() ? value.trim() : null;
 }

  private settlementProcessingSettingsPayload(): { settlementProcessingMode: SettlementProcessingMode; payoutDays: SettlementPayoutDay[]; requireManualPayoutDualControl: boolean } {
  return {
  settlementProcessingMode: this.settlementProcessingMode,
  payoutDays: this.sortPayoutDays(this.payoutDays),
  requireManualPayoutDualControl: this.requireManualPayoutDualControl
  };
  }

 private normalizePayoutDays(value?: readonly string[] | null): SettlementPayoutDay[] {
 const selectedDays = new Set(
 (value ?? [])
 .map((day) => day?.trim().toLowerCase())
 .filter((day): day is string => Boolean(day))
 );
 const normalized = SETTLEMENT_PAYOUT_DAYS.filter((day) => selectedDays.has(day.toLowerCase()));
 return normalized.length ? [...normalized] : [...DEFAULT_SETTLEMENT_PAYOUT_DAYS];
 }

 private sortPayoutDays(days: readonly SettlementPayoutDay[]): SettlementPayoutDay[] {
 const selectedDays = new Set(days);
 return SETTLEMENT_PAYOUT_DAYS.filter((day) => selectedDays.has(day));
 }
}
