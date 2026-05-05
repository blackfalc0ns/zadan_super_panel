import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { WalletsService, AdminWalletSummaryDto, AdminWalletTransactionDto } from '../../services/wallets.service';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { KeyValueGridComponent, KeyValueGridItem } from '../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { MoneyBadgeComponent } from '../../components/money-badge/money-badge.component';
import { getFinanceLocale } from '../../utils/finance-i18n.utils';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';

@Component({
  selector: 'app-wallet-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AppPaginationComponent,
    AppCardComponent,
    AppButtonComponent,
    KeyValueGridComponent,
    MoneyBadgeComponent,
    AppPageHeaderComponent
  ],
  template: `
    <div class="flex flex-col gap-6 animate-in fade-in duration-700">

      <!-- شريط الصفحة العلوي (Header) -->
      <app-page-header title="تفاصيل المحفظة المالية" subtitle="مراجعة السجل المالي، الأرصدة المتاحة، وإنشاء التسويات اليدوية" [showBack]="true" backUrl="/finances/wallets">
        <div actions class="flex items-center gap-3">
          <app-button variant="primary" size="sm" customClass="!rounded-xl shadow-sm" (btnClick)="isAdjustModalOpen = true" *ngIf="wallet">
            <span class="material-symbols-outlined text-[16px] rtl:ml-1 ltr:mr-1">edit_square</span>
            تسوية يدوية
          </app-button>
        </div>
      </app-page-header>

      <!-- ملخص المحفظة (Wallet Summary) -->
      <ng-container *ngIf="wallet">
        <app-card variant="default" rounded="2xl" padding="none" customClass="border-slate-200 shadow-sm overflow-hidden bg-white">
          <div class="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0"
                   [ngClass]="wallet.ownerType === 'Vendor' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' : 'bg-amber-50 text-amber-600 border-amber-100'">
                <span class="material-symbols-outlined text-[28px]">{{ wallet.ownerType === 'Vendor' ? 'storefront' : 'local_shipping' }}</span>
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <h2 class="text-xl font-black text-slate-900">{{ wallet.ownerName }}</h2>
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border"
                        [ngClass]="wallet.ownerType === 'Vendor' ? 'bg-cyan-50 text-cyan-700 border-cyan-100' : 'bg-amber-50 text-amber-700 border-amber-100'">
                    {{ wallet.ownerType === 'Vendor' ? 'متجر' : 'مندوب' }}
                  </span>
                </div>
                <p class="text-[12px] font-bold text-slate-500" dir="ltr">{{ wallet.ownerPhone || 'لا يوجد هاتف مسجل' }}</p>
                <p class="text-[10px] font-bold text-slate-400 mt-1 font-mono uppercase">ID: {{ wallet.id }}</p>
              </div>
            </div>
            
            <div class="flex gap-6 text-left rtl:text-right">
              <div class="px-5 py-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <p class="text-[11px] font-bold text-slate-500 mb-1">الرصيد المعلق (قيد الانتظار)</p>
                <p class="text-xl font-black tabular-nums tracking-tight text-amber-600">{{ formatNumber(wallet.pendingBalance) }} <span class="text-sm font-bold text-amber-600/70">SAR</span></p>
              </div>
              <div class="px-5 py-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <p class="text-[11px] font-bold text-slate-500 mb-1">الرصيد المتاح</p>
                <p class="text-xl font-black tabular-nums tracking-tight text-emerald-600">{{ formatNumber(wallet.currentBalance) }} <span class="text-sm font-bold text-emerald-600/70">SAR</span></p>
              </div>
            </div>
          </div>
        </app-card>
      </ng-container>

      <!-- سجل الحركات (Ledger) -->
      <app-card variant="default" rounded="2xl" padding="none" customClass="border-slate-200 shadow-sm overflow-hidden bg-white">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
               <span class="material-symbols-outlined text-slate-600 text-[18px]">receipt_long</span>
             </div>
             <div>
               <h3 class="text-[15px] font-black text-slate-900 tracking-tight">سجل حركات المحفظة</h3>
               <p class="text-[11px] font-bold text-slate-500 mt-0.5">تفاصيل العمليات، التسويات والمبالغ المستردة</p>
             </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full whitespace-nowrap text-right text-[13px]">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <th class="px-6 py-4 rtl:text-right ltr:text-left">التاريخ والوقت</th>
                <th class="px-6 py-4 rtl:text-right ltr:text-left">النوع</th>
                <th class="px-6 py-4 rtl:text-right ltr:text-left w-1/3">البيان / الوصف</th>
                <th class="px-6 py-4 rtl:text-right ltr:text-left">المرجع</th>
                <th class="px-6 py-4 rtl:text-left ltr:text-right">المبلغ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let txn of transactions"
                  class="group hover:bg-slate-50/80 transition-colors duration-150"
                  [class.opacity-50]="isLoadingTransactions">

                <td class="px-6 py-4 align-middle">
                  <div class="flex flex-col gap-0.5">
                    <span class="font-bold text-slate-900 tabular-nums">{{ formatDate(txn.createdAtUtc) }}</span>
                    <span class="text-[10px] font-bold text-slate-400 tabular-nums">{{ formatTime(txn.createdAtUtc) }}</span>
                  </div>
                </td>

                <td class="px-6 py-4 align-middle">
                  <span class="inline-flex px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border"
                        [ngClass]="getTypeBadgeClass(txn.txnType)">
                    {{ getTranslatedTxnType(txn.txnType) }}
                  </span>
                </td>

                <td class="px-6 py-4 align-middle whitespace-normal min-w-[200px]">
                  <span class="font-bold text-slate-700 leading-tight">{{ txn.description || '--' }}</span>
                </td>

                <td class="px-6 py-4 align-middle">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ txn.referenceType || 'بدون مرجع' }}</span>
                    <span class="text-[11px] font-mono font-bold text-slate-600 truncate max-w-[120px]" [title]="txn.referenceId || ''">{{ txn.referenceId || '--' }}</span>
                  </div>
                </td>

                <td class="px-6 py-4 align-middle text-left" dir="ltr">
                  <app-money-badge
                    [amount]="txn.amount"
                    [direction]="txn.direction === 'IN' ? 'credit' : 'debit'"
                    [showDirection]="true"
                    currency="SAR"
                    size="sm">
                  </app-money-badge>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="!isLoadingTransactions && transactions.length === 0"
             class="flex flex-col items-center justify-center py-24 text-center bg-white">
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
             <span class="material-symbols-outlined text-4xl text-slate-300">receipt_long</span>
          </div>
          <p class="text-[15px] font-black text-slate-800">لا توجد حركات مالية</p>
          <p class="text-[12px] font-medium text-slate-500 mt-1">لم يتم تسجيل أي عمليات إيداع أو سحب في هذه المحفظة حتى الآن.</p>
        </div>
      </app-card>

      <div *ngIf="transactions.length > 0" class="flex justify-center pt-2 pb-8">
        <app-pagination
          [currentPage]="page"
          [pageSize]="pageSize"
          [totalItems]="totalCount"
          (pageChange)="changePage($event)">
        </app-pagination>
      </div>

    </div>

    <!-- نافذة التسوية اليدوية (Adjustment Modal) -->
    <div *ngIf="isAdjustModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" (click)="isAdjustModalOpen = false"></div>
      <div class="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-7 animate-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between mb-6">
           <h3 class="text-xl font-black text-slate-900 tracking-tight">تسوية مالية يدوية</h3>
           <button class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors" (click)="isAdjustModalOpen = false">
             <span class="material-symbols-outlined text-[20px]">close</span>
           </button>
        </div>
        
        <div class="space-y-5">
          <div class="space-y-1.5">
            <label class="block text-[11px] font-bold text-slate-600">نوع التسوية (الاتجاه)</label>
            <div class="relative">
              <select [(ngModel)]="adjustForm.direction" class="w-full appearance-none bg-white border border-slate-200 rounded-xl text-[14px] font-black text-slate-800 py-3 px-4 focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all cursor-pointer">
                <option value="IN">إيداع / إضافة رصيد (Credit IN)</option>
                <option value="OUT">سحب / خصم رصيد (Debit OUT)</option>
              </select>
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="block text-[11px] font-bold text-slate-600">المبلغ (SAR)</label>
            <div class="relative">
              <input type="number" [(ngModel)]="adjustForm.amount" min="0.01" class="w-full bg-white border border-slate-200 rounded-xl text-[15px] font-black text-slate-900 py-3 px-4 pl-12 focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all tabular-nums" placeholder="0.00">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">SAR</span>
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="block text-[11px] font-bold text-slate-600">وصف / سبب التسوية</label>
            <textarea [(ngModel)]="adjustForm.description" rows="3" class="w-full bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-800 py-3 px-4 focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all resize-none" placeholder="مثال: تعويض مالي عن خطأ في الطلب رقم 123..."></textarea>
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <app-button variant="ghost" size="md" customClass="!rounded-xl flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700" (btnClick)="isAdjustModalOpen = false">إلغاء</app-button>
          <app-button variant="primary" size="md" customClass="!rounded-xl flex-1 shadow-md shadow-zadna-primary/20" (btnClick)="submitAdjustment()" [disabled]="isSubmitting || adjustForm.amount <= 0 || !adjustForm.description">
            <span class="material-symbols-outlined text-[18px] rtl:ml-1 ltr:mr-1" *ngIf="!isSubmitting">check_circle</span>
            {{ isSubmitting ? 'جاري التنفيذ...' : 'تأكيد التسوية' }}
          </app-button>
        </div>
      </div>
    </div>
  `
})
export class WalletDetailsComponent implements OnInit {
  private walletsService = inject(WalletsService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);

