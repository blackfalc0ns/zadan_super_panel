import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { LedgerEntry, LedgerFilter } from '../../models/finance.models';
import { MoneyBadgeComponent } from '../../components/money-badge/money-badge.component';
import { FinanceFilterBarComponent } from '../../components/finance-filter-bar/finance-filter-bar.component';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { KeyValueGridComponent, KeyValueGridItem } from '../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { getFinanceLocale } from '../../utils/finance-i18n.utils';
import { buildFinanceScopedProfileNavigation } from '../../utils/finance-profile-navigation.utils';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-financial-ledger',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MoneyBadgeComponent,
    FinanceFilterBarComponent,
    AppPaginationComponent,
    AppCardComponent,
    AppButtonComponent,
    InlineBannerComponent,
    KeyValueGridComponent,
    AppPageHeaderComponent
  ],
  template: `
    <!-- نافذة تفاصيل الحركة (Entry Detail Modal) -->
    <div *ngIf="selectedEntry" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" (click)="selectedEntry = null"></div>
      <div class="relative bg-white rounded-3xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 class="text-[15px] font-black text-slate-900">{{ 'FINANCES.LEDGER.DETAIL_TITLE' | translate }}</h3>
            <p class="text-[11px] font-bold text-slate-500 font-mono mt-0.5">{{ selectedEntry.referenceId }}</p>
          </div>
          <button class="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors" (click)="selectedEntry = null">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div class="p-6 rounded-2xl text-center mb-6 border"
               [ngClass]="selectedEntry.direction === 'credit' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'">
            <p class="text-[11px] font-black uppercase tracking-widest mb-2"
               [ngClass]="selectedEntry.direction === 'credit' ? 'text-emerald-600' : 'text-red-600'">
               {{ (selectedEntry.direction === 'credit' ? 'FINANCES.LEDGER.DIRECTION_CREDIT' : 'FINANCES.LEDGER.DIRECTION_DEBIT') | translate }}
            </p>
            <p class="text-4xl font-black tabular-nums tracking-tight"
               [ngClass]="selectedEntry.direction === 'credit' ? 'text-emerald-700' : 'text-red-700'">
               <span class="text-2xl font-bold">{{ selectedEntry.direction === 'credit' ? '+' : '-' }}</span>{{ formatNumber(selectedEntry.amount) }}
               <span class="text-[15px] font-bold">{{ 'FINANCES.CURRENCY' | translate }}</span>
            </p>
          </div>

          <div class="space-y-4">
            <div class="flex justify-between items-center py-2 border-b border-slate-100 border-dashed">
               <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.LEDGER.ENTITY_LINKED' | translate }}</span>
               <div class="flex items-center gap-2">
                 <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase" [ngClass]="getEntityBadgeClass(selectedEntry.entityType)">{{ getTranslatedEntityType(selectedEntry.entityType) }}</span>
                 <span class="text-[13px] font-black text-slate-900">{{ selectedEntry.entityName }}</span>
               </div>
            </div>
            
            <div class="flex justify-between items-center py-2 border-b border-slate-100 border-dashed">
               <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.LEDGER.ENTRY_TYPE' | translate }}</span>
               <span class="text-[13px] font-black text-slate-900">{{ getTranslatedLedgerType(selectedEntry.type) | translate }}</span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-slate-100 border-dashed">
               <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.LEDGER.PRIMARY_REF' | translate }}</span>
               <span class="text-[12px] font-black text-slate-700 font-mono">{{ selectedEntry.referenceId }}</span>
            </div>

            <div *ngIf="selectedEntry.orderId" class="flex justify-between items-center py-2 border-b border-slate-100 border-dashed">
               <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.LEDGER.ORDER_ID' | translate }}</span>
               <span class="text-[12px] font-black text-zadna-primary font-mono bg-zadna-primary/10 px-2 py-0.5 rounded-md">{{ selectedEntry.orderId }}</span>
            </div>

            <div *ngIf="selectedEntry.settlementId" class="flex justify-between items-center py-2 border-b border-slate-100 border-dashed">
               <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.LEDGER.SETTLEMENT_ID' | translate }}</span>
               <span class="text-[12px] font-black text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded-md">{{ selectedEntry.settlementId }}</span>
            </div>

            <div *ngIf="selectedEntry.balanceAfter !== undefined" class="flex justify-between items-center py-2 border-b border-slate-100 border-dashed">
               <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.LEDGER.BALANCE_AFTER' | translate }}</span>
               <span class="text-[13px] font-black text-slate-800 tabular-nums">{{ formatNumber(selectedEntry.balanceAfter) }} {{ 'FINANCES.CURRENCY' | translate }}</span>
            </div>

            <div class="flex justify-between items-center py-2">
               <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.LEDGER.DATE_TIME' | translate }}</span>
               <span class="text-[13px] font-bold text-slate-700" dir="ltr">{{ formatTime(selectedEntry.timestamp) }} - {{ formatDate(selectedEntry.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6 animate-in fade-in duration-700">

      <!-- شريط الصفحة العلوي (Header) -->
      <app-page-header [title]="'FINANCES.LEDGER.TITLE' | translate" [subtitle]="'FINANCES.LEDGER.SUBTITLE' | translate">
        <div actions>
          <app-button variant="outline" size="sm" customClass="!rounded-xl bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm" (btnClick)="onExport()">
            <span class="material-symbols-outlined text-[16px] rtl:ml-1 ltr:mr-1">download</span>
            {{ 'FINANCES.LEDGER.EXPORT_CSV' | translate }}
          </app-button>
        </div>
      </app-page-header>

      <!-- شريط الفلاتر والإشعارات -->
      <div class="flex flex-col gap-4">
        <app-finance-filter-bar
          [showEntityType]="true"
          [showLedgerType]="true"
          [showDirection]="true"
          [showExport]="false"
          (filterChange)="onFilterChange($event)">
        </app-finance-filter-bar>

        <app-inline-banner
          *ngIf="hasScope"
          [title]="scopedOrderId ? ('FINANCES.LEDGER.SCOPED_ORDER' | translate) : (getTranslatedEntityType(scopedEntityType || 'platform') | translate)"
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
      </div>

      <!-- ملخص الأرقام (Summary Stats) -->
      <app-card variant="default" rounded="2xl" padding="none" customClass="border-slate-200 shadow-sm overflow-hidden bg-white">
        <div class="grid grid-cols-2 lg:grid-cols-4 divide-x rtl:divide-x-reverse divide-slate-100">
           <div *ngFor="let stat of summaryStats" class="px-6 py-5">
             <p class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{{ stat.labelKey | translate }}</p>
             <p class="text-2xl font-black tabular-nums tracking-tight" [ngClass]="stat.color">{{ stat.value }}</p>
           </div>
        </div>
      </app-card>

      <!-- جدول السجل المالي -->
      <app-card variant="default" rounded="2xl" padding="none" customClass="border-slate-200 shadow-sm overflow-hidden bg-white">
        <div class="overflow-x-auto">
          <table class="w-full whitespace-nowrap text-right text-[13px]">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <th class="px-6 py-4 rtl:text-right ltr:text-left">{{ 'FINANCES.LEDGER.TABLE.DATE' | translate }}</th>
                <th class="px-6 py-4 rtl:text-right ltr:text-left">{{ 'FINANCES.LEDGER.TABLE.ENTITY' | translate }}</th>
                <th class="px-6 py-4 rtl:text-right ltr:text-left">{{ 'FINANCES.LEDGER.TABLE.TYPE' | translate }}</th>
                <th class="px-6 py-4 rtl:text-right ltr:text-left">{{ 'FINANCES.LEDGER.TABLE.REF' | translate }}</th>
                <th class="px-6 py-4 rtl:text-left ltr:text-right">{{ 'FINANCES.LEDGER.TABLE.AMOUNT' | translate }}</th>
                <th class="px-6 py-4 text-center w-16">{{ 'FINANCES.LEDGER.TABLE.DIRECTION' | translate }}</th>
                <th class="px-6 py-4 rtl:text-left ltr:text-right">{{ 'FINANCES.LEDGER.TABLE.BALANCE' | translate }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let entry of pagedEntries; trackBy: trackById"
                  class="group hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer"
                  [class.opacity-50]="isLoading"
                  (click)="openEntryDetail(entry)">

                <td class="px-6 py-4 align-middle">
                  <div class="flex flex-col gap-0.5">
                    <span class="font-bold text-slate-900 tabular-nums">{{ formatDate(entry.timestamp) }}</span>
                    <span class="text-[10px] font-bold text-slate-400 tabular-nums">{{ formatTime(entry.timestamp) }}</span>
                  </div>
                </td>

                <td class="px-6 py-4 align-middle">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                         [ngClass]="getEntityIconBg(entry.entityType)">
                      <span class="material-symbols-outlined text-[16px]">
                        {{ getEntityIcon(entry.entityType) }}
                      </span>
                    </div>
                    <div>
                      <p class="text-[13px] font-black text-slate-800 leading-tight">{{ entry.entityName }}</p>
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{{ getTranslatedEntityType(entry.entityType) | translate }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4 align-middle">
                  <span class="inline-flex px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border"
                        [ngClass]="getTypeBadgeClass(entry.type)">
                    {{ getTranslatedLedgerType(entry.type) | translate }}
                  </span>
                </td>

                <td class="px-6 py-4 align-middle">
                  <span class="text-[12px] font-black text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded-md">{{ entry.referenceId }}</span>
                </td>

                <td class="px-6 py-4 align-middle text-left" dir="ltr">
                  <app-money-badge
                    [amount]="entry.amount"
                    [direction]="entry.direction"
                    [showDirection]="true"
                    [currency]="entry.currency"
                    size="sm">
                  </app-money-badge>
                </td>

                <td class="px-6 py-4 align-middle">
                  <div class="flex justify-center">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center"
                          [ngClass]="entry.direction === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'">
                      <span class="material-symbols-outlined text-[16px]">
                        {{ entry.direction === 'credit' ? 'arrow_downward' : 'arrow_upward' }}
                      </span>
                    </span>
                  </div>
                </td>

                <td class="px-6 py-4 align-middle text-left" dir="ltr">
                  <span *ngIf="entry.balanceAfter !== undefined" class="text-[13px] font-black text-slate-700 tabular-nums">
                    {{ formatNumber(entry.balanceAfter) }}
                  </span>
                  <span *ngIf="entry.balanceAfter === undefined" class="text-[12px] font-bold text-slate-300">&mdash;</span>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="!isLoading && filteredEntries.length === 0"
             class="flex flex-col items-center justify-center py-24 text-center bg-white">
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
             <span class="material-symbols-outlined text-4xl text-slate-300">receipt_long</span>
          </div>
          <h3 class="text-[15px] font-black text-slate-800">{{ 'FINANCES.LEDGER.NO_ENTRIES_TITLE' | translate }}</h3>
          <p class="text-[12px] font-medium text-slate-500 mt-1 max-w-sm">{{ 'FINANCES.LEDGER.NO_ENTRIES_DESC' | translate }}</p>
        </div>
      </app-card>

      <!-- الترقيم (Pagination) -->
      <div *ngIf="filteredEntries.length > 0" class="flex justify-center pt-2 pb-8">
        <app-pagination
          [currentPage]="page"
          [pageSize]="pageSize"
          [totalItems]="filteredEntries.length"
          (pageChange)="changePage($event)">
        </app-pagination>
      </div>

    </div>
  `
})
export class FinancialLedgerComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private financeService = inject(FinanceService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  allEntries: LedgerEntry[] = [];
  filteredEntries: LedgerEntry[] = [];
  selectedEntry: LedgerEntry | null = null;
  isLoading = false;
  page = 1;
  pageSize = 15;
  currentFilter: LedgerFilter = {};
  scopedEntityType: LedgerFilter['entityType'] | null = null;
  scopedEntityId: string | null = null;
  scopedOrderId: string | null = null;

  get hasScope(): boolean {
    return !!this.scopedEntityId || !!this.scopedOrderId;
  }

  get scopeTitle(): string {
    if (this.scopedOrderId) {
      const orderEntry = this.allEntries.find((entry) => entry.orderId === this.scopedOrderId);
      return orderEntry?.referenceId ?? this.scopedOrderId;
    }

    if (this.scopedEntityId) {
      const entityEntry = this.allEntries.find((entry) => entry.entityId === this.scopedEntityId);
      return entityEntry?.entityName ?? this.scopedEntityId;
    }

    return '';
  }

  get summaryStats() {
    const credits = this.filteredEntries.filter(e => e.direction === 'credit').reduce((s, e) => s + e.amount, 0);
    const debits = this.filteredEntries.filter(e => e.direction === 'debit').reduce((s, e) => s + e.amount, 0);
    return [
      { labelKey: 'FINANCES.LEDGER.STATS.TOTAL_ENTRIES', value: this.formatNumber(this.filteredEntries.length), color: 'text-slate-900' },
      { labelKey: 'FINANCES.LEDGER.STATS.TOTAL_CREDITS', value: `${this.formatNumber(credits)}`, color: 'text-emerald-600' },
      { labelKey: 'FINANCES.LEDGER.STATS.TOTAL_DEBITS', value: `${this.formatNumber(debits)}`, color: 'text-red-600' },
      { labelKey: 'FINANCES.LEDGER.STATS.NET_FLOW', value: `${this.formatNumber(credits - debits)}`, color: (credits - debits) >= 0 ? 'text-emerald-600' : 'text-red-600' }
    ];
  }

  get pagedEntries(): LedgerEntry[] {
    const startIndex = (this.page - 1) * this.pageSize;
    return this.filteredEntries.slice(startIndex, startIndex + this.pageSize);
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
      this.cdr.markForCheck();
        const entityType = params.get('entityType');
        this.scopedEntityType = entityType === 'vendor' || entityType === 'driver' || entityType === 'platform' || entityType === 'order' || entityType === 'customer'
          ? entityType
          : null;
        this.scopedEntityId = params.get('entityId');
        this.scopedOrderId = params.get('orderId');
        this.loadData();
      });
  }

  loadData(filter: LedgerFilter = this.currentFilter): void {
    this.isLoading = true;
    this.currentFilter = filter;
    this.financeService.getLedgerEntries({
      ...filter,
      entityType: this.scopedEntityType ?? filter.entityType,
      entityId: this.scopedEntityId ?? filter.entityId,
      orderId: this.scopedOrderId ?? filter.orderId
    }).pipe(take(1)).subscribe(entries => {
      this.cdr.markForCheck();
      this.allEntries = entries;
      this.filteredEntries = entries;
      this.page = 1;
      this.isLoading = false;
    });
  }

  onFilterChange(filter: LedgerFilter): void {
    this.loadData(filter);
  }

  onExport(): void {
    const rows = this.filteredEntries.map((entry) => [
      entry.timestamp,
      entry.entityType,
      entry.entityName,
      entry.type,
      entry.referenceId,
      entry.direction,
      entry.amount.toString(),
      entry.currency
    ].join(','));

    const blob = new Blob([[
      'Timestamp,Entity Type,Entity Name,Type,Reference,Direction,Amount,Currency',
      ...rows
    ].join('\n')], {
      type: 'text/csv;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'financial-ledger.csv';
    link.click();

    URL.revokeObjectURL(url);
  }

  changePage(page: number): void { this.page = page; }

  openEntryDetail(entry: LedgerEntry): void { this.selectedEntry = entry; }

  trackById(_: number, entry: LedgerEntry): string { return entry.id; }

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

    if (this.scopedEntityType !== 'vendor' && this.scopedEntityType !== 'driver') {
      return;
    }

    const navigation = buildFinanceScopedProfileNavigation(this.scopedEntityType, this.scopedEntityId);

    this.router.navigate(navigation.commands, navigation.extras);
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

  getTranslatedLedgerType(type: string): string {
    return `FINANCES.LEDGER.TYPES.${type.toUpperCase()}`;
  }

  getTranslatedEntityType(type: string): string {
    return `FINANCES.ENTITIES.${type.toUpperCase()}`;
  }

  getEntityIcon(type: string): string {
    const map: Record<string, string> = { vendor: 'storefront', driver: 'local_shipping', customer: 'person', platform: 'hub', order: 'receipt_long' };
    return map[type] ?? 'circle';
  }

  getEntityIconBg(type: string): string {
    const map: Record<string, string> = { vendor: 'bg-cyan-50 border-cyan-100 text-cyan-600', driver: 'bg-amber-50 border-amber-100 text-amber-600', customer: 'bg-slate-100 border-slate-200 text-slate-600', platform: 'bg-purple-50 border-purple-100 text-purple-600', order: 'bg-blue-50 border-blue-100 text-blue-600' };
    return map[type] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  }

  getEntityBadgeClass(type: string): string {
    const map: Record<string, string> = { vendor: 'bg-cyan-50 text-cyan-700', driver: 'bg-amber-50 text-amber-700', customer: 'bg-slate-100 text-slate-700', platform: 'bg-purple-50 text-purple-700', order: 'bg-blue-50 text-blue-700' };
    return map[type] ?? 'bg-slate-100 text-slate-700';
  }

  getTypeBadgeClass(type: string): string {
    const map: Record<string, string> = {
      commission: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      payout: 'bg-amber-50 text-amber-700 border-amber-200',
      refund: 'bg-red-50 text-red-600 border-red-200',
      settlement: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      adjustment: 'bg-purple-50 text-purple-700 border-purple-200',
      service_fee: 'bg-blue-50 text-blue-700 border-blue-200',
      delivery_fee: 'bg-sky-50 text-sky-700 border-sky-200',
      vat: 'bg-slate-100 text-slate-600 border-slate-200',
      bonus: 'bg-green-50 text-green-700 border-green-200',
      penalty: 'bg-orange-50 text-orange-700 border-orange-200',
      cod_collection: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    };
    return map[type] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  }
}
