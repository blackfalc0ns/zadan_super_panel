import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { MoneyBadgeComponent } from '../../components/money-badge/money-badge.component';
import { AdminDriverWithdrawalRequestDto, WalletsService } from '../../services/wallets.service';
import { getFinanceLocale } from '../../utils/finance-i18n.utils';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-withdrawals-queue',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AppPaginationComponent,
    AppCardComponent,
    MoneyBadgeComponent,
    AppPageHeaderComponent,
    AppButtonComponent
  ],
  template: `
    <div class="flex flex-col gap-6 animate-in fade-in duration-700">

      <!-- شريط الصفحة العلوي (Header) -->
      <app-page-header title="طلبات سحب المناديب" subtitle="مراجعة واعتماد المبالغ المطلوبة للسحب من محافظ المناديب بشكل يومي">
        <div actions class="flex items-center gap-3">
          <div class="rounded-xl border border-slate-200 bg-white px-4 py-2 flex items-center justify-center gap-2 shadow-sm">
             <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
             <span class="text-[12px] font-bold text-slate-600 tabular-nums">{{ totalCount }} طلب مسجل</span>
          </div>
        </div>
      </app-page-header>

      <!-- شريط الفلاتر (Status Filter) -->
      <div class="flex flex-wrap items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 w-fit">
        <button
          *ngFor="let option of statusOptions"
          type="button"
          (click)="setStatus(option.value)"
          class="rounded-xl px-4 py-2 text-[12px] font-bold transition-all duration-200"
          [ngClass]="status === option.value
            ? 'bg-white text-zadna-primary shadow-sm border border-slate-200'
            : 'text-slate-500 hover:text-slate-800'">
          {{ option.label }}
        </button>
      </div>

      <!-- قائمة الطلبات (Cards Grid) -->
      <app-card variant="default" rounded="2xl" padding="none" customClass="bg-white border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
               <span class="material-symbols-outlined text-[18px]">payments</span>
             </div>
             <div>
               <h3 class="text-[15px] font-black text-slate-900 tracking-tight">سجل العمليات</h3>
               <p class="text-[11px] font-bold text-slate-500 mt-0.5">معالجة الحوالات البنكية للمناديب</p>
             </div>
          </div>
        </div>

        <div *ngIf="isLoading" class="grid gap-0 divide-y divide-slate-100">
          <div *ngFor="let _ of [1,2,3,4]" class="h-28 animate-pulse bg-slate-50 m-4 rounded-xl border border-slate-100"></div>
        </div>

        <div *ngIf="!isLoading && withdrawals.length" class="grid gap-0 divide-y divide-slate-100">
          <div *ngFor="let req of withdrawals" class="p-6 transition-all duration-200 hover:bg-slate-50/50 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 w-full xl:w-auto flex-1 items-center">
              <!-- Driver Info -->
              <div class="flex items-center gap-3">
                 <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                    <span class="material-symbols-outlined text-slate-500 text-[20px]">person</span>
                 </div>
                 <div>
                    <p class="text-[14px] font-black text-slate-900">{{ req.driverName }}</p>
                    <p class="text-[11px] font-bold text-slate-500 font-mono mt-0.5" dir="ltr">{{ req.driverPhone || 'لا يوجد رقم' }}</p>
                 </div>
              </div>

              <!-- Date -->
              <div>
                 <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">وقت الطلب</p>
                 <p class="text-[13px] font-bold text-slate-800 tabular-nums">{{ formatDate(req.createdAtUtc) }}</p>
                 <p class="text-[10px] font-bold text-slate-500 tabular-nums">{{ formatTime(req.createdAtUtc) }}</p>
              </div>

              <!-- Payout Method -->
              <div>
                 <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">حساب التحويل</p>
                 <ng-container *ngIf="req.payoutMethod; else noMethod">
                    <p class="text-[13px] font-bold text-slate-800 line-clamp-1">{{ req.payoutMethod.providerName || req.payoutMethod.methodType }}</p>
                    <p class="text-[10px] font-bold text-slate-500 truncate" [title]="req.payoutMethod.accountHolderName">{{ req.payoutMethod.accountHolderName }}</p>
                    <p class="text-[11px] font-black text-slate-600 font-mono mt-0.5">{{ req.payoutMethod.maskedLabel }}</p>
                 </ng-container>
                 <ng-template #noMethod>
                    <span class="inline-flex px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold">لا يوجد طريقة مفضلة</span>
                 </ng-template>
              </div>

              <!-- Status -->
              <div>
                 <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">الحالة</p>
                 <span class="inline-flex px-2 py-1 rounded-md text-[10px] font-black tracking-widest border" [ngClass]="getStatusBadgeClass(req.status)">
                    {{ getTranslatedStatus(req.status) }}
                 </span>
                 <p *ngIf="req.transferReference" class="mt-1.5 text-[11px] font-bold text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                    Ref: {{ req.transferReference }}
                 </p>
                 <p *ngIf="req.failureReason" class="mt-1.5 text-[11px] font-bold text-red-500 line-clamp-2" [title]="req.failureReason">
                    السبب: {{ req.failureReason }}
                 </p>
              </div>
            </div>

            <div class="flex flex-col items-start xl:items-end gap-4 shrink-0 min-w-[200px] border-t xl:border-t-0 border-slate-100 pt-4 xl:pt-0 w-full xl:w-auto">
               <div class="text-right w-full xl:w-auto rtl:text-left text-left">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">المبلغ المطلوب</p>
                  <p class="text-xl font-black text-amber-700 tabular-nums leading-none tracking-tight">{{ formatNumber(req.amount) }} <span class="text-[12px] font-bold">SAR</span></p>
               </div>

               <div class="flex gap-2 w-full xl:w-auto" *ngIf="req.status === 'Pending' || req.status === 'Processing'">
                 <app-button variant="primary" size="sm" customClass="!rounded-xl flex-1 xl:flex-none shadow-sm !bg-emerald-600 hover:!bg-emerald-700" (btnClick)="openProcessModal(req, true)">
                   قبول
                 </app-button>
                 <app-button variant="outline" size="sm" customClass="!rounded-xl flex-1 xl:flex-none border-red-200 text-red-600 hover:bg-red-50" (btnClick)="openProcessModal(req, false)">
                   رفض
                 </app-button>
               </div>
            </div>

          </div>
        </div>

        <div *ngIf="!isLoading && withdrawals.length === 0" class="flex flex-col items-center justify-center py-24 text-center bg-white">
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
             <span class="material-symbols-outlined text-4xl text-slate-300">account_balance_wallet</span>
          </div>
          <h3 class="text-[15px] font-black text-slate-800">لا توجد طلبات سحب</h3>
          <p class="text-[12px] font-medium text-slate-500 mt-1 max-w-sm">لم يتم العثور على أي طلبات سحب تطابق حالة الفلتر المحدد حالياً.</p>
        </div>
      </app-card>

      <!-- الترقيم (Pagination) -->
      <div *ngIf="withdrawals.length > 0" class="flex justify-center pt-2 pb-8">
        <app-pagination
          [currentPage]="page"
          [pageSize]="pageSize"
          [totalItems]="totalCount"
          (pageChange)="changePage($event)">
        </app-pagination>
      </div>
    </div>

    <!-- نافذة معالجة الطلب (Process Modal) -->
    <div *ngIf="isProcessModalOpen && selectedRequest" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" (click)="closeProcessModal()"></div>
      <div class="relative bg-white rounded-3xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
        
        <div class="px-6 py-6 text-white text-center"
             [ngClass]="isApproving ? 'bg-emerald-600' : 'bg-red-600'">
          <div class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
             <span class="material-symbols-outlined text-[28px]">{{ isApproving ? 'check_circle' : 'cancel' }}</span>
          </div>
          <h3 class="text-xl font-black mb-1">
            {{ isApproving ? 'قبول طلب السحب' : 'رفض طلب السحب' }}
          </h3>
          <p class="text-sm font-medium text-white/90">
            المندوب: {{ selectedRequest.driverName }} • المبلغ: {{ formatNumber(selectedRequest.amount) }} SAR
          </p>
        </div>

        <div class="p-6 space-y-5">
          <!-- Payout Method Hint -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
             <span class="material-symbols-outlined text-slate-400 mt-0.5 text-[20px]">account_balance</span>
             <div>
                <p class="text-[11px] font-bold text-slate-500">طريقة الدفع المسجلة</p>
                <p class="text-[13px] font-black text-slate-800 mt-0.5">{{ selectedRequest.payoutMethod?.providerName || selectedRequest.payoutMethod?.methodType || 'غير متوفرة' }}</p>
                <p class="text-[12px] font-bold text-slate-600 font-mono mt-0.5" dir="ltr">{{ selectedRequest.payoutMethod?.maskedLabel || 'N/A' }}</p>
             </div>
          </div>

          <div *ngIf="isApproving" class="space-y-2">
            <label class="block text-[11px] font-bold text-slate-600">الرقم المرجعي للحوالة (Transfer Reference)</label>
            <input type="text" [(ngModel)]="processForm.transferReference"
                   class="w-full bg-white border border-slate-200 rounded-xl text-[14px] font-black text-slate-900 py-3 px-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:font-medium"
                   placeholder="أدخل رقم الحوالة البنكية هنا...">
            <p class="text-[11px] font-bold text-slate-400 mt-1">يُستخدم هذا الرقم كمرجع مالي لعملية الدفع لاحقاً.</p>
          </div>

          <div *ngIf="!isApproving" class="space-y-2">
            <label class="block text-[11px] font-bold text-slate-600">سبب الرفض</label>
            <textarea [(ngModel)]="processForm.failureReason" rows="3"
                      class="w-full bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 py-3 px-4 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder:font-medium resize-none"
                      placeholder="اشرح للمندوب سبب رفض طلب السحب..."></textarea>
          </div>
        </div>

        <div class="flex gap-3 px-6 py-5 border-t border-slate-100 bg-slate-50/50">
          <app-button variant="ghost" size="md" customClass="!rounded-xl flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" (btnClick)="closeProcessModal()">
            تراجع
          </app-button>
          <app-button variant="primary" size="md" customClass="!rounded-xl flex-1 shadow-md"
                      [ngClass]="isApproving ? '!bg-emerald-600 hover:!bg-emerald-700 shadow-emerald-600/20' : '!bg-red-600 hover:!bg-red-700 shadow-red-600/20'"
                      (btnClick)="submitProcess()"
                      [disabled]="isSubmitting || (isApproving && !processForm.transferReference.trim()) || (!isApproving && !processForm.failureReason.trim())">
            {{ isSubmitting ? 'جاري التنفيذ...' : 'تأكيد العملية' }}
          </app-button>
        </div>
      </div>
    </div>
  `
})
export class WithdrawalsQueueComponent implements OnInit {
  private readonly walletsService = inject(WalletsService);
  private readonly translate = inject(TranslateService);