  walletId!: string;
  wallet: AdminWalletSummaryDto | null = null;
  
  transactions: AdminWalletTransactionDto[] = [];
  isLoadingTransactions = false;
  page = 1;
  pageSize = 20;
  totalCount = 0;

  isAdjustModalOpen = false;
  isSubmitting = false;
  adjustForm = {
    amount: 0,
    direction: 'IN' as 'IN' | 'OUT',
    description: ''
  };

  ngOnInit(): void {
    this.walletId = this.route.snapshot.paramMap.get('id')!;
    if (this.walletId) {
      this.loadWallet();
      this.loadTransactions();
    }
  }

  loadWallet(): void {
    this.walletsService.getWallet(this.walletId)
      .pipe(take(1))
      .subscribe(data => this.wallet = data);
  }

  loadTransactions(): void {
    this.isLoadingTransactions = true;
    this.walletsService.getWalletTransactions(this.walletId, this.page, this.pageSize)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.transactions = data.items;
          this.totalCount = data.totalCount;
          this.isLoadingTransactions = false;
        },
        error: () => this.isLoadingTransactions = false
      });
  }

  changePage(page: number): void {
    this.page = page;
    this.loadTransactions();
  }

  submitAdjustment(): void {
    this.isSubmitting = true;
    this.walletsService.createAdjustment(this.walletId, {
      amount: this.adjustForm.amount,
      direction: this.adjustForm.direction,
      description: this.adjustForm.description
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isAdjustModalOpen = false;
        this.adjustForm = { amount: 0, direction: 'IN', description: '' };
        this.loadWallet();
        this.page = 1;
        this.loadTransactions();
      },
      error: () => this.isSubmitting = false
    });
  }

  formatDate(ts: string): string {
    return new Date(ts).toLocaleDateString(getFinanceLocale(this.translate.currentLang), { calendar: 'gregory' });
  }

  formatTime(ts: string): string {
    return new Date(ts).toLocaleTimeString(getFinanceLocale(this.translate.currentLang), { hour: '2-digit', minute: '2-digit' });
  }

  formatNumber(value: number): string {
    return value.toLocaleString(getFinanceLocale(this.translate.currentLang), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  getTranslatedTxnType(type: string): string {
    const map: Record<string, string> = {
      Payout: 'تسوية نقدية',
      Refund: 'مسترد',
      Settlement: 'تسوية',
      Adjustment: 'تسوية يدوية',
      Hold: 'حجز مؤقت',
      Release: 'تحرير رصيد',
      Credit: 'إيداع',
      Debit: 'خصم',
    };
    return map[type] ?? type;
  }

  getTypeBadgeClass(type: string): string {
    const map: Record<string, string> = {
      Payout: 'bg-amber-50 text-amber-700 border-amber-200',
      Refund: 'bg-red-50 text-red-600 border-red-200',
      Settlement: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Adjustment: 'bg-purple-50 text-purple-700 border-purple-200',
      Hold: 'bg-orange-50 text-orange-700 border-orange-200',
      Release: 'bg-sky-50 text-sky-700 border-sky-200',
      Credit: 'bg-green-50 text-green-700 border-green-200',
      Debit: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return map[type] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  }
}
