import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { RefundCase, RefundStatus } from '../../models/finance.models';
import { MoneyBadgeComponent } from '../../components/money-badge/money-badge.component';
import { FinanceStatusBadgeComponent } from '../../components/finance-status-badge/finance-status-badge.component';
import { FINANCE_ENTITY_LABEL_KEYS, getFinanceLocale } from '../../utils/finance-i18n.utils';
import { buildFinanceScopedProfileNavigation } from '../../utils/finance-profile-navigation.utils';

@Component({
  selector: 'app-refunds-disputes',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MoneyBadgeComponent, FinanceStatusBadgeComponent],
  template: `
    <div *ngIf="selectedCase"
         class="fixed inset-0 z-[90]"
         (click)="selectedCase = null">
      <div class="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"></div>
      <div class="absolute inset-y-0 ltr:right-0 rtl:left-0 w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
           (click)="$event.stopPropagation()">

        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-black text-slate-800">{{ selectedCase.caseRef }}</h3>
            <app-finance-status-badge [status]="selectedCase.status" class="mt-1"></app-finance-status-badge>
          </div>
          <button (click)="selectedCase = null" class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <span class="material-symbols-outlined text-[16px] text-slate-500">close</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-5 space-y-4">
          <div class="p-4 rounded-xl bg-red-50 border border-red-100">
            <p class="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">{{ 'FINANCES.REFUNDS.DETAIL.FINANCIAL_IMPACT' | translate }}</p>
            <p class="text-2xl font-black text-red-700 tabular-nums">{{ formatNumber(selectedCase.requestedAmount) }} <span class="text-sm">SAR</span></p>
            <p class="text-[10px] font-bold text-red-400 mt-1">{{ 'FINANCES.REFUNDS.DETAIL.RESPONSIBLE' | translate }}: {{ getResponsibleLabelKey(selectedCase.responsibleParty) | translate }}</p>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.REFUNDS.DETAIL.CUSTOMER' | translate }}</span>
              <span class="font-bold text-slate-700">{{ selectedCase.customerName | translate }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.REFUNDS.DETAIL.VENDOR' | translate }}</span>
              <span class="font-bold text-slate-700">{{ selectedCase.vendorName | translate }}</span>
            </div>
            <div *ngIf="selectedCase.driverName" class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.ENTITIES.DRIVER' | translate }}</span>
              <span class="font-bold text-slate-700">{{ selectedCase.driverName | translate }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.REFUNDS.DETAIL.ORDER' | translate }}</span>
              <span class="font-black text-zadna-primary font-mono">{{ selectedCase.orderRef }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.REFUNDS.DETAIL.REASON' | translate }}</span>
              <span class="font-bold text-slate-700 text-end max-w-[60%]">{{ selectedCase.reason | translate }}</span>
            </div>
            <div class="flex justify-between py-1.5">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.REFUNDS.DETAIL.CREATED' | translate }}</span>
              <span class="font-bold text-slate-700">{{ formatDate(selectedCase.createdAt) }}</span>
            </div>
          </div>

          <div>
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{{ 'FINANCES.REFUNDS.DETAIL.TIMELINE' | translate }}</p>
            <div class="space-y-2">
              <div *ngFor="let event of selectedCase.timeline; let last = last"
                   class="flex gap-3">
                <div class="flex flex-col items-center">
                  <div class="w-2.5 h-2.5 rounded-full border-2 border-zadna-primary bg-white shrink-0 mt-0.5"></div>
                  <div *ngIf="!last" class="w-0.5 flex-1 bg-slate-200 mt-1"></div>
                </div>
                <div class="pb-3">
                  <app-finance-status-badge [status]="event.status" class="mb-1"></app-finance-status-badge>
                  <p *ngIf="event.note" class="text-[10px] font-medium text-slate-500 mt-1">{{ event.note | translate }}</p>
                  <p class="text-[9px] font-bold text-slate-400 mt-0.5">{{ formatDate(event.timestamp) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="selectedCase.status !== 'approved' && selectedCase.status !== 'rejected'">
            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{{ 'FINANCES.REFUNDS.DETAIL.ADMIN_NOTE' | translate }}</label>
            <textarea [(ngModel)]="actionNote"
                      rows="2"
                      [placeholder]="'FINANCES.REFUNDS.DETAIL.ADMIN_NOTE_PLACEHOLDER' | translate"
                      class="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none resize-none">
            </textarea>
          </div>

          <div *ngIf="selectedCase.status === 'open' || selectedCase.status === 'under_review'"
               class="grid grid-cols-3 gap-2 pt-1">
            <button (click)="takeAction('approved')"
                    class="h-9 text-[10px] font-black text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-all shadow-sm flex items-center justify-center gap-1">
              <span class="material-symbols-outlined text-[13px]">check</span>
              {{ 'FINANCES.ACTIONS.APPROVE' | translate }}
            </button>
            <button (click)="takeAction('rejected')"
                    class="h-9 text-[10px] font-black text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all shadow-sm flex items-center justify-center gap-1">
              <span class="material-symbols-outlined text-[13px]">close</span>
              {{ 'FINANCES.ACTIONS.REJECT' | translate }}
            </button>
            <button (click)="takeAction('escalated')"
                    class="h-9 text-[10px] font-black text-orange-700 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-all flex items-center justify-center gap-1">
              <span class="material-symbols-outlined text-[13px]">escalator_warning</span>
              {{ 'FINANCES.ACTIONS.ESCALATE' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-5 animate-in fade-in duration-700">

      <div class="flex items-center gap-2 flex-wrap">
        <button *ngFor="let sf of statusFilters"
                (click)="setStatusFilter(sf.value)"
                class="px-4 py-1.5 rounded-full text-[10px] font-black border transition-all duration-200"
                [ngClass]="activeStatusFilter === sf.value
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'">
          {{ sf.labelKey | translate }}
          <span *ngIf="sf.count !== undefined" class="ms-1 opacity-70">({{ sf.count }})</span>
        </button>
      </div>

      <div *ngIf="hasScope && scopedEntityName"
           class="bg-cyan-50 border border-cyan-200 rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center"
               [ngClass]="scopedOrderId
                 ? 'bg-blue-50 text-blue-600'
                 : scopedEntityType === 'vendor'
                   ? 'bg-zadna-primary/10 text-zadna-primary'
                   : 'bg-amber-50 text-amber-600'">
            <span class="material-symbols-outlined text-[18px]">
              {{ scopedOrderId ? 'receipt_long' : scopedEntityType === 'vendor' ? 'store' : 'local_shipping' }}
            </span>
          </div>
          <div>
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {{ 'FINANCES.ACTIONS.VIEW_REFUNDS' | translate }}
            </p>
            <p class="text-sm font-black text-slate-800">{{ scopedEntityName | translate }}</p>
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

      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div *ngFor="let stat of impactStats"
             class="bg-white rounded-2xl border px-4 py-3 shadow-sm"
             [ngClass]="stat.borderColor">
          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ stat.labelKey | translate }}</p>
          <p class="text-lg font-black" [ngClass]="stat.color">{{ stat.value }}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden extraordinary-table-container">
          <table class="w-full">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-100">
                <th class="px-5 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.REFUNDS.TABLE.CASE' | translate }}</th>
                <th class="px-5 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.REFUNDS.TABLE.CUSTOMER_VENDOR' | translate }}</th>
                <th class="px-5 py-4 text-end text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.REFUNDS.TABLE.REQUESTED' | translate }}</th>
                <th class="px-5 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.REFUNDS.TABLE.RESPONSIBLE' | translate }}</th>
                <th class="px-5 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.STATUS' | translate }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let c of filteredCases; trackBy: trackById"
                  class="group hover:bg-slate-50/60 transition-all duration-200 table-row-object cursor-pointer"
                  [ngClass]="selectedCase?.id === c.id ? 'bg-zadna-primary/5 border-e-2 border-zadna-primary' : ''"
                  (click)="selectCase(c)">

                <td class="px-5 py-4">
                  <div>
                    <span class="text-[10px] font-black text-slate-700 font-mono">{{ c.caseRef }}</span>
                    <p class="text-[9px] font-medium text-slate-400 mt-0.5">{{ c.orderRef }}</p>
                  </div>
                </td>

                <td class="px-5 py-4">
                  <div>
                    <p class="text-xs font-bold text-slate-800">{{ c.customerName | translate }}</p>
                    <p class="text-[10px] font-medium text-slate-400">{{ c.vendorName | translate }}</p>
                    <p *ngIf="c.driverName" class="text-[10px] font-medium text-amber-600">{{ c.driverName | translate }}</p>
                  </div>
                </td>

                <td class="px-5 py-4 text-end">
                  <app-money-badge [amount]="c.requestedAmount" [direction]="'debit'" currency="SAR" size="sm"></app-money-badge>
                </td>

                <td class="px-5 py-4">
                  <div class="flex justify-center">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-black border"
                          [ngClass]="getResponsibleClass(c.responsibleParty)">
                      {{ getResponsibleLabelKey(c.responsibleParty) | translate }}
                    </span>
                  </div>
                </td>

                <td class="px-5 py-4">
                  <div class="flex justify-center">
                    <app-finance-status-badge [status]="c.status"></app-finance-status-badge>
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
      </div>
    </div>
  `
})
export class RefundsDisputesComponent implements OnInit {
  private financeService = inject(FinanceService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  allCases: RefundCase[] = [];
  selectedCase: RefundCase | null = null;
  activeStatusFilter: RefundStatus | 'all' = 'all';
  actionNote = '';
  scopedEntityType: 'vendor' | 'driver' | null = null;
  scopedEntityId: string | null = null;
  scopedOrderId: string | null = null;

  get filteredCases(): RefundCase[] {
    const cases = this.scopedCases;
    if (this.activeStatusFilter === 'all') return cases;
    return cases.filter(c => c.status === this.activeStatusFilter);
  }

  get scopedCases(): RefundCase[] {
    if (!this.hasScope) return this.allCases;
    return this.allCases.filter(c => this.caseMatchesScope(c));
  }

  get hasScope(): boolean {
    return (!!this.scopedEntityType && !!this.scopedEntityId) || !!this.scopedOrderId;
  }

  get scopedEntityName(): string | null {
    if (!this.hasScope) return null;
    if (this.scopedOrderId) {
      const orderCase = this.allCases.find(c => c.orderId === this.scopedOrderId);
      return orderCase?.orderRef ?? this.scopedOrderId;
    }
    const entity = this.allCases.find(c => this.caseMatchesScope(c));
    if (!entity) return null;
    return this.scopedEntityType === 'vendor' ? entity.vendorName : (entity.driverName ?? null);
  }

  get statusFilters() {
    return [
      { labelKey: 'FINANCES.REFUNDS.FILTERS.ALL', value: 'all' as const, count: this.scopedCases.length },
      { labelKey: 'FINANCES.STATUS.OPEN', value: 'open' as RefundStatus, count: this.scopedCases.filter(c => c.status === 'open').length },
      { labelKey: 'FINANCES.STATUS.UNDER_REVIEW', value: 'under_review' as RefundStatus, count: this.scopedCases.filter(c => c.status === 'under_review').length },
      { labelKey: 'FINANCES.STATUS.ESCALATED', value: 'escalated' as RefundStatus, count: this.scopedCases.filter(c => c.status === 'escalated').length },
      { labelKey: 'FINANCES.STATUS.APPROVED', value: 'approved' as RefundStatus, count: this.scopedCases.filter(c => c.status === 'approved').length },
      { labelKey: 'FINANCES.STATUS.REJECTED', value: 'rejected' as RefundStatus, count: this.scopedCases.filter(c => c.status === 'rejected').length }
    ];
  }

  get impactStats() {
    const scoped = this.scopedCases;
    const open = scoped.filter(c => ['open', 'under_review', 'escalated'].includes(c.status));
    const totalExposure = open.reduce((sum, item) => sum + item.requestedAmount, 0);
    const approved = scoped.filter(c => c.status === 'approved').reduce((sum, item) => sum + (item.approvedAmount ?? 0), 0);

    return [
      { labelKey: 'FINANCES.REFUNDS.SUMMARY.OPEN_CASES', value: this.formatNumber(open.length), color: 'text-amber-600', borderColor: 'border-amber-200' },
      { labelKey: 'FINANCES.REFUNDS.SUMMARY.TOTAL_EXPOSURE', value: `${this.formatNumber(totalExposure)} SAR`, color: 'text-red-600', borderColor: 'border-red-200' },
      { labelKey: 'FINANCES.REFUNDS.SUMMARY.APPROVED', value: `${this.formatNumber(approved)} SAR`, color: 'text-emerald-600', borderColor: 'border-emerald-200' },
      { labelKey: 'FINANCES.REFUNDS.SUMMARY.ESCALATED', value: this.formatNumber(scoped.filter(c => c.status === 'escalated').length), color: 'text-orange-600', borderColor: 'border-orange-200' },
      { labelKey: 'FINANCES.REFUNDS.SUMMARY.TOTAL_CASES', value: this.formatNumber(scoped.length), color: 'text-slate-700', borderColor: 'border-slate-200' }
    ];
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const entityType = params.get('entityType');
      this.scopedEntityType = entityType === 'vendor' || entityType === 'driver' ? entityType : null;
      this.scopedEntityId = params.get('entityId');
      this.scopedOrderId = params.get('orderId');

      if (this.selectedCase && !this.caseMatchesScope(this.selectedCase)) {
        this.selectedCase = null;
      }
    });

