import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { CodFilter, CodRecord, CodReconciliationSummary } from '../../models/finance.models';
import { FinanceStatusBadgeComponent } from '../../components/finance-status-badge/finance-status-badge.component';
import { getFinanceLocale } from '../../utils/finance-i18n.utils';
import { buildFinanceScopedProfileNavigation } from '../../utils/finance-profile-navigation.utils';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-cod-reconciliation',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FinanceStatusBadgeComponent,
    AppPageHeaderComponent,
    AppCardComponent,
    AppButtonComponent,
    InlineBannerComponent
  ],
  template: `
    <div class="flex flex-col gap-6 animate-in fade-in duration-700">

      <!-- شريط الصفحة العلوي (Header) -->
      <app-page-header [title]="'FINANCES.COD.TITLE' | translate" [subtitle]="'FINANCES.COD.SUBTITLE' | translate">
        <div actions>
          <app-button variant="primary" size="sm" customClass="!rounded-xl shadow-sm" *ngIf="summary && summary.pendingCases > 0">
            <span class="material-symbols-outlined text-[16px] rtl:ml-1 ltr:mr-1">done_all</span>
            تسوية المبالغ المعلقة
          </app-button>
        </div>
      </app-page-header>

      <!-- بانر الإشعار للفلترة -->
      <app-inline-banner
        *ngIf="hasScope && scopeTitle"
        [title]="(scopedOrderId ? 'FINANCES.COD.SCOPED.ORDER' : (scopedEntityType === 'vendor' ? 'FINANCES.COD.SCOPED.VENDOR' : 'FINANCES.COD.SCOPED.DRIVER')) | translate"
        [message]="scopeTitle"
        [shouldTranslate]="false"
        [icon]="scopedOrderId ? 'receipt_long' : scopedEntityType === 'vendor' ? 'storefront' : 'local_shipping'"
        variant="info">
        <div actions class="flex items-center gap-2">
          <app-button variant="outline" size="sm" customClass="!rounded-xl !bg-white" (btnClick)="openScopedProfile()">
            {{ 'FINANCES.LEDGER.VIEW_PROFILE' | translate }}
          </app-button>
          <app-button variant="ghost" size="sm" customClass="!rounded-xl !bg-slate-900 !text-white hover:!bg-slate-800" (btnClick)="clearScope()">
            {{ 'FINANCES.LEDGER.CLEAR_SCOPE' | translate }}
          </app-button>
        </div>
      </app-inline-banner>

      <!-- ملخص الأرقام (Summary Stats) -->
      <div *ngIf="summary" class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <!-- إجمالي المتوقع -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{{ 'FINANCES.COD.STATS.TOTAL_EXPECTED' | translate }}</p>
          <p class="text-2xl font-black text-slate-800 tabular-nums">{{ formatNumber(summary.totalExpected) }} <span class="text-sm font-bold text-slate-400">{{ 'FINANCES.CURRENCY' | translate }}</span></p>
        </div>
        
        <!-- المحصل الفعلي -->
        <div class="bg-white rounded-2xl border border-emerald-200 shadow-sm px-5 py-4 relative overflow-hidden">
          <div class="absolute -right-6 -top-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl"></div>
          <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 relative z-10">{{ 'FINANCES.COD.STATS.TOTAL_COLLECTED' | translate }}</p>
          <p class="text-2xl font-black text-emerald-700 tabular-nums relative z-10">{{ formatNumber(summary.totalCollected) }} <span class="text-sm font-bold text-emerald-500/70">{{ 'FINANCES.CURRENCY' | translate }}</span></p>
        </div>
        
        <!-- الفارق المالي -->
        <div class="bg-white rounded-2xl border shadow-sm px-5 py-4"
             [ngClass]="summary.totalDelta < 0 ? 'border-red-200' : 'border-slate-200'">
          <p class="text-[10px] font-black uppercase tracking-widest mb-1.5"
             [ngClass]="summary.totalDelta < 0 ? 'text-red-500' : 'text-slate-500'">{{ 'FINANCES.COD.STATS.TOTAL_DELTA' | translate }}</p>
          <p class="text-2xl font-black tabular-nums"
             [ngClass]="summary.totalDelta < 0 ? 'text-red-700' : 'text-slate-800'">
            {{ formatNumber(summary.totalDelta) }} <span class="text-sm font-bold">{{ 'FINANCES.CURRENCY' | translate }}</span>
          </p>
        </div>

        <!-- متأخرات -->
        <div class="bg-white rounded-2xl border border-red-200 shadow-sm px-5 py-4 relative overflow-hidden">
          <div class="absolute -right-6 -top-6 w-20 h-20 bg-red-500/10 rounded-full blur-xl"></div>
          <p class="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1.5 relative z-10">{{ 'FINANCES.COD.STATS.OVERDUE_CASES' | translate }}</p>
          <div class="flex items-end gap-2 relative z-10">
             <p class="text-2xl font-black text-red-700 tabular-nums">{{ formatNumber(summary.overdueCases) }}</p>
             <p class="text-[12px] font-bold text-red-500/70 mb-1">{{ 'FINANCES.COD.STATS.ORDER_UNIT' | translate }}</p>
          </div>
        </div>

        <!-- معلق -->
        <div class="bg-white rounded-2xl border border-amber-200 shadow-sm px-5 py-4 relative overflow-hidden">
          <div class="absolute -right-6 -top-6 w-20 h-20 bg-amber-500/10 rounded-full blur-xl"></div>
          <p class="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5 relative z-10">{{ 'FINANCES.COD.STATS.PENDING_CASES' | translate }}</p>
          <div class="flex items-end gap-2 relative z-10">
             <p class="text-2xl font-black text-amber-700 tabular-nums">{{ formatNumber(summary.pendingCases) }}</p>
             <p class="text-[12px] font-bold text-amber-500/70 mb-1">{{ 'FINANCES.COD.STATS.ORDER_UNIT' | translate }}</p>
          </div>
        </div>
      </div>

      <!-- جدول مطابقة الدفع -->
      <app-card variant="default" rounded="2xl" padding="none" customClass="border-slate-200 shadow-sm overflow-hidden bg-white">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
               <span class="material-symbols-outlined text-[18px]">account_balance_wallet</span>
             </div>
             <div>
               <h3 class="text-[15px] font-black text-slate-900 tracking-tight">{{ 'FINANCES.COD.TABLE.TITLE' | translate }}</h3>
               <p class="text-[11px] font-bold text-slate-500 mt-0.5">{{ 'FINANCES.COD.TABLE.DESC' | translate }}</p>
             </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full whitespace-nowrap text-right text-[13px]">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <th class="px-6 py-4 rtl:text-right ltr:text-left">{{ 'FINANCES.COD.TABLE.ORDER_REF' | translate }}</th>
                <th class="px-6 py-4 rtl:text-right ltr:text-left">{{ 'FINANCES.COD.TABLE.COLLECTOR_DRIVER' | translate }}</th>
                <th class="px-6 py-4 rtl:text-right ltr:text-left">{{ 'FINANCES.COD.TABLE.VENDOR' | translate }}</th>
                <th class="px-6 py-4 rtl:text-left ltr:text-right">{{ 'FINANCES.COD.TABLE.EXPECTED_AMOUNT' | translate }}</th>
                <th class="px-6 py-4 rtl:text-left ltr:text-right">{{ 'FINANCES.COD.TABLE.ACTUAL_COLLECTED' | translate }}</th>
                <th class="px-6 py-4 rtl:text-left ltr:text-right">{{ 'FINANCES.COD.TABLE.FINANCIAL_DELTA' | translate }}</th>
                <th class="px-6 py-4 text-center">{{ 'FINANCES.COD.TABLE.STATUS' | translate }}</th>
                <th class="px-6 py-4 text-center">{{ 'FINANCES.COD.TABLE.ACTION' | translate }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let rec of records; trackBy: trackById"
                  class="group hover:bg-slate-50/80 transition-colors duration-150">

                <td class="px-6 py-4 align-middle">
                  <span class="text-[12px] font-black text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{{ rec.orderRef }}</span>
                </td>

                <td class="px-6 py-4 align-middle">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined text-[14px] text-amber-600">local_shipping</span>
                    </div>
                    <span class="text-[13px] font-black text-slate-800">{{ rec.driverName }}</span>
                  </div>
                </td>

                <td class="px-6 py-4 align-middle">
                  <span class="text-[12px] font-bold text-slate-600">{{ rec.vendorName }}</span>
                </td>

                <td class="px-6 py-4 align-middle text-left" dir="ltr">
                  <span class="text-[13px] font-black text-slate-700 tabular-nums">{{ formatNumber(rec.expectedAmount) }} {{ 'FINANCES.CURRENCY' | translate }}</span>
                </td>

                <td class="px-6 py-4 align-middle text-left" dir="ltr">
                  <span class="text-[13px] font-black tabular-nums"
                        [ngClass]="rec.collectedAmount > 0 ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100' : 'text-slate-400'">
                    {{ formatNumber(rec.collectedAmount) }} {{ 'FINANCES.CURRENCY' | translate }}
                  </span>
                </td>

                <td class="px-6 py-4 align-middle text-left" dir="ltr">
                  <div class="flex items-center justify-end gap-1" [ngClass]="rec.delta < 0 ? 'text-red-600' : rec.delta === 0 ? 'text-emerald-600' : 'text-slate-600'">
                     <span class="material-symbols-outlined text-[14px]" *ngIf="rec.delta < 0">warning</span>
                     <span class="material-symbols-outlined text-[14px]" *ngIf="rec.delta === 0">check_circle</span>
                     <span class="text-[13px] font-black tabular-nums">
                       {{ rec.delta === 0 ? ('FINANCES.COD.TABLE.MATCHED' | translate) : formatNumber(rec.delta) + ' ' + ('FINANCES.CURRENCY' | translate) }}
                     </span>
                  </div>
                </td>

                <td class="px-6 py-4 align-middle">
                  <div class="flex justify-center">
                    <app-finance-status-badge [status]="rec.status"></app-finance-status-badge>
                  </div>
                </td>

                <td class="px-6 py-4 align-middle">
                  <div class="flex justify-center">
                    <button *ngIf="rec.status === 'overdue' || rec.status === 'pending'"
                            class="h-8 px-3 text-[10px] font-black text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-sm transition-all flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">done_all</span>
                      {{ 'FINANCES.COD.TABLE.MANUAL_SETTLE' | translate }}
                    </button>
                    <span *ngIf="rec.status === 'collected'" class="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">{{ 'FINANCES.COD.TABLE.SETTLED' | translate }}</span>
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="records.length === 0" class="flex flex-col items-center justify-center py-24 text-center bg-white">
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
             <span class="material-symbols-outlined text-4xl text-slate-300">task_alt</span>
          </div>
          <h3 class="text-[15px] font-black text-slate-800">{{ 'FINANCES.COD.NO_DATA_TITLE' | translate }}</h3>
          <p class="text-[12px] font-medium text-slate-500 mt-1 max-w-sm">{{ 'FINANCES.COD.NO_DATA_DESC' | translate }}</p>
        </div>
      </app-card>
    </div>
  `
})
export class CodReconciliationComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private financeService = inject(FinanceService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  records: CodRecord[] = [];
  summary: CodReconciliationSummary | null = null;
  scopedEntityType: 'vendor' | 'driver' | null = null;
  scopedEntityId: string | null = null;
  scopedOrderId: string | null = null;

  get hasScope(): boolean {
    return !!this.scopedEntityId || !!this.scopedOrderId;
  }

  get scopeTitle(): string {
    if (this.scopedOrderId) {
      return this.records.find(record => record.orderId === this.scopedOrderId)?.orderRef ?? this.scopedOrderId;
    }

    if (this.scopedEntityType === 'vendor') {
      return this.records.find(record => record.vendorId === this.scopedEntityId)?.vendorName ?? this.scopedEntityId ?? '';
    }

    return this.records.find(record => record.driverId === this.scopedEntityId)?.driverName ?? this.scopedEntityId ?? '';
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.cdr.markForCheck();
      const entityType = params.get('entityType');
      this.scopedEntityType = entityType === 'vendor' || entityType === 'driver' ? entityType : null;
      this.scopedEntityId = params.get('entityId');
      this.scopedOrderId = params.get('orderId');
      this.loadData();
    });
  }

  loadData(filter: CodFilter = {}): void {
    this.financeService.getCodRecords({
      ...filter,
      entityType: this.scopedEntityType ?? filter.entityType,
      entityId: this.scopedEntityId ?? filter.entityId,
      orderId: this.scopedOrderId ?? filter.orderId
    }).pipe(take(1)).subscribe(({ summary, records }) => {
      this.cdr.markForCheck();
      this.summary = summary;
      this.records = records;
    });
  }

  trackById(_: number, r: CodRecord): string { return r.id; }

  clearScope(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { entityType: null, entityId: null, orderId: null },
      queryParamsHandling: 'merge'
    });
  }

  openScopedProfile(): void {
    if (this.scopedOrderId) {
      this.router.navigate(['/orders', this.scopedOrderId]);
      return;
    }

    if (!this.scopedEntityType || !this.scopedEntityId) {
      return;
    }

    const navigation = buildFinanceScopedProfileNavigation(this.scopedEntityType, this.scopedEntityId);

    this.router.navigate(navigation.commands, navigation.extras);
  }

  formatNumber(value: number): string {
    return value.toLocaleString(getFinanceLocale(this.translate.currentLang), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }
}
