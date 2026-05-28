import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { Settlement, EntityType } from '../../models/finance.models';
import { FinanceStatusBadgeComponent } from '../../components/finance-status-badge/finance-status-badge.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { KeyValueGridComponent, KeyValueGridItem } from '../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { getFinanceLocale } from '../../utils/finance-i18n.utils';
import { buildFinanceScopedProfileNavigation } from '../../utils/finance-profile-navigation.utils';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-settlements',
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule, 
    FinanceStatusBadgeComponent, 
    AppCardComponent, 
    AppButtonComponent, 
    InlineBannerComponent, 
    KeyValueGridComponent,
    AppPageHeaderComponent
  ],
  template: `
    <!-- نافذة تفاصيل التسوية (Settlement Detail Modal) -->
    <div *ngIf="selectedSettlement" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" (click)="selectedSettlement = null"></div>
      <div class="relative bg-white rounded-3xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 class="text-[15px] font-black text-slate-900">{{ 'FINANCES.SETTLEMENTS.DETAIL_TITLE' | translate }}</h3>
            <p class="text-[11px] font-bold text-slate-500 font-mono mt-0.5">{{ selectedSettlement.settlementCode }}</p>
          </div>
          <button class="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors" (click)="selectedSettlement = null">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div class="flex items-center gap-3">
             <div class="w-12 h-12 rounded-xl flex items-center justify-center border shrink-0"
                  [ngClass]="selectedSettlement.entityType === 'vendor' ? 'bg-cyan-50 border-cyan-100 text-cyan-600' : 'bg-amber-50 border-amber-100 text-amber-600'">
                <span class="material-symbols-outlined text-[24px]">
                   {{ selectedSettlement.entityType === 'vendor' ? 'storefront' : 'local_shipping' }}
                </span>
             </div>
             <div>
                <p class="text-[15px] font-black text-slate-900 leading-tight">{{ selectedSettlement.entityName }}</p>
                <span class="inline-flex mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border"
                      [ngClass]="selectedSettlement.entityType === 'vendor' ? 'bg-cyan-50 text-cyan-700 border-cyan-100' : 'bg-amber-50 text-amber-700 border-amber-100'">
                   {{ (selectedSettlement.entityType === 'vendor' ? 'FINANCES.ENTITIES.VENDOR' : 'FINANCES.ENTITIES.DRIVER') | translate }}
                </span>
             </div>
          </div>

          <div class="p-6 rounded-2xl text-center border bg-emerald-50 border-emerald-100">
            <p class="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-2">{{ 'FINANCES.SETTLEMENTS.NET_DUE' | translate }}</p>
            <p class="text-4xl font-black tabular-nums tracking-tight text-emerald-700">
               {{ formatNumber(selectedSettlement.netAmount) }} <span class="text-[15px] font-bold">{{ 'FINANCES.CURRENCY' | translate }}</span>
            </p>
            <div class="mt-4 flex justify-center">
               <app-finance-status-badge [status]="selectedSettlement.status"></app-finance-status-badge>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex justify-between items-center py-2 border-b border-slate-100 border-dashed">
               <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.SETTLEMENTS.GROSS_REVENUE' | translate }}</span>
               <span class="text-[13px] font-black text-slate-900 tabular-nums">{{ formatNumber(selectedSettlement.grossAmount) }} {{ 'FINANCES.CURRENCY' | translate }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-slate-100 border-dashed">
               <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.SETTLEMENTS.DEDUCTIONS' | translate }}</span>
               <span class="text-[13px] font-black text-red-600 tabular-nums">-{{ formatNumber(selectedSettlement.deductions) }} {{ 'FINANCES.CURRENCY' | translate }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-slate-100 border-dashed">
               <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.SETTLEMENTS.ORDERS_COUNT' | translate }}</span>
               <span class="text-[13px] font-black text-slate-800 tabular-nums">{{ 'FINANCES.SETTLEMENTS.ORDERS_COUNT_VAL' | translate: { count: selectedSettlement.ordersCount } }}</span>
            </div>
            <div class="flex justify-between items-center py-2">
               <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.SETTLEMENTS.FINANCIAL_PERIOD' | translate }}</span>
               <span class="text-[12px] font-bold text-slate-700" dir="ltr">{{ formatDate(selectedSettlement.periodFrom) }} - {{ formatDate(selectedSettlement.periodTo) }}</span>
            </div>
          </div>

          <div class="pt-4 flex gap-3">
            <app-button *ngIf="selectedSettlement.status === 'pending'"
                    variant="primary"
                    size="md"
                    customClass="!flex-1 !rounded-xl shadow-md shadow-zadna-primary/20"
                    (btnClick)="processSettlement(selectedSettlement)">
              <span class="material-symbols-outlined text-[18px] rtl:ml-1 ltr:mr-1">payments</span>
              {{ 'FINANCES.SETTLEMENTS.PROCESS_PAYMENT' | translate }}
            </app-button>
            <app-button variant="outline" size="md" customClass="!flex-1 !rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
              <span class="material-symbols-outlined text-[18px] rtl:ml-1 ltr:mr-1">download</span>
              {{ 'FINANCES.SETTLEMENTS.ACCOUNT_STATEMENT' | translate }}
            </app-button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6 animate-in fade-in duration-700">

      <!-- شريط الصفحة العلوي (Header) -->
      <app-page-header [title]="'FINANCES.SETTLEMENTS.TITLE' | translate" [subtitle]="'FINANCES.SETTLEMENTS.SUBTITLE' | translate">
        <div actions class="flex items-center gap-3">
          <!-- مبدل الكيانات (Tabs) -->
          <div class="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <button (click)="setActiveTab('vendor')"
                    class="px-5 py-2 text-[12px] font-bold rounded-lg transition-all duration-200 flex items-center gap-2"
                    [ngClass]="activeTab === 'vendor' ? 'bg-white text-zadna-primary shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'">
              <span class="material-symbols-outlined text-[16px]">storefront</span>
              {{ 'FINANCES.SETTLEMENTS.TABS.VENDORS' | translate }}
            </button>
            <button (click)="setActiveTab('driver')"
                    class="px-5 py-2 text-[12px] font-bold rounded-lg transition-all duration-200 flex items-center gap-2"
                    [ngClass]="activeTab === 'driver' ? 'bg-white text-zadna-primary shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'">
              <span class="material-symbols-outlined text-[16px]">local_shipping</span>
              {{ 'FINANCES.SETTLEMENTS.TABS.DRIVERS' | translate }}
            </button>
          </div>
        </div>
      </app-page-header>

      <!-- بانر الإشعار للفلترة -->
      <app-inline-banner
        *ngIf="hasScope && scopedSettlement"
        [title]="(scopedSettlement.entityType === 'vendor' ? 'FINANCES.SETTLEMENTS.SCOPED.VENDOR' : 'FINANCES.SETTLEMENTS.SCOPED.DRIVER') | translate"
        [message]="scopedSettlement.entityName"
        [shouldTranslate]="false"
        [icon]="scopedSettlement.entityType === 'vendor' ? 'storefront' : 'local_shipping'"
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
      <app-card variant="default" rounded="2xl" padding="none" customClass="border-slate-200 shadow-sm overflow-hidden bg-white">
          <div class="grid grid-cols-2 lg:grid-cols-4 divide-x rtl:divide-x-reverse divide-slate-100">
             <div *ngFor="let stat of activeStats" class="px-6 py-5">
               <p class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{{ stat.labelKey | translate }}</p>
               <p class="text-2xl font-black tabular-nums tracking-tight" [ngClass]="stat.color">{{ stat.value }}</p>
             </div>
          </div>
      </app-card>

      <!-- جدول التسويات -->
      <app-card variant="default" rounded="2xl" padding="none" customClass="border-slate-200 shadow-sm overflow-hidden bg-white">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  [ngClass]="activeTab === 'vendor' ? 'bg-cyan-100 text-cyan-600' : 'bg-amber-100 text-amber-600'">
               <span class="material-symbols-outlined text-[18px]">{{ activeTab === 'vendor' ? 'storefront' : 'local_shipping' }}</span>
             </div>
              <div>
                <h3 class="text-[15px] font-black text-slate-900 tracking-tight">{{ 'FINANCES.SETTLEMENTS.TABLE.TITLE' | translate }}</h3>
                <p class="text-[11px] font-bold text-slate-500 mt-0.5">{{ 'FINANCES.SETTLEMENTS.TABLE.DESC' | translate }}</p>
              </div>
          </div>
          <app-button variant="outline" size="sm" customClass="!rounded-xl bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
            <span class="material-symbols-outlined text-[16px] rtl:ml-1 ltr:mr-1">add</span>
            {{ 'FINANCES.SETTLEMENTS.TABLE.CREATE_EXTRA' | translate }}
          </app-button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full whitespace-nowrap text-right text-[13px]">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <th class="px-6 py-4 rtl:text-right ltr:text-left">{{ 'FINANCES.SETTLEMENTS.TABLE.CODE' | translate }}</th>
                <th class="px-6 py-4 rtl:text-right ltr:text-left">{{ 'FINANCES.SETTLEMENTS.TABLE.ENTITY' | translate }}</th>
                <th class="px-6 py-4 rtl:text-right ltr:text-left">{{ 'FINANCES.SETTLEMENTS.TABLE.PERIOD' | translate }}</th>
                <th class="px-6 py-4 text-center">{{ 'FINANCES.SETTLEMENTS.TABLE.ORDERS' | translate }}</th>
                <th class="px-6 py-4 rtl:text-left ltr:text-right">{{ 'FINANCES.SETTLEMENTS.TABLE.REVENUE' | translate }}</th>
                <th class="px-6 py-4 rtl:text-left ltr:text-right">{{ 'FINANCES.SETTLEMENTS.TABLE.DEDUCTION' | translate }}</th>
                <th class="px-6 py-4 rtl:text-left ltr:text-right">{{ 'FINANCES.SETTLEMENTS.TABLE.NET_PAY' | translate }}</th>
                <th class="px-6 py-4 text-center">{{ 'FINANCES.SETTLEMENTS.TABLE.STATUS' | translate }}</th>
                <th class="px-6 py-4 text-center">{{ 'FINANCES.SETTLEMENTS.TABLE.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let s of activeSettlements; trackBy: trackById"
                  class="group hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer"
                  (click)="openDetail(s)">

                <td class="px-6 py-4 align-middle">
                  <span class="text-[12px] font-black text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded-md">{{ s.settlementCode }}</span>
                </td>

                <td class="px-6 py-4 align-middle">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                         [ngClass]="s.entityType === 'vendor' ? 'bg-cyan-50 border-cyan-100 text-cyan-600' : 'bg-amber-50 border-amber-100 text-amber-600'">
                      <span class="material-symbols-outlined text-[16px]">
                        {{ s.entityType === 'vendor' ? 'storefront' : 'local_shipping' }}
                      </span>
                    </div>
                    <div>
                      <p class="text-[13px] font-black text-slate-800 leading-tight">{{ s.entityName }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4 align-middle">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[12px] font-bold text-slate-700">{{ getTranslatedPeriod(s.period) | translate }}</span>
                    <span class="text-[10px] font-bold text-slate-400" dir="ltr">{{ formatDate(s.periodFrom) }} - {{ formatDate(s.periodTo) }}</span>
                  </div>
                </td>

                <td class="px-6 py-4 align-middle text-center">
                  <span class="text-[13px] font-black text-slate-600 tabular-nums">{{ formatNumber(s.ordersCount) }}</span>
                </td>

                <td class="px-6 py-4 align-middle text-left" dir="ltr">
                  <span class="text-[13px] font-bold text-slate-600 tabular-nums">{{ formatNumber(s.grossAmount) }} {{ 'FINANCES.CURRENCY' | translate }}</span>
                </td>

                <td class="px-6 py-4 align-middle text-left" dir="ltr">
                  <span class="text-[13px] font-bold text-red-500 tabular-nums">-{{ formatNumber(s.deductions) }} {{ 'FINANCES.CURRENCY' | translate }}</span>
                </td>

                <td class="px-6 py-4 align-middle text-left" dir="ltr">
                  <span class="text-[14px] font-black text-emerald-700 tabular-nums bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">{{ formatNumber(s.netAmount) }} {{ 'FINANCES.CURRENCY' | translate }}</span>
                </td>

                <td class="px-6 py-4 align-middle">
                  <div class="flex justify-center">
                    <app-finance-status-badge [status]="s.status"></app-finance-status-badge>
                  </div>
                </td>

                <td class="px-6 py-4 align-middle">
                  <div class="flex items-center justify-center gap-2" (click)="$event.stopPropagation()">
                    <app-button *ngIf="s.status === 'pending'"
                            variant="primary"
                            size="xs"
                            customClass="!rounded-lg shadow-sm"
                            (btnClick)="processSettlement(s)">
                      {{ 'FINANCES.SETTLEMENTS.TABLE.PAY_NOW' | translate }}
                    </app-button>
                    <button class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors" (click)="openDetail(s)">
                      <span class="material-symbols-outlined text-[16px]">visibility</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="activeSettlements.length === 0"
             class="flex flex-col items-center justify-center py-24 text-center bg-white">
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
             <span class="material-symbols-outlined text-4xl text-slate-300">account_balance</span>
          </div>
          <h3 class="text-[15px] font-black text-slate-800">{{ 'FINANCES.SETTLEMENTS.NO_DATA_TITLE' | translate }}</h3>
          <p class="text-[12px] font-medium text-slate-500 mt-1 max-w-sm">{{ 'FINANCES.SETTLEMENTS.NO_DATA_DESC' | translate }}</p>
        </div>
      </app-card>

    </div>
  `
})
export class SettlementsComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private financeService = inject(FinanceService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  allSettlements: Settlement[] = [];
  selectedSettlement: Settlement | null = null;
  activeTab: EntityType = 'vendor';
  scopedEntityId: string | null = null;

  get vendorSettlements(): Settlement[] { return this.allSettlements.filter(s => s.entityType === 'vendor'); }
  get driverSettlements(): Settlement[] { return this.allSettlements.filter(s => s.entityType === 'driver'); }
  get activeSettlements(): Settlement[] {
    const base = this.activeTab === 'vendor' ? this.vendorSettlements : this.driverSettlements;
    return this.scopedEntityId ? base.filter(s => s.entityId === this.scopedEntityId) : base;
  }
  get scopedSettlement(): Settlement | null {
    return this.scopedEntityId ? (this.allSettlements.find(s => s.entityId === this.scopedEntityId) ?? null) : null;
  }
  get hasScope(): boolean { return !!this.scopedEntityId; }

  get activeStats() {
    const data = this.activeSettlements;
    const paid = data.filter(s => s.status === 'paid');
    const pending = data.filter(s => s.status === 'pending');
    const totalNet = data.reduce((sum, item) => sum + item.netAmount, 0);
    const paidNet = paid.reduce((sum, item) => sum + item.netAmount, 0);

    return [
      { labelKey: 'FINANCES.SETTLEMENTS.STATS.TOTAL', value: this.formatNumber(data.length), color: 'text-slate-900' },
      { labelKey: 'FINANCES.SETTLEMENTS.STATS.PAID', value: `${this.formatNumber(paid.length)} / ${this.formatNumber(paidNet)} ${this.translate.instant('FINANCES.CURRENCY')}`, color: 'text-emerald-600' },
      { labelKey: 'FINANCES.SETTLEMENTS.STATS.PENDING', value: this.formatNumber(pending.length), color: 'text-amber-600' },
      { labelKey: 'FINANCES.SETTLEMENTS.STATS.TOTAL_AMOUNT', value: `${this.formatNumber(totalNet)} ${this.translate.instant('FINANCES.CURRENCY')}`, color: 'text-zadna-primary' }
    ];
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
      this.cdr.markForCheck();
        const entityType = params.get('entityType');
        this.scopedEntityId = params.get('entityId');
        if (entityType === 'vendor' || entityType === 'driver') {
          this.activeTab = entityType;
        }
      });

    this.loadSettlements();
  }

  loadSettlements(): void {
    this.financeService.getSettlements({
      entityType: this.activeTab,
      entityId: this.scopedEntityId ?? undefined
    }).pipe(take(1)).subscribe(data => {
      this.cdr.markForCheck();
      this.allSettlements = data;
    });
  }

  setActiveTab(tab: EntityType): void {
    this.activeTab = tab;
    this.loadSettlements();
  }

  openDetail(s: Settlement): void { this.selectedSettlement = s; }
  
  processSettlement(s: Settlement): void {
    this.financeService.approveSettlement(s.id).pipe(take(1)).subscribe(() => {
      this.cdr.markForCheck();
      this.selectedSettlement = null;
      this.loadSettlements();
    });
  }
  
  trackById(_: number, s: Settlement): string { return s.id; }

  clearScope(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { entityType: null, entityId: null },
      queryParamsHandling: 'merge'
    });
  }

  openScopedProfile(): void {
    if (!this.scopedSettlement) return;
    if (this.scopedSettlement.entityType !== 'vendor' && this.scopedSettlement.entityType !== 'driver') {
      return;
    }

    const navigation = buildFinanceScopedProfileNavigation(
      this.scopedSettlement.entityType,
      this.scopedSettlement.entityId
    );

    this.router.navigate(navigation.commands, navigation.extras);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString(getFinanceLocale(this.translate.currentLang), { calendar: 'gregory' });
  }

  formatNumber(value: number): string {
    return value.toLocaleString(getFinanceLocale(this.translate.currentLang), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }
  
  getTranslatedPeriod(period: string): string {
    return `FINANCES.SETTLEMENTS.PERIODS.${period.toUpperCase().replace('-', '_')}`;
  }
}
