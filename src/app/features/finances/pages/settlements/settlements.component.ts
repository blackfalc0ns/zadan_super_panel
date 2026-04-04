import { Component, DestroyRef, OnInit, inject } from '@angular/core';
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
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { KeyValueGridComponent } from '../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import type { KeyValueGridItem } from '../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { getFinanceLocale } from '../../utils/finance-i18n.utils';
import { buildFinanceScopedProfileNavigation } from '../../utils/finance-profile-navigation.utils';

@Component({
  selector: 'app-settlements',
  standalone: true,
  imports: [CommonModule, TranslateModule, FinanceStatusBadgeComponent, AppCardComponent, AppButtonComponent, SectionHeaderComponent, InlineBannerComponent, KeyValueGridComponent],
  template: `
    <div *ngIf="selectedSettlement"
         class="fixed inset-0 z-[90]"
         (click)="selectedSettlement = null">
      <div class="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"></div>
      <div class="absolute inset-y-0 ltr:right-0 rtl:left-0 w-full max-w-sm bg-white h-full shadow-2xl flex flex-col"
           (click)="$event.stopPropagation()">

        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-black text-slate-800">{{ selectedSettlement.settlementCode }}</h3>
            <p class="text-[10px] font-bold text-slate-400">{{ selectedSettlement.entityName | translate }}</p>
          </div>
          <app-button variant="ghost" size="xs" customClass="!w-8 !h-8 !px-0 !rounded-xl !bg-slate-100 hover:!bg-slate-200" (btnClick)="selectedSettlement = null">
            <span class="material-symbols-outlined text-[18px] text-slate-500">close</span>
          </app-button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div class="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
            <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">{{ 'FINANCES.SETTLEMENTS.DRAWER.NET_PAYOUT' | translate }}</p>
            <p class="text-3xl font-black text-emerald-700 tabular-nums">{{ formatNumber(selectedSettlement.netAmount) }} <span class="text-lg">SAR</span></p>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.SETTLEMENTS.DRAWER.GROSS_AMOUNT' | translate }}</span>
              <span class="text-xs font-bold text-slate-700 tabular-nums">{{ formatNumber(selectedSettlement.grossAmount) }} SAR</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.SETTLEMENTS.DRAWER.DEDUCTIONS' | translate }}</span>
              <span class="text-xs font-bold text-red-500 tabular-nums">-{{ formatNumber(selectedSettlement.deductions) }} SAR</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.SETTLEMENTS.DRAWER.ORDERS' | translate }}</span>
              <span class="text-xs font-bold text-slate-700">{{ formatNumber(selectedSettlement.ordersCount) }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.SETTLEMENTS.DRAWER.PERIOD' | translate }}</span>
              <span class="text-xs font-bold text-slate-700">{{ selectedSettlement.period | translate }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.STATUS' | translate }}</span>
              <app-finance-status-badge [status]="selectedSettlement.status"></app-finance-status-badge>
            </div>
          </div>

          <div class="pt-2 space-y-2">
            <app-button *ngIf="selectedSettlement.status === 'pending'"
                    variant="primary"
                    size="sm"
                    customClass="!w-full !rounded-xl"
                    (btnClick)="processSettlement(selectedSettlement)">
              {{ 'FINANCES.SETTLEMENTS.PROCESS_SETTLEMENT' | translate }}
            </app-button>
            <app-button variant="ghost" size="sm" customClass="!w-full !rounded-xl !bg-slate-100 hover:!bg-slate-200">
              <span class="material-symbols-outlined text-[15px]">download</span>
              {{ 'FINANCES.SETTLEMENTS.DOWNLOAD_STATEMENT' | translate }}
            </app-button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-5 animate-in fade-in duration-700">

      <div class="flex items-center gap-1 bg-white rounded-2xl border border-slate-200 p-1 w-fit shadow-sm">
        <button
          (click)="activeTab = 'vendor'"
          class="px-5 py-2 rounded-xl text-[11px] font-black transition-all duration-200 flex items-center gap-2"
          [ngClass]="activeTab === 'vendor' ? 'bg-zadna-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'">
          <span class="material-symbols-outlined text-[15px]">store</span>
          {{ 'FINANCES.SETTLEMENTS.VENDORS' | translate }} <span class="opacity-70">({{ vendorSettlements.length }})</span>
        </button>
        <button
          (click)="activeTab = 'driver'"
          class="px-5 py-2 rounded-xl text-[11px] font-black transition-all duration-200 flex items-center gap-2"
          [ngClass]="activeTab === 'driver' ? 'bg-zadna-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'">
          <span class="material-symbols-outlined text-[15px]">local_shipping</span>
          {{ 'FINANCES.SETTLEMENTS.DRIVERS' | translate }} <span class="opacity-70">({{ driverSettlements.length }})</span>
        </button>
      </div>

      <app-inline-banner
        *ngIf="hasScope && scopedSettlement"
        [title]="scopedSettlement.entityType === 'vendor' ? 'FINANCES.SETTLEMENTS.VENDOR_LIST' : 'FINANCES.SETTLEMENTS.DRIVER_LIST'"
        [message]="scopedSettlement.entityName"
        [shouldTranslate]="false"
        [icon]="scopedSettlement.entityType === 'vendor' ? 'store' : 'local_shipping'"
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
        <app-key-value-grid [items]="activeStatItems" [columns]="4" [bordered]="true"></app-key-value-grid>
      </app-card>

      <app-card variant="default" rounded="2xl" padding="none" customClass="border-slate-200/70 shadow-sm overflow-hidden extraordinary-table-container">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <app-section-header
            [compact]="true"
            [icon]="activeTab === 'vendor' ? 'store' : 'local_shipping'"
            [title]="activeTab === 'vendor' ? 'FINANCES.SETTLEMENTS.VENDOR_LIST' : 'FINANCES.SETTLEMENTS.DRIVER_LIST'">
          </app-section-header>
          <div class="flex items-center gap-2">
            <app-button variant="ghost" size="xs" customClass="!rounded-xl !bg-slate-100 !text-slate-600 hover:!bg-slate-200">
              <span class="material-symbols-outlined text-[13px]">add</span>
              {{ 'FINANCES.SETTLEMENTS.NEW_SETTLEMENT' | translate }}
            </app-button>
          </div>
        </div>

        <table class="w-full">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-100">
              <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.SETTLEMENTS.TABLE.SETTLEMENT' | translate }}</th>
              <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.SETTLEMENTS.TABLE.ENTITY' | translate }}</th>
              <th class="px-6 py-4 text-start text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.SETTLEMENTS.TABLE.PERIOD' | translate }}</th>
              <th class="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.SETTLEMENTS.TABLE.ORDERS' | translate }}</th>
              <th class="px-6 py-4 text-end text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.SETTLEMENTS.TABLE.GROSS' | translate }}</th>
              <th class="px-6 py-4 text-end text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.SETTLEMENTS.TABLE.DEDUCTIONS' | translate }}</th>
              <th class="px-6 py-4 text-end text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.SETTLEMENTS.TABLE.NET_PAYOUT' | translate }}</th>
              <th class="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.STATUS' | translate }}</th>
              <th class="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'FINANCES.COMMON.ACTIONS' | translate }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr *ngFor="let s of activeSettlements; trackBy: trackById"
                class="group hover:bg-slate-50/60 transition-all duration-200 table-row-object cursor-pointer"
                (click)="openDetail(s)">

              <td class="px-6 py-4">
                <span class="text-xs font-black text-slate-700 font-mono">{{ s.settlementCode }}</span>
              </td>

              <td class="px-6 py-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                       [ngClass]="s.entityType === 'vendor' ? 'bg-zadna-primary/10' : 'bg-amber-50'">
                    <span class="material-symbols-outlined text-[14px]"
                          [ngClass]="s.entityType === 'vendor' ? 'text-zadna-primary' : 'text-amber-500'">
                      {{ s.entityType === 'vendor' ? 'store' : 'local_shipping' }}
                    </span>
                  </div>
                  <span class="text-xs font-bold text-slate-800">{{ s.entityName | translate }}</span>
                </div>
              </td>

              <td class="px-6 py-4">
                <div>
                  <p class="text-xs font-bold text-slate-700">{{ s.period | translate }}</p>
                  <p class="text-[9px] font-medium text-slate-400">{{ formatDate(s.periodFrom) }} - {{ formatDate(s.periodTo) }}</p>
                </div>
              </td>

              <td class="px-6 py-4 text-center">
                <span class="text-xs font-black text-slate-600 tabular-nums">{{ formatNumber(s.ordersCount) }}</span>
              </td>

              <td class="px-6 py-4 text-end">
                <span class="text-xs font-bold text-slate-600 tabular-nums">{{ formatNumber(s.grossAmount) }} SAR</span>
              </td>

              <td class="px-6 py-4 text-end">
                <span class="text-xs font-bold text-red-500 tabular-nums">-{{ formatNumber(s.deductions) }} SAR</span>
              </td>

              <td class="px-6 py-4 text-end">
                <span class="text-sm font-black text-emerald-700 tabular-nums">{{ formatNumber(s.netAmount) }} SAR</span>
              </td>

              <td class="px-6 py-4">
                <div class="flex justify-center">
                  <app-finance-status-badge [status]="s.status"></app-finance-status-badge>
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-1" (click)="$event.stopPropagation()">
                  <app-button *ngIf="s.status === 'pending'"
                          variant="primary"
                          size="xs"
                          customClass="!rounded-lg"
                          (btnClick)="processSettlement(s)">
                    {{ 'FINANCES.ACTIONS.PROCESS' | translate }}
                  </app-button>
                  <app-button
                    variant="ghost"
                    size="xs"
                    customClass="!w-7 !h-7 !px-0 !rounded-lg !bg-slate-100 hover:!bg-slate-200"
                    (btnClick)="openDetail(s)">
                    <span class="material-symbols-outlined text-[13px] text-slate-500">visibility</span>
                  </app-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </app-card>

    </div>
  `
})
export class SettlementsComponent implements OnInit {
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
      { labelKey: 'FINANCES.SETTLEMENTS.SUMMARY.TOTAL_SETTLEMENTS', value: this.formatNumber(data.length), color: 'text-slate-800' },
      { labelKey: 'FINANCES.SETTLEMENTS.SUMMARY.PAID', value: `${this.formatNumber(paid.length)} / ${this.formatNumber(paidNet)} SAR`, color: 'text-emerald-600' },
      { labelKey: 'FINANCES.SETTLEMENTS.SUMMARY.PENDING', value: this.formatNumber(pending.length), color: 'text-amber-600' },
      { labelKey: 'FINANCES.SETTLEMENTS.SUMMARY.TOTAL_NET', value: `${this.formatNumber(totalNet)} SAR`, color: 'text-zadna-primary' }
    ];
  }

  get activeStatItems(): KeyValueGridItem[] {
    return this.activeStats.map((stat): KeyValueGridItem => ({
      label: stat.labelKey,
      value: stat.value,
      translateValue: false,
      valueTone: stat.color.includes('emerald')
        ? 'accent'
        : stat.color.includes('amber')
          ? 'warning'
          : 'default'
    }));
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const entityType = params.get('entityType');
        this.scopedEntityId = params.get('entityId');
        if (entityType === 'vendor' || entityType === 'driver') {
          this.activeTab = entityType;
        }
      });

    this.financeService.getSettlements().pipe(take(1)).subscribe(data => {
      this.allSettlements = data;
    });
  }

  openDetail(s: Settlement): void { this.selectedSettlement = s; }
  processSettlement(s: Settlement): void {
    const paidAt = new Date().toISOString();
    this.allSettlements = this.allSettlements.map((settlement) =>
      settlement.id === s.id
        ? {
            ...settlement,
            status: 'paid',
            paidAt
          }
        : settlement
    );

    if (this.selectedSettlement?.id === s.id) {
      this.selectedSettlement = {
        ...this.selectedSettlement,
        status: 'paid',
        paidAt
      };
    }
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
}
