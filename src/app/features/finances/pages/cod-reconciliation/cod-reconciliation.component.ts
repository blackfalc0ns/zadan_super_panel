import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { CodFilter, CodRecord, CodReconciliationSummary } from '../../models/finance.models';
import { FinanceStatusBadgeComponent } from '../../components/finance-status-badge/finance-status-badge.component';
import { getFinanceLocale } from '../../utils/finance-i18n.utils';

@Component({
  selector: 'app-cod-reconciliation',
  standalone: true,
  imports: [CommonModule, TranslateModule, FinanceStatusBadgeComponent],
  template: `
    <div class="flex flex-col gap-5 animate-in fade-in duration-700">

      <div *ngIf="hasScope"
           class="bg-cyan-50 border border-cyan-200 rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center bg-white border border-cyan-100 text-cyan-700">
            <span class="material-symbols-outlined text-[18px]">
              {{ scopedOrderId ? 'receipt_long' : scopedEntityType === 'vendor' ? 'store' : 'local_shipping' }}
            </span>
          </div>
          <div>
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {{ scopedOrderId ? ('FINANCES.ENTITIES.ORDER' | translate) : (scopedEntityType === 'vendor' ? ('FINANCES.ENTITIES.VENDOR' | translate) : ('FINANCES.ENTITIES.DRIVER' | translate)) }}
            </p>
            <p class="text-sm font-black text-slate-800">{{ scopeTitle }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="openScopedProfile()"
            class="h-9 px-4 rounded-xl border border-slate-200 bg-white text-[10px] font-black text-slate-700 hover:bg-slate-100 transition-all">
            {{ 'FINANCES.COMMON.VIEW' | translate }}
          </button>
          <button
            (click)="clearScope()"
            class="h-9 px-4 rounded-xl bg-slate-900 text-[10px] font-black text-white hover:bg-slate-700 transition-all">
            {{ 'FINANCES.FILTERS.CLEAR' | translate }}
          </button>
        </div>
      </div>

      <div *ngIf="summary" class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-2xl border border-slate-200/70 px-5 py-4 shadow-sm">
          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'FINANCES.COD.SUMMARY.EXPECTED' | translate }}</p>
          <p class="text-xl font-black text-slate-800 tabular-nums">{{ formatNumber(summary.totalExpected) }} <span class="text-sm font-bold text-slate-400">SAR</span></p>
        </div>
        <div class="bg-white rounded-2xl border border-emerald-200 px-5 py-4 shadow-sm">
          <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">{{ 'FINANCES.COD.SUMMARY.COLLECTED' | translate }}</p>
          <p class="text-xl font-black text-emerald-700 tabular-nums">{{ formatNumber(summary.totalCollected) }} <span class="text-sm font-bold text-emerald-400">SAR</span></p>
        </div>
        <div class="bg-white rounded-2xl border px-5 py-4 shadow-sm"
             [ngClass]="summary.totalDelta < 0 ? 'border-red-200' : 'border-slate-200'">
          <p class="text-[9px] font-black uppercase tracking-widest mb-1"
             [ngClass]="summary.totalDelta < 0 ? 'text-red-500' : 'text-slate-400'">{{ 'FINANCES.COD.SUMMARY.DELTA' | translate }}</p>
          <p class="text-xl font-black tabular-nums"
             [ngClass]="summary.totalDelta < 0 ? 'text-red-700' : 'text-emerald-700'">
            {{ formatNumber(summary.totalDelta) }} <span class="text-sm font-bold">SAR</span>
          </p>
        </div>
        <div class="bg-white rounded-2xl border border-red-200 px-5 py-4 shadow-sm">
          <p class="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">{{ 'FINANCES.COD.SUMMARY.OVERDUE' | translate }}</p>
          <p class="text-xl font-black text-red-700">{{ formatNumber(summary.overdueCases) }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-amber-200 px-5 py-4 shadow-sm">
          <p class="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">{{ 'FINANCES.COD.SUMMARY.PENDING' | translate }}</p>
          <p class="text-xl font-black text-amber-700">{{ formatNumber(summary.pendingCases) }}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden extraordinary-table-container">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-sm font-black text-slate-800">{{ 'FINANCES.COD.TITLE' | translate }}</h3>
          <button class="h-8 px-3 text-[10px] font-black text-white bg-zadna-primary rounded-xl shadow-sm hover:bg-zadna-primaryDark transition-all">
            {{ 'FINANCES.COD.RECONCILE_ALL' | translate }}
          </button>
        </div>

        <table class="w-full">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-100">
              <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COD.TABLE.ORDER' | translate }}</th>
              <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COD.TABLE.DRIVER' | translate }}</th>
              <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COD.TABLE.VENDOR' | translate }}</th>
              <th class="px-6 py-4 text-end text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COD.TABLE.EXPECTED' | translate }}</th>
              <th class="px-6 py-4 text-end text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COD.TABLE.COLLECTED' | translate }}</th>
              <th class="px-6 py-4 text-end text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COD.TABLE.DELTA' | translate }}</th>
              <th class="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.STATUS' | translate }}</th>
              <th class="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.ACTIONS' | translate }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr *ngFor="let rec of records; trackBy: trackById"
                class="group hover:bg-slate-50/60 transition-all duration-200 table-row-object">

              <td class="px-6 py-4">
                <span class="text-xs font-black text-slate-700 font-mono">{{ rec.orderRef }}</span>
              </td>

              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-[13px] text-amber-500">local_shipping</span>
                  </div>
                  <span class="text-xs font-bold text-slate-700">{{ rec.driverName | translate }}</span>
                </div>
              </td>

              <td class="px-6 py-4">
                <span class="text-xs font-medium text-slate-500">{{ rec.vendorName | translate }}</span>
              </td>

              <td class="px-6 py-4 text-end">
                <span class="text-xs font-bold text-slate-600 tabular-nums">{{ formatNumber(rec.expectedAmount) }} SAR</span>
              </td>

              <td class="px-6 py-4 text-end">
                <span class="text-xs font-bold tabular-nums"
                      [ngClass]="rec.collectedAmount > 0 ? 'text-emerald-600' : 'text-slate-400'">
                  {{ formatNumber(rec.collectedAmount) }} SAR
                </span>
              </td>

              <td class="px-6 py-4 text-end">
                <span class="text-xs font-black tabular-nums"
                      [ngClass]="rec.delta < 0 ? 'text-red-600' : rec.delta === 0 ? 'text-emerald-600' : 'text-slate-600'">
                  {{ rec.delta === 0 ? ('FINANCES.COD.MATCHED' | translate) : formatNumber(rec.delta) + ' SAR' }}
                </span>
              </td>

              <td class="px-6 py-4">
                <div class="flex justify-center">
                  <app-finance-status-badge [status]="rec.status"></app-finance-status-badge>
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="flex justify-center">
                  <button *ngIf="rec.status === 'overdue' || rec.status === 'pending'"
                          class="h-7 px-2.5 text-[9px] font-black text-white bg-zadna-primary rounded-lg hover:bg-zadna-primaryDark transition-all">
                    {{ 'FINANCES.COD.RECONCILE' | translate }}
                  </button>
                  <span *ngIf="rec.status === 'collected'" class="text-[10px] font-black text-emerald-600">{{ 'FINANCES.COD.DONE' | translate }}</span>
                </div>
              </td>

            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class CodReconciliationComponent implements OnInit {
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

    const commands = this.scopedEntityType === 'vendor'
      ? ['/vendors', this.scopedEntityId]
      : ['/drivers', this.scopedEntityId];

    this.router.navigate(commands, {
      queryParams: { tab: 'finance' }
    });
  }

  formatNumber(value: number): string {
    return value.toLocaleString(getFinanceLocale(this.translate.currentLang), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }
}
