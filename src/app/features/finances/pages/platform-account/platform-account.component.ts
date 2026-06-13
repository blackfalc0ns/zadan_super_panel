import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { describeApiError } from '../../../../shared/utils/api-error.util';
import {
  AdminPlatformBankAccountDto,
  AdminUpsertPlatformBankAccountRequest,
  WalletsService
} from '../../services/wallets.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-platform-account',
  standalone: true,
  imports: [CommonModule, FormsModule, AppPageHeaderComponent],
  template: `
    <div class="flex flex-col gap-6">
      <app-page-header
        [title]="text('حساب المنصة البنكي', 'Platform bank account')"
        [subtitle]="text('إعداد حساب استقبال التحويل البنكي ومصدر Moyasar للتحويلات الصادرة.', 'Configure the bank account customers transfer into and the Moyasar source for outbound payouts.')">
        <div actions class="flex flex-wrap items-center gap-3">
          <button type="button" (click)="load()" [disabled]="isLoading || isSaving" class="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60">
            <span class="material-symbols-outlined text-[18px]">refresh</span>
            {{ text('تحديث', 'Refresh') }}
          </button>
          <button type="button" (click)="save()" [disabled]="isLoading || isSaving || !canSave" class="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-5 text-[12px] font-black text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60">
            <span class="material-symbols-outlined text-[18px]">{{ isSaving ? 'hourglass_empty' : 'save' }}</span>
            {{ isSaving ? text('جاري الحفظ...', 'Saving...') : text('حفظ الحساب', 'Save account') }}
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
              <h2 class="text-[16px] font-black text-slate-950">{{ text('بيانات حساب المنصة', 'Platform account details') }}</h2>
              <p class="mt-1 max-w-2xl text-[13px] font-medium leading-relaxed text-slate-500">
                {{ text('هذه البيانات تظهر للعميل عند اختيار الدفع بتحويل بنكي. و SourceId يستخدم لتحويل مستحقات التاجر والمندوب عبر Moyasar.', 'These details appear to customers choosing bank transfer. SourceId is used to pay merchants and drivers through Moyasar.') }}
              </p>
            </div>
          </div>

          <div *ngIf="isLoading" class="grid gap-4 md:grid-cols-2">
            <div *ngFor="let item of [1,2,3,4,5,6]" class="h-20 animate-pulse rounded-2xl bg-slate-100"></div>
          </div>

          <form *ngIf="!isLoading" class="grid gap-5 md:grid-cols-2" (ngSubmit)="save()">
            <label class="flex flex-col gap-2">
              <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ text('اسم البنك', 'Bank name') }}</span>
              <input [(ngModel)]="form.bankName" name="bankName" class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" placeholder="Test Bank" />
            </label>

            <label class="flex flex-col gap-2">
              <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ text('اسم صاحب الحساب', 'Account holder') }}</span>
              <input [(ngModel)]="form.accountHolderName" name="accountHolderName" class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" placeholder="Zadana Platform" />
            </label>

            <label class="flex flex-col gap-2 md:col-span-2">
              <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">IBAN</span>
              <input [(ngModel)]="form.iban" name="iban" dir="ltr" class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-black tracking-wide text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" placeholder="SA0000000000000000000000" />
            </label>

            <label class="flex flex-col gap-2">
              <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ text('رقم الحساب', 'Account number') }}</span>
              <input [(ngModel)]="form.accountNumber" name="accountNumber" dir="ltr" class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" />
            </label>

            <div class="grid grid-cols-2 gap-3">
              <label class="flex flex-col gap-2">
                <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ text('الدولة', 'Country') }}</span>
                <input [(ngModel)]="form.countryCode" name="countryCode" maxlength="2" class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold uppercase text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" />
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ text('المدينة', 'City') }}</span>
                <input [(ngModel)]="form.city" name="city" class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" />
              </label>
            </div>

            <label class="flex flex-col gap-2 md:col-span-2">
              <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">Moyasar payout source id</span>
              <input [(ngModel)]="form.moyasarPayoutSourceId" name="moyasarPayoutSourceId" dir="ltr" class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" placeholder="src_..." />
            </label>

            <label class="flex flex-col gap-2 md:col-span-2">
              <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ text('ملاحظات', 'Notes') }}</span>
              <textarea [(ngModel)]="form.notes" name="notes" rows="3" class="resize-none rounded-2xl border border-slate-200 px-4 py-3 text-[14px] font-medium text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"></textarea>
            </label>

            <div class="md:col-span-2 grid gap-3 md:grid-cols-2">
              <label class="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <span>
                  <span class="block text-[13px] font-black text-slate-900">{{ text('تفعيل دفع التحويل البنكي', 'Enable bank transfer payments') }}</span>
                  <span class="mt-1 block text-[12px] font-medium text-slate-500">{{ text('العميل سيرى هذا الحساب في تعليمات التحويل.', 'Customers will see this account in transfer instructions.') }}</span>
                </span>
                <input type="checkbox" [(ngModel)]="form.isBankTransferEnabled" name="isBankTransferEnabled" class="h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-200" />
              </label>

              <label class="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <span>
                  <span class="block text-[13px] font-black text-slate-900">{{ text('تفعيل Moyasar Payouts', 'Enable Moyasar payouts') }}</span>
                  <span class="mt-1 block text-[12px] font-medium text-slate-500">{{ text('يستخدم لتحويل أموال التاجر والمندوب.', 'Used for merchant and driver payouts.') }}</span>
                </span>
                <input type="checkbox" [(ngModel)]="form.isMoyasarPayoutsEnabled" name="isMoyasarPayoutsEnabled" class="h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-200" />
              </label>
            </div>
          </form>
        </section>

        <aside class="flex flex-col gap-4">
          <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between gap-3">
              <h3 class="text-[14px] font-black text-slate-950">{{ text('حالة التشغيل', 'Operational status') }}</h3>
              <span class="rounded-full px-3 py-1 text-[10px] font-black" [ngClass]="account?.id ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                {{ account?.id ? text('من الداتابيز', 'Database') : text('من الإعدادات', 'Settings fallback') }}
              </span>
            </div>

            <div class="space-y-3">
              <div class="rounded-2xl border px-4 py-3" [ngClass]="account?.canReceiveBankTransfers ? 'border-emerald-100 bg-emerald-50' : 'border-rose-100 bg-rose-50'">
                <p class="text-[12px] font-black" [ngClass]="account?.canReceiveBankTransfers ? 'text-emerald-700' : 'text-rose-700'">{{ text('استقبال تحويلات العملاء', 'Receive customer transfers') }}</p>
                <p class="mt-1 text-[12px] font-medium text-slate-600">{{ account?.canReceiveBankTransfers ? text('جاهز', 'Ready') : text('غير مكتمل', 'Incomplete') }}</p>
              </div>

              <div class="rounded-2xl border px-4 py-3" [ngClass]="account?.canSendMoyasarPayouts ? 'border-emerald-100 bg-emerald-50' : 'border-amber-100 bg-amber-50'">
                <p class="text-[12px] font-black" [ngClass]="account?.canSendMoyasarPayouts ? 'text-emerald-700' : 'text-amber-700'">{{ text('تحويلات التاجر والمندوب', 'Merchant and driver payouts') }}</p>
                <p class="mt-1 text-[12px] font-medium text-slate-600">{{ account?.canSendMoyasarPayouts ? text('جاهز عبر Moyasar', 'Ready through Moyasar') : text('يحتاج SourceId من Moyasar', 'Needs Moyasar SourceId') }}</p>
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <div class="mb-4 flex items-center gap-3">
              <span class="material-symbols-outlined text-cyan-300">info</span>
              <h3 class="text-[14px] font-black">{{ text('مهم', 'Important') }}</h3>
            </div>
            <p class="text-[12px] font-medium leading-relaxed text-slate-300">
              {{ text('IBAN هنا هو حساب المنصة الذي يحول عليه العميل. أما SourceId فهو ليس رقم حساب، بل مصدر Payouts تحصل عليه من Moyasar.', 'The IBAN here is the platform account customers pay into. SourceId is not a bank account number; it is the Payouts source issued by Moyasar.') }}
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
  errorMessage = '';

  form: AdminUpsertPlatformBankAccountRequest = this.emptyForm();

  get canSave(): boolean {
    return Boolean(
      this.form.bankName?.trim() &&
      this.form.accountHolderName?.trim() &&
      this.form.iban?.trim() &&
      (!this.form.isMoyasarPayoutsEnabled || this.form.moyasarPayoutSourceId?.trim())
    );
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.walletsService.getPlatformAccount()
      .pipe(take(1))
      .subscribe({
        next: (account) => {
        this.cdr.markForCheck();
          this.account = account;
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
          this.toast.error(this.errorMessage, this.text('حساب المنصة', 'Platform account'));
          this.isLoading = false;
        }
      });
  }

  save(): void {
    if (!this.canSave || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const payload: AdminUpsertPlatformBankAccountRequest = {
      ...this.form,
      bankName: this.form.bankName.trim(),
      accountHolderName: this.form.accountHolderName.trim(),
      iban: this.form.iban.trim(),
      accountNumber: this.nullIfBlank(this.form.accountNumber),
      countryCode: this.form.countryCode?.trim() || 'SA',
      city: this.form.city?.trim() || 'Riyadh',
      moyasarPayoutSourceId: this.nullIfBlank(this.form.moyasarPayoutSourceId),
      notes: this.nullIfBlank(this.form.notes)
    };

    this.walletsService.updatePlatformAccount(payload)
      .pipe(take(1))
      .subscribe({
        next: (account) => {
        this.cdr.markForCheck();
          this.account = account;
          this.isSaving = false;
          this.toast.success(this.text('تم حفظ حساب المنصة.', 'Platform account saved.'));
          this.load();
        },
        error: (error) => {
        this.cdr.markForCheck();
          this.errorMessage = describeApiError(error, this.translate, { fallbackKey: 'COMMON.API_ERRORS.UNKNOWN' });
          this.toast.error(this.errorMessage, this.text('حساب المنصة', 'Platform account'));
          this.isSaving = false;
        }
      });
  }

  text(ar: string, en: string): string {
    return this.translate.currentLang === 'ar' ? ar : en;
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
}