    this.financeService.getRefundCases().pipe(take(1)).subscribe(cases => {
      this.allCases = cases;
    });
  }

  selectCase(c: RefundCase): void { this.selectedCase = c; this.actionNote = ''; }
  setStatusFilter(status: RefundStatus | 'all'): void { this.activeStatusFilter = status; }

  clearScope(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { entityType: null, entityId: null, orderId: null },
      queryParamsHandling: 'merge'
    });
  }

  openScopedProfile(): void {
    if (!this.hasScope) return;

    if (this.scopedOrderId) {
      this.router.navigate(['/orders', this.scopedOrderId]);
      return;
    }

    if (!this.scopedEntityId || !this.scopedEntityType) return;

    const navigation = buildFinanceScopedProfileNavigation(this.scopedEntityType, this.scopedEntityId);

    this.router.navigate(navigation.commands, navigation.extras);
  }

  takeAction(action: RefundStatus): void {
    if (!this.selectedCase) return;
    this.financeService.updateRefundStatus(this.selectedCase.id, action, this.actionNote).pipe(take(1)).subscribe(() => {
      if (this.selectedCase) {
        this.selectedCase = { ...this.selectedCase, status: action };
        const idx = this.allCases.findIndex(c => c.id === this.selectedCase!.id);
        if (idx >= 0) this.allCases[idx] = { ...this.selectedCase };
        this.allCases = [...this.allCases];
      }
      this.actionNote = '';
    });
  }

  getResponsibleLabelKey(party: string): string {
    return FINANCE_ENTITY_LABEL_KEYS[party] ?? party;
  }

  getResponsibleClass(party: string): string {
    const map: Record<string, string> = {
      vendor: 'bg-zadna-primary/10 text-zadna-primary border-zadna-primary/20',
      driver: 'bg-amber-50 text-amber-700 border-amber-200',
      customer: 'bg-slate-100 text-slate-600 border-slate-200',
      platform: 'bg-red-50 text-red-600 border-red-200'
    };
    return map[party] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  }

  trackById(_: number, c: RefundCase): string { return c.id; }

  private caseMatchesScope(c: RefundCase): boolean {
    if (!this.hasScope) return true;
    if (this.scopedOrderId) return c.orderId === this.scopedOrderId;
    if (!this.scopedEntityId || !this.scopedEntityType) return true;
    return this.scopedEntityType === 'vendor'
      ? c.vendorId === this.scopedEntityId
      : c.driverId === this.scopedEntityId;
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
}
