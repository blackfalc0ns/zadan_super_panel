import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { PricingRuleSet } from '../../models/finance.models';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { getFinanceLocale } from '../../utils/finance-i18n.utils';

@Component({
  selector: 'app-platform-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AppCardComponent, AppButtonComponent],
  template: `
    <div *ngIf="showConfirm"
         class="fixed inset-0 z-[90] flex items-center justify-center"
         (click)="showConfirm = false">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
           (click)="$event.stopPropagation()">
        <div class="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-amber-500 text-[24px]">warning</span>
        </div>
        <h3 class="text-base font-black text-slate-800 text-center mb-2">{{ 'FINANCES.PRICING.CONFIRM_TITLE' | translate }}</h3>
        <p class="text-xs font-medium text-slate-500 text-center mb-6">
          {{ 'FINANCES.PRICING.CONFIRM_MESSAGE' | translate }}
        </p>
        <div class="grid grid-cols-2 gap-3">
          <app-button variant="ghost" size="sm" customClass="!h-11 !rounded-xl !bg-slate-100 hover:!bg-slate-200" (btnClick)="showConfirm = false">
            {{ 'FINANCES.COMMON.CANCEL' | translate }}
          </app-button>
          <app-button variant="primary" size="sm" customClass="!h-11 !rounded-xl" (btnClick)="savePricing()">
            {{ 'FINANCES.PRICING.CONFIRM_UPDATE' | translate }}
          </app-button>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-5 animate-in fade-in duration-700">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-2xl">
          <span class="material-symbols-outlined text-amber-500 text-[18px]">warning</span>
          <p class="text-[10px] font-black text-amber-700">{{ 'FINANCES.PRICING.WARNING' | translate }}</p>
        </div>
        <div class="flex items-center gap-2">
          <app-button variant="outline" size="sm" customClass="!rounded-xl !bg-white" (btnClick)="loadData()">
            {{ 'FINANCES.PRICING.DISCARD_CHANGES' | translate }}
          </app-button>
          <app-button (btnClick)="confirmSave()"
                  variant="primary"
                  size="sm"
                  customClass="!rounded-xl"
                  [disabled]="!isDirty"
                  >
            <span class="material-symbols-outlined text-[14px]">save</span>
            {{ 'FINANCES.PRICING.SAVE_RULES' | translate }}
          </app-button>
        </div>
      </div>

      <!-- Pricing Cards Grid -->
      <div *ngIf="pricing" class="columns-1 md:columns-2 xl:columns-3 [column-gap:0.875rem]">

        <!-- Vendor Commission Card -->
        <app-card class="mb-3.5 block break-inside-avoid" variant="default" rounded="2xl" padding="none" customClass="border-slate-200/70 shadow-sm overflow-hidden">
          <div class="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-zadna-primary/10 flex items-center justify-center">
              <span class="material-symbols-outlined text-zadna-primary text-[17px]">percent</span>
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-800">{{ 'FINANCES.PRICING.VENDOR_COMMISSION.TITLE' | translate }}</h3>
              <p class="text-[9px] font-bold text-slate-400">{{ 'FINANCES.PRICING.VENDOR_COMMISSION.SUBTITLE' | translate }}</p>
            </div>
          </div>
          <div class="p-4 space-y-3.5">
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{{ 'FINANCES.PRICING.VENDOR_COMMISSION.DEFAULT_PERCENT' | translate }}</label>
                <input type="number" [(ngModel)]="pricing.vendorCommission.defaultPercent" (ngModelChange)="isDirty = true"
                       min="0" max="100" step="0.5"
                       class="w-full h-10 px-3 text-sm font-black bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all text-center tabular-nums"/>
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{{ 'FINANCES.PRICING.VENDOR_COMMISSION.MIN_PERCENT' | translate }}</label>
                <input type="number" [(ngModel)]="pricing.vendorCommission.minPercent" (ngModelChange)="isDirty = true"
                       min="0" max="100" step="0.5"
                       class="w-full h-10 px-3 text-sm font-black bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary outline-none transition-all text-center tabular-nums"/>
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{{ 'FINANCES.PRICING.VENDOR_COMMISSION.MAX_PERCENT' | translate }}</label>
                <input type="number" [(ngModel)]="pricing.vendorCommission.maxPercent" (ngModelChange)="isDirty = true"
                       min="0" max="100" step="0.5"
                       class="w-full h-10 px-3 text-sm font-black bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary outline-none transition-all text-center tabular-nums"/>
              </div>
            </div>
            <div class="flex items-center gap-3 py-2 border-t border-slate-100">
              <span class="text-xs font-bold text-slate-600 flex-1">{{ 'FINANCES.PRICING.VENDOR_COMMISSION.ALLOW_OVERRIDES' | translate }}</span>
              <button (click)="pricing!.vendorCommission.overrideAllowed = !pricing!.vendorCommission.overrideAllowed; isDirty = true"
                      class="relative w-10 h-5 rounded-full transition-all"
                      [ngClass]="pricing.vendorCommission.overrideAllowed ? 'bg-zadna-primary' : 'bg-slate-200'">
                <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                      [ngClass]="pricing.vendorCommission.overrideAllowed ? 'start-5' : 'start-0.5'"></span>
              </button>
            </div>
          </div>
        </app-card>

        <!-- Driver Compensation Card -->
        <app-card class="mb-3.5 block break-inside-avoid" variant="default" rounded="2xl" padding="none" customClass="border-slate-200/70 shadow-sm overflow-hidden">
          <div class="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <span class="material-symbols-outlined text-emerald-500 text-[17px]">local_shipping</span>
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-800">{{ 'FINANCES.PRICING.DRIVER_COMPENSATION.TITLE' | translate }}</h3>
              <p class="text-[9px] font-bold text-slate-400">{{ 'FINANCES.PRICING.DRIVER_COMPENSATION.SUBTITLE' | translate }}</p>
            </div>
          </div>
          <div class="p-4 space-y-3.5">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{{ 'FINANCES.PRICING.DRIVER_COMPENSATION.BASE_PAYOUT' | translate }}</label>
                <input type="number" [(ngModel)]="pricing.driverCompensation.basePayout" (ngModelChange)="isDirty = true"
                       min="0" step="0.5"
                       class="w-full h-10 px-3 text-sm font-black bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all text-center tabular-nums"/>
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{{ 'FINANCES.PRICING.DRIVER_COMPENSATION.DISTANCE_RATE' | translate }}</label>
                <input type="number" [(ngModel)]="pricing.driverCompensation.distanceRatePerKm" (ngModelChange)="isDirty = true"
                       min="0" step="0.25"
                       class="w-full h-10 px-3 text-sm font-black bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all text-center tabular-nums"/>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{{ 'FINANCES.PRICING.DRIVER_COMPENSATION.PEAK_BONUS' | translate }}</label>
                <input type="number" [(ngModel)]="pricing.driverCompensation.peakBonus" (ngModelChange)="isDirty = true"
                       min="0" step="1"
                       class="w-full h-10 px-3 text-sm font-black bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all text-center tabular-nums"/>
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{{ 'FINANCES.PRICING.DRIVER_COMPENSATION.ZONE_BONUS' | translate }}</label>
                <input type="number" [(ngModel)]="pricing.driverCompensation.zoneBonus" (ngModelChange)="isDirty = true"
                       min="0" step="1"
                       class="w-full h-10 px-3 text-sm font-black bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all text-center tabular-nums"/>
              </div>
            </div>
            <div class="flex items-center gap-3 py-2 border-t border-slate-100">
              <span class="text-xs font-bold text-slate-600 flex-1">{{ 'FINANCES.PRICING.DRIVER_COMPENSATION.ALLOW_OVERRIDES' | translate }}</span>
              <button (click)="pricing!.driverCompensation.overrideAllowed = !pricing!.driverCompensation.overrideAllowed; isDirty = true"
                      class="relative w-10 h-5 rounded-full transition-all"
                      [ngClass]="pricing.driverCompensation.overrideAllowed ? 'bg-zadna-primary' : 'bg-slate-200'">
                <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                      [ngClass]="pricing.driverCompensation.overrideAllowed ? 'start-5' : 'start-0.5'"></span>
              </button>
            </div>
          </div>
        </app-card>

        <!-- Delivery Pricing Card -->
        <app-card class="mb-3.5 block break-inside-avoid" variant="default" rounded="2xl" padding="none" customClass="border-slate-200/70 shadow-sm overflow-hidden">
          <div class="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <span class="material-symbols-outlined text-amber-500 text-[17px]">local_shipping</span>
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-800">{{ 'FINANCES.PRICING.DELIVERY.TITLE' | translate }}</h3>
              <p class="text-[9px] font-bold text-slate-400">{{ 'FINANCES.PRICING.DELIVERY.SUBTITLE' | translate }}</p>
            </div>
          </div>
          <div class="p-4 space-y-3.5">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{{ 'FINANCES.PRICING.DELIVERY.BASE_FEE' | translate }}</label>
                <input type="number" [(ngModel)]="pricing.deliveryPricing.baseFee" (ngModelChange)="isDirty = true" min="0"
                       class="w-full h-10 px-3 text-sm font-black bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary outline-none transition-all text-center tabular-nums"/>
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{{ 'FINANCES.PRICING.DELIVERY.PER_KM' | translate }}</label>
                <input type="number" [(ngModel)]="pricing.deliveryPricing.perKmRate" (ngModelChange)="isDirty = true" min="0" step="0.5"
                       class="w-full h-10 px-3 text-sm font-black bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary outline-none transition-all text-center tabular-nums"/>
              </div>
            </div>
            <div>
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                {{ 'FINANCES.PRICING.DELIVERY.PEAK_MULTIPLIER' | translate }}:
                <span class="text-zadna-primary">{{ pricing.deliveryPricing.peakMultiplier }}x</span>
              </label>
              <input type="range" [(ngModel)]="pricing.deliveryPricing.peakMultiplier" (ngModelChange)="isDirty = true"
                     min="1" max="3" step="0.1"
                     class="w-full accent-zadna-primary"/>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{{ 'FINANCES.PRICING.DELIVERY.PEAK_START' | translate }}</label>
                <input type="time" [(ngModel)]="pricing.deliveryPricing.peakHoursStart" (ngModelChange)="isDirty = true"
                       class="w-full h-10 px-3 text-xs font-bold bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary outline-none transition-all"/>
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{{ 'FINANCES.PRICING.DELIVERY.PEAK_END' | translate }}</label>
                <input type="time" [(ngModel)]="pricing.deliveryPricing.peakHoursEnd" (ngModelChange)="isDirty = true"
                       class="w-full h-10 px-3 text-xs font-bold bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary outline-none transition-all"/>
              </div>
            </div>
          </div>
        </app-card>

        <!-- Service Fee Card -->
        <app-card class="mb-3.5 block break-inside-avoid" variant="default" rounded="2xl" padding="none" customClass="border-slate-200/70 shadow-sm overflow-hidden">
          <div class="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <span class="material-symbols-outlined text-blue-500 text-[17px]">receipt</span>
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-800">{{ 'FINANCES.PRICING.SERVICE_FEE.TITLE' | translate }}</h3>
              <p class="text-[9px] font-bold text-slate-400">{{ 'FINANCES.PRICING.SERVICE_FEE.SUBTITLE' | translate }}</p>
            </div>
          </div>
          <div class="p-4 space-y-3.5">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{{ 'FINANCES.PRICING.SERVICE_FEE.PERCENT' | translate }}</label>
                <input type="number" [(ngModel)]="pricing.serviceFee.percent" (ngModelChange)="isDirty = true" min="0" max="100" step="0.5"
                       class="w-full h-10 px-3 text-sm font-black bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary outline-none transition-all text-center tabular-nums"/>
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{{ 'FINANCES.PRICING.SERVICE_FEE.CAP' | translate }}</label>
                <input type="number" [(ngModel)]="pricing.serviceFee.capAmount" (ngModelChange)="isDirty = true" min="0"
                       class="w-full h-10 px-3 text-sm font-black bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary outline-none transition-all text-center tabular-nums"/>
              </div>
            </div>
          </div>
        </app-card>

        <!-- COD Fee Card -->
        <app-card class="mb-3.5 block break-inside-avoid" variant="default" rounded="2xl" padding="none" customClass="border-slate-200/70 shadow-sm overflow-hidden">
          <div class="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <span class="material-symbols-outlined text-indigo-500 text-[17px]">local_atm</span>
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-800">{{ 'FINANCES.PRICING.COD_FEE.TITLE' | translate }}</h3>
              <p class="text-[9px] font-bold text-slate-400">{{ 'FINANCES.PRICING.COD_FEE.SUBTITLE' | translate }}</p>
            </div>
          </div>
          <div class="p-4 space-y-3.5">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{{ 'FINANCES.PRICING.COD_FEE.PERCENT' | translate }}</label>
                <input type="number" [(ngModel)]="pricing.codFee.percent" (ngModelChange)="isDirty = true" min="0" max="100" step="0.1"
                       class="w-full h-10 px-3 text-sm font-black bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary outline-none transition-all text-center tabular-nums"/>
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{{ 'FINANCES.PRICING.COD_FEE.FLAT_FEE' | translate }}</label>
                <input type="number" [(ngModel)]="pricing.codFee.flatFee" (ngModelChange)="isDirty = true" min="0"
                       class="w-full h-10 px-3 text-sm font-black bg-slate-50 rounded-xl border border-slate-200 focus:border-zadna-primary outline-none transition-all text-center tabular-nums"/>
              </div>
            </div>
            <div class="flex items-center gap-3 py-2 border-t border-slate-100">
              <span class="text-xs font-bold text-slate-600 flex-1">{{ 'FINANCES.PRICING.COD_FEE.USE_FLAT' | translate }}</span>
              <button (click)="pricing!.codFee.useFlat = !pricing!.codFee.useFlat; isDirty = true"
                      class="relative w-10 h-5 rounded-full transition-all"
                      [ngClass]="pricing.codFee.useFlat ? 'bg-zadna-primary' : 'bg-slate-200'">
                <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                      [ngClass]="pricing.codFee.useFlat ? 'start-5' : 'start-0.5'"></span>
              </button>
            </div>
          </div>
        </app-card>

        <!-- VAT Card -->
        <app-card class="mb-3.5 block break-inside-avoid" variant="default" rounded="2xl" padding="none" customClass="border-slate-200/70 shadow-sm overflow-hidden">
          <div class="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
              <span class="material-symbols-outlined text-purple-500 text-[17px]">account_balance</span>
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-800">{{ 'FINANCES.PRICING.VAT.TITLE' | translate }}</h3>
              <p class="text-[9px] font-bold text-slate-400">{{ 'FINANCES.PRICING.VAT.SUBTITLE' | translate }}</p>
            </div>
          </div>
          <div class="p-4 space-y-3.5">
            <div>
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                {{ 'FINANCES.PRICING.VAT.RATE' | translate }}:
                <span class="text-purple-600">{{ pricing.vat.percent }}%</span>
              </label>
              <input type="range" [(ngModel)]="pricing.vat.percent" (ngModelChange)="isDirty = true"
                     min="0" max="25" step="1"
                     class="w-full accent-purple-500"/>
            </div>
            <div class="space-y-2 border-t border-slate-100 pt-3">
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{{ 'FINANCES.PRICING.VAT.APPLY_TO' | translate }}</label>
              <div *ngFor="let vr of vatRules" class="flex items-center justify-between py-1.5">
                <span class="text-xs font-bold text-slate-600">{{ vr.labelKey | translate }}</span>
                <button (click)="toggleVatRule(vr.key); isDirty = true"
                        class="relative w-9 h-4.5 rounded-full transition-all"
                        [ngClass]="getVatRuleValue(vr.key) ? 'bg-purple-500' : 'bg-slate-200'">
                  <span class="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-all"
                        [ngClass]="getVatRuleValue(vr.key) ? 'start-[18px]' : 'start-0.5'"></span>
                </button>
              </div>
            </div>
          </div>
        </app-card>

        <!-- Last Updated Card -->
        <app-card class="mb-3.5 block break-inside-avoid" variant="default" rounded="2xl" padding="sm" customClass="!bg-slate-900 !border-slate-900 shadow-sm text-white flex flex-col justify-between">
          <div>
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'FINANCES.PRICING.CURRENT_RULESET' | translate }}</p>
            <h3 class="text-sm font-black">{{ pricing.name | translate }}</h3>
            <p class="text-[10px] font-medium text-slate-400 mt-2">{{ 'FINANCES.PRICING.EFFECTIVE_FROM' | translate }} {{ formatDate(pricing.effectiveFrom) }}</p>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-700">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'FINANCES.PRICING.LAST_UPDATED' | translate }}</p>
            <p class="text-xs font-bold text-slate-300">{{ formatDate(pricing.lastUpdatedAt) }}</p>
            <p class="text-[10px] text-slate-500">{{ 'FINANCES.PRICING.BY' | translate }} {{ pricing.lastUpdatedBy | translate }}</p>
          </div>
        </app-card>

      </div>

    </div>
  `
})
export class PlatformPricingComponent implements OnInit {
  private financeService = inject(FinanceService);
  private translate = inject(TranslateService);