  withdrawals: AdminDriverWithdrawalRequestDto[] = [];
  isLoading = false;
  page = 1;
  pageSize = 20;
  totalCount = 0;
  status: string | null = null;
  isProcessModalOpen = false;
  isApproving = false;
  isSubmitting = false;
  selectedRequest: AdminDriverWithdrawalRequestDto | null = null;

  readonly statusOptions: Array<{ label: string; value: string | null }> = [
    { label: 'الكل', value: null },
    { label: 'قيد الانتظار', value: 'Pending' },
    { label: 'جاري المعالجة', value: 'Processing' },
    { label: 'مكتملة (مدفوعة)', value: 'Paid' },
    { label: 'فشلت', value: 'Failed' },
    { label: 'ملغاة', value: 'Cancelled' }
  ];

  processForm = {
    transferReference: '',
    failureReason: ''
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.walletsService.getWithdrawals(this.status ?? undefined, this.page, this.pageSize)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.withdrawals = data.items;
          this.totalCount = data.totalCount;
          this.isLoading = false;
        },
        error: () => {
          this.withdrawals = [];
          this.totalCount = 0;
          this.isLoading = false;
        }
      });
  }

  setStatus(value: string | null): void {
    this.status = value;
    this.page = 1;
    this.loadData();
  }

  changePage(page: number): void {
    this.page = page;
    this.loadData();
  }

  openProcessModal(req: AdminDriverWithdrawalRequestDto, isApproving: boolean): void {
    this.selectedRequest = req;
    this.isApproving = isApproving;
    this.processForm = { transferReference: '', failureReason: '' };
    this.isProcessModalOpen = true;
  }

  closeProcessModal(): void {
    if (this.isSubmitting) return;
    this.isProcessModalOpen = false;
  }

  submitProcess(): void {
    if (!this.selectedRequest) return;

    const transferReference = this.processForm.transferReference.trim();
    const failureReason = this.processForm.failureReason.trim();

    if (this.isApproving && !transferReference) return;
    if (!this.isApproving && !failureReason) return;

    this.isSubmitting = true;
    this.walletsService.processWithdrawal(this.selectedRequest.id, {
      isApproved: this.isApproving,
      transferReference: this.isApproving ? transferReference : undefined,
      failureReason: !this.isApproving ? failureReason : undefined
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isProcessModalOpen = false;
        this.loadData();
      },
      error: () => {
        this.isSubmitting = false;
      }
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

  getTranslatedStatus(status: string): string {
     const map: Record<string, string> = {
      Pending: 'قيد الانتظار',
      Processing: 'معالجة',
      Paid: 'مكتمل (دُفع)',
      Failed: 'فشل التحويل',
      Cancelled: 'ملغى'
    };
    return map[status] ?? status;
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-amber-50 text-amber-700 border-amber-200',
      Processing: 'bg-blue-50 text-blue-700 border-blue-200',
      Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Failed: 'bg-red-50 text-red-700 border-red-200',
      Cancelled: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return map[status] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  }
}
