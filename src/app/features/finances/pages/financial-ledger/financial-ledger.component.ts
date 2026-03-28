import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { KeyValueGridComponent } from '../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import type { KeyValueGridItem } from '../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import {
  FINANCE_DIRECTION_LABEL_KEYS,
  FINANCE_ENTITY_LABEL_KEYS,
  FINANCE_LEDGER_TYPE_LABEL_KEYS,
  getFinanceLocale
} from '../../utils/finance-i18n.utils';

@Component({
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
    SectionHeaderComponent,
    InlineBannerComponent,
    KeyValueGridComponent
  ],
  template: `
    <div *ngIf="selectedEntry"
         class="fixed inset-0 z-[90]"
         (click)="selectedEntry = null">
      <div class="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"></div>
      <div class="absolute inset-y-0 ltr:right-0 rtl:left-0 w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
           (click)="$event.stopPropagation()">

        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-black text-slate-800">{{ 'FINANCES.LEDGER.ENTRY_TITLE' | translate }}</h3>
            <p class="text-[10px] font-bold text-slate-400 tabular-nums">{{ selectedEntry.referenceId }}</p>
          </div>
          <app-button variant="ghost" size="xs" customClass="!w-8 !h-8 !px-0 !rounded-xl !bg-slate-100 hover:!bg-slate-200" (btnClick)="selectedEntry = null">
            <span class="material-symbols-outlined text-[18px] text-slate-500">close</span>
          </app-button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <div class="p-5 rounded-2xl text-center"
               [ngClass]="selectedEntry.direction === 'credit' ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'">
            <p class="text-[10px] font-black uppercase tracking-widest mb-2"
               [ngClass]="selectedEntry.direction === 'credit' ? 'text-emerald-500' : 'text-red-500'">
              {{ getDirectionLabelKey(selectedEntry.direction) | translate }}
            </p>
            <p class="text-3xl font-black tabular-nums"
               [ngClass]="selectedEntry.direction === 'credit' ? 'text-emerald-700' : 'text-red-700'">
              {{ selectedEntry.direction === 'credit' ? '+' : '-' }}{{ formatNumber(selectedEntry.amount) }}
              <span class="text-lg font-bold">{{ selectedEntry.currency }}</span>
            </p>
          </div>

          <div class="space-y-3">
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.ENTITY' | translate }}</span>
              <span class="text-xs font-bold text-slate-700">{{ selectedEntry.entityName | translate }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.TYPE' | translate }}</span>
              <span class="text-xs font-bold text-slate-700">{{ getTypeLabelKey(selectedEntry.type) | translate }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.REFERENCE' | translate }}</span>
              <span class="text-xs font-black text-slate-700 font-mono">{{ selectedEntry.referenceId }}</span>
            </div>
            <div *ngIf="selectedEntry.orderId" class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.LEDGER.ORDER_ID' | translate }}</span>
              <span class="text-xs font-black text-zadna-primary font-mono">{{ selectedEntry.orderId }}</span>
            </div>
            <div *ngIf="selectedEntry.settlementId" class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.LEDGER.SETTLEMENT' | translate }}</span>
              <span class="text-xs font-black text-zadna-primary font-mono">{{ selectedEntry.settlementId }}</span>
            </div>
            <div *ngIf="selectedEntry.balanceAfter !== undefined" class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.LEDGER.BALANCE_AFTER' | translate }}</span>
              <span class="text-xs font-bold text-slate-700 tabular-nums">{{ formatNumber(selectedEntry.balanceAfter) }} SAR</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.TIMESTAMP' | translate }}</span>
              <span class="text-xs font-bold text-slate-700">{{ formatDate(selectedEntry.timestamp) }} {{ formatTime(selectedEntry.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-5 animate-in fade-in duration-700">

      <app-finance-filter-bar
        [showEntityType]="true"
        [showLedgerType]="true"
        [showDirection]="true"
        [showExport]="true"
        (filterChange)="onFilterChange($event)"
        (export)="onExport()">
      </app-finance-filter-bar>

      <app-inline-banner
        *ngIf="hasScope"
        [title]="scopedOrderId ? 'FINANCES.ENTITIES.ORDER' : getEntityLabelKey(scopedEntityType || 'platform')"
        [message]="scopeTitle"
        [shouldTranslate]="false"
        [icon]="scopedOrderId ? 'receipt_long' : scopedEntityType === 'vendor' ? 'store' : 'local_shipping'"
        variant="info">
        <div actions class="flex items-center gap-2">
          <app-button
            variant="outline"
            size="sm"
            customClass="!rounded-xl !bg-white"
            (btnClick)="openScopedProfile()">
            {{ 'FINANCES.COMMON.VIEW' | translate }}
          </app-button>
          <app-button
            variant="ghost"
            size="sm"
            customClass="!rounded-xl !bg-slate-900 !text-white hover:!bg-slate-700"
            (btnClick)="clearScope()">
            {{ 'FINANCES.FILTERS.CLEAR' | translate }}
          </app-button>
        </div>
      </app-inline-banner>

      <app-card variant="default" rounded="xl" padding="sm" customClass="border-slate-200/70 shadow-sm">
        <app-key-value-grid [items]="summaryItems" [columns]="4" [bordered]="true"></app-key-value-grid>
      </app-card>

      <app-card variant="default" rounded="2xl" padding="none" customClass="border-slate-200/70 shadow-sm overflow-hidden extraordinary-table-container">
        <div class="px-6 py-4 border-b border-slate-100">
          <app-section-header
            [compact]="true"
            icon="receipt_long"
            title="FINANCES.LEDGER.TITLE">
          </app-section-header>
        </div>
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-100">
              <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.TIMESTAMP' | translate }}</th>
              <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.ENTITY' | translate }}</th>
              <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.TYPE' | translate }}</th>
              <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.REFERENCE' | translate }}</th>
              <th class="px-6 py-4 text-end text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.AMOUNT' | translate }}</th>
              <th class="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.DIRECTION' | translate }}</th>
              <th class="px-6 py-4 text-end text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.LEDGER.BALANCE_AFTER' | translate }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr *ngFor="let entry of pagedEntries; trackBy: trackById"
                class="group hover:bg-slate-50/60 transition-all duration-200 table-row-object cursor-pointer"
                [class.opacity-50]="isLoading"
                (click)="openEntryDetail(entry)">

              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-slate-700 tabular-nums">{{ formatDate(entry.timestamp) }}</span>
                  <span class="text-[9px] font-medium text-slate-400 tabular-nums">{{ formatTime(entry.timestamp) }}</span>
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                       [ngClass]="getEntityIconBg(entry.entityType)">
                    <span class="material-symbols-outlined text-[14px]"
                          [ngClass]="getEntityIconColor(entry.entityType)">
                      {{ getEntityIcon(entry.entityType) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-xs font-bold text-slate-800">{{ entry.entityName | translate }}</p>
                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{{ getEntityLabelKey(entry.entityType) | translate }}</p>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4">
                <span class="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black border"
                      [ngClass]="getTypeBadgeClass(entry.type)">
                  {{ getTypeLabelKey(entry.type) | translate }}
                </span>
              </td>

              <td class="px-6 py-4">
                <span class="text-xs font-black text-slate-600 font-mono">{{ entry.referenceId }}</span>
              </td>

              <td class="px-6 py-4 text-end">
                <app-money-badge
                  [amount]="entry.amount"
                  [direction]="entry.direction"
                  [showDirection]="true"
                  [currency]="entry.currency"
                  size="sm">
                </app-money-badge>
              </td>

              <td class="px-6 py-4">
                <div class="flex justify-center">
                  <span class="w-7 h-7 rounded-full flex items-center justify-center"
                        [ngClass]="entry.direction === 'credit' ? 'bg-emerald-50' : 'bg-red-50'">
                    <span class="material-symbols-outlined text-[14px]"
                          [ngClass]="entry.direction === 'credit' ? 'text-emerald-500' : 'text-red-500'">
                      {{ entry.direction === 'credit' ? 'add' : 'remove' }}
                    </span>
                  </span>
                </div>
              </td>

              <td class="px-6 py-4 text-end">
                <span *ngIf="entry.balanceAfter !== undefined" class="text-xs font-bold text-slate-600 tabular-nums">
                  {{ formatNumber(entry.balanceAfter) }} SAR
                </span>
                <span *ngIf="entry.balanceAfter === undefined" class="text-[10px] text-slate-300">&mdash;</span>
              </td>

            </tr>
          </tbody>
        </table>

        <div *ngIf="!isLoading && filteredEntries.length === 0"
             class="flex flex-col items-center justify-center py-16 text-center">
          <span class="material-symbols-outlined text-5xl text-slate-200 mb-3">receipt_long</span>
          <p class="text-sm font-black text-slate-400">{{ 'FINANCES.LEDGER.EMPTY.TITLE' | translate }}</p>
          <p class="text-[11px] text-slate-300 mt-1">{{ 'FINANCES.LEDGER.EMPTY.MESSAGE' | translate }}</p>
        </div>
      </app-card>

      <div *ngIf="filteredEntries.length > 0" class="pt-4 animate-in fade-in duration-300">
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
  private financeService = inject(FinanceService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  allEntries: LedgerEntry[] = [];
  filteredEntries: LedgerEntry[] = [];
  selectedEntry: LedgerEntry | null = null;
  isLoading = false;
  page = 1;
  pageSize = 10;
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
      { labelKey: 'FINANCES.LEDGER.SUMMARY.TOTAL_ENTRIES', value: this.formatNumber(this.filteredEntries.length), color: 'text-slate-800' },
      { labelKey: 'FINANCES.LEDGER.SUMMARY.TOTAL_CREDITS', value: `+${this.formatNumber(credits)} SAR`, color: 'text-emerald-600' },
      { labelKey: 'FINANCES.LEDGER.SUMMARY.TOTAL_DEBITS', value: `-${this.formatNumber(debits)} SAR`, color: 'text-red-600' },
      { labelKey: 'FINANCES.LEDGER.SUMMARY.NET_FLOW', value: `${this.formatNumber(credits - debits)} SAR`, color: (credits - debits) >= 0 ? 'text-emerald-600' : 'text-red-600' }
    ];
  }

  get summaryItems(): KeyValueGridItem[] {
    return this.summaryStats.map((stat): KeyValueGridItem => ({
      label: stat.labelKey,
      value: stat.value,
      translateValue: false,
      valueTone: stat.color.includes('emerald')
        ? 'accent'
        : stat.color.includes('red')
          ? 'danger'
          : 'default'
    }));
  }

  get pagedEntries(): LedgerEntry[] {
    const startIndex = (this.page - 1) * this.pageSize;
    return this.filteredEntries.slice(startIndex, startIndex + this.pageSize);
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
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
    this.currentFilter = filter;
    this.financeService.getLedgerEntries({
      ...filter,
      entityType: this.scopedEntityType ?? filter.entityType,
      entityId: this.scopedEntityId ?? filter.entityId,
      orderId: this.scopedOrderId ?? filter.orderId
    }).pipe(take(1)).subscribe(entries => {
      this.allEntries = entries;
      this.filteredEntries = entries;
      this.page = 1;
    });
  }

  onFilterChange(filter: LedgerFilter): void {
    this.loadData(filter);
  }

  onExport(): void { console.log('Export ledger'); }
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

    const commands = this.scopedEntityType === 'vendor'
      ? ['/vendors', this.scopedEntityId]
      : ['/drivers', this.scopedEntityId];

    this.router.navigate(commands, {
      queryParams: { tab: 'finance' }
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

  getTypeLabelKey(type: string): string {
    return FINANCE_LEDGER_TYPE_LABEL_KEYS[type] ?? type;
  }

  getEntityLabelKey(type: string): string {
    return FINANCE_ENTITY_LABEL_KEYS[type] ?? type;
  }

  getDirectionLabelKey(direction: string): string {
    return FINANCE_DIRECTION_LABEL_KEYS[direction] ?? direction;
  }

  getEntityIcon(type: string): string {
    const map: Record<string, string> = { vendor: 'store', driver: 'local_shipping', customer: 'person', platform: 'hub', order: 'receipt' };
    return map[type] ?? 'circle';
  }

  getEntityIconBg(type: string): string {
    const map: Record<string, string> = { vendor: 'bg-zadna-primary/10', driver: 'bg-amber-50', customer: 'bg-slate-100', platform: 'bg-purple-50', order: 'bg-blue-50' };
    return map[type] ?? 'bg-slate-100';
  }

  getEntityIconColor(type: string): string {
    const map: Record<string, string> = { vendor: 'text-zadna-primary', driver: 'text-amber-500', customer: 'text-slate-500', platform: 'text-purple-500', order: 'text-blue-500' };
    return map[type] ?? 'text-slate-400';
  }

  getTypeBadgeClass(type: string): string {
    const map: Record<string, string> = {
      commission: 'bg-zadna-primary/10 text-zadna-primary border-zadna-primary/20',
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