  pricing: PricingRuleSet | null = null;
  isDirty = false;
  showConfirm = false;

  vatRules = [
    { key: 'applyOnServiceFee', labelKey: 'FINANCES.PRICING.VAT.TARGETS.SERVICE_FEE' },
    { key: 'applyOnDelivery', labelKey: 'FINANCES.PRICING.VAT.TARGETS.DELIVERY_FEE' },
    { key: 'applyOnCommission', labelKey: 'FINANCES.PRICING.VAT.TARGETS.COMMISSION' }
  ];

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.financeService.getPricingRules().pipe(take(1)).subscribe(data => {
      this.pricing = { ...data };
      this.isDirty = false;
    });
  }

  confirmSave(): void { this.showConfirm = true; }

  savePricing(): void {
    if (!this.pricing) return;
    this.financeService.savePricingRules(this.pricing).pipe(take(1)).subscribe(saved => {
      this.pricing = saved;
      this.isDirty = false;
      this.showConfirm = false;
    });
  }

  getVatRuleValue(key: string): boolean {
    if (!this.pricing) return false;
    return this.pricing.vat[key as keyof typeof this.pricing.vat] as boolean;
  }

  toggleVatRule(key: string): void {
    if (!this.pricing) return;
    (this.pricing.vat as unknown as Record<string, boolean>)[key] = !this.getVatRuleValue(key);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString(getFinanceLocale(this.translate.currentLang), { calendar: 'gregory' });
  }
}
