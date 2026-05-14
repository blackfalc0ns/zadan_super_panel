import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, take } from 'rxjs';
import {
  CityDeliveryPricingSettings,
  DeliveryPricingDefaults,
  PricingScope,
  PricingSettingsItem,
  RegionDeliveryPricingSettings,
  ZoneFinanceSettings
} from '../../models/finance.models';
import { FinanceService } from '../../services/finance.service';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { ToastService } from '../../../../shared/services/toast.service';

type NumericZoneField =
  | 'baseDeliveryFee'
  | 'includedKm'
  | 'extraKmFee'
  | 'minDeliveryFee'
  | 'maxDeliveryFee'
  | 'vatPercent'
  | 'codFlatFee'
  | 'codPercent'
  | 'minTotalDeliveryFee'
  | 'maxTotalDeliveryFee'
  | 'maxQuotedDistanceKm'
  | 'warningSubtotalRatioThreshold';

@Component({
  selector: 'app-platform-pricing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AppCardComponent,
    AppButtonComponent,
    AppPageHeaderComponent
  ],
  template: `
    <div *ngIf="showConfirm" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" (click)="closeConfirm()"></div>
      <div class="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl" (click)="$event.stopPropagation()">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50">
          <span class="material-symbols-outlined text-[24px] text-amber-500">warning</span>
        </div>
        <h3 class="mb-2 text-center text-lg font-black text-slate-900">{{ 'FINANCES.PRICING.CONFIRM_SAVE_TITLE' | translate }}</h3>
        <p class="mb-6 text-center text-[13px] font-medium leading-relaxed text-slate-500">
          {{ 'FINANCES.PRICING.CONFIRM_SAVE_MESSAGE' | translate }}
        </p>
        <div class="flex gap-3">
          <app-button
            variant="ghost"
            size="md"
            customClass="!flex-1 !rounded-xl !bg-slate-50 hover:!bg-slate-100"
            [disabled]="isSaving"
            (btnClick)="closeConfirm()">
            {{ 'COMMON.CANCEL' | translate }}
          </app-button>
          <app-button
            variant="primary"
            size="md"
            customClass="!flex-1 !rounded-xl shadow-md shadow-zadna-primary/20"
            [isLoading]="isSaving"
            [disabled]="!canSave"
            (btnClick)="savePricing()">
            {{ 'FINANCES.PRICING.SAVE_SETTINGS' | translate }}
          </app-button>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <app-page-header
        [title]="'FINANCES.PRICING.TITLE' | translate"
        [subtitle]="'FINANCES.PRICING.SUBTITLE' | translate">
        <div actions class="flex flex-wrap items-center gap-3">
          <div class="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            <button type="button" (click)="changeScope('zone')" [ngClass]="scopeButtonClass('zone')" class="rounded-xl px-3 py-2 text-xs font-black">Zones</button>
            <button type="button" (click)="changeScope('city')" [ngClass]="scopeButtonClass('city')" class="rounded-xl px-3 py-2 text-xs font-black">Cities</button>
            <button type="button" (click)="changeScope('region')" [ngClass]="scopeButtonClass('region')" class="rounded-xl px-3 py-2 text-xs font-black">Regions</button>
            <button type="button" (click)="changeScope('global')" [ngClass]="scopeButtonClass('global')" class="rounded-xl px-3 py-2 text-xs font-black">Global</button>
          </div>

          <div class="relative w-52" *ngIf="selectedScope !== 'global' && regionOptions.length">
            <select
              [(ngModel)]="selectedRegionFilter"
              (ngModelChange)="applyFilters()"
              class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2 pe-10 text-[13px] font-bold text-slate-800 outline-none transition-all focus:border-zadna-primary focus:ring-2 focus:ring-zadna-primary/20">
              <option value="all">All regions</option>
              <option *ngFor="let region of regionOptions" [value]="region.id">{{ region.label }}</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
              expand_more
            </span>
          </div>

          <div class="relative w-64">
            <select
              *ngIf="zones.length"
              [(ngModel)]="selectedZoneId"
              (ngModelChange)="onZoneChange()"
              class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2 pe-10 text-[13px] font-bold text-slate-800 outline-none transition-all focus:border-zadna-primary focus:ring-2 focus:ring-zadna-primary/20">
              <option *ngFor="let zone of zones" [value]="itemId(zone)">
                {{ itemDisplayLabel(zone) }}
              </option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
              expand_more
            </span>
          </div>

          <div *ngIf="isLoading" class="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-zadna-primary"></div>
            <span class="text-xs font-bold text-slate-500">{{ 'FINANCES.PRICING.LOAD_ZONES' | translate }}</span>
          </div>

          <app-button
            variant="outline"
            size="sm"
            customClass="!rounded-xl !bg-white hover:!bg-slate-50"
            [disabled]="isLoading || isSaving"
            (btnClick)="loadData()">
            {{ 'FINANCES.PRICING.UPDATE' | translate }}
          </app-button>

          <app-button
            variant="outline"
            size="sm"
            customClass="!rounded-xl !bg-white hover:!bg-slate-50"
            [disabled]="!isDirty || isSaving"
            (btnClick)="resetChanges()">
            {{ 'FINANCES.PRICING.DISCARD' | translate }}
          </app-button>

          <app-button
            variant="primary"
            size="sm"
            customClass="!rounded-xl shadow-sm"
            [disabled]="!canSave"
            [isLoading]="isSaving"
            (btnClick)="confirmSave()">
            <span class="material-symbols-outlined text-[16px] rtl:ml-1 ltr:mr-1">save</span>
            {{ 'FINANCES.PRICING.SAVE_SETTINGS' | translate }}
          </app-button>
        </div>
      </app-page-header>

      <div *ngIf="errorMessage" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
        {{ errorMessage }}
      </div>

      <div *ngIf="zones.length" class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 class="text-[15px] font-black text-slate-900">{{ 'FINANCES.PRICING.AVAILABLE_ZONES' | translate }}</h3>
            <p class="mt-1 text-[12px] font-medium text-slate-500">
              {{ 'FINANCES.PRICING.SELECT_ZONE_DESC' | translate }}
            </p>
          </div>
          <div class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-600">
            {{ 'FINANCES.PRICING.ZONES_COUNT' | translate:{ count: zones.length } }}
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(320px,420px)_1fr] lg:items-end">
          <div class="space-y-2">
            <label class="block text-[11px] font-bold text-slate-400">{{ 'FINANCES.PRICING.ZONE_LIST_LABEL' | translate }}</label>
            <div class="relative">
              <select
                [(ngModel)]="selectedZoneId"
                (ngModelChange)="onZoneChange()"
                class="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pe-11 text-[14px] font-bold text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-2 focus:ring-zadna-primary/20">
                <option *ngFor="let zone of zones" [value]="itemId(zone)">
                  {{ itemDisplayLabel(zone) }}
                </option>
              </select>
              <span class="material-symbols-outlined pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                expand_more
              </span>
            </div>
          </div>

          <div *ngIf="selectedZone" class="flex flex-wrap items-center gap-2 lg:justify-end">
            <span
              class="rounded-full px-3 py-1.5 text-[11px] font-black"
              [ngClass]="selectedZone.isPricingActive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'">
              {{ (selectedZone.isPricingActive ? 'FINANCES.PRICING.ACTIVE' : 'FINANCES.PRICING.INACTIVE') | translate }}
            </span>
            <span class="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
              {{ 'FINANCES.PRICING.VAT_LABEL' | translate:{ percent: selectedZone.vatPercent } }}
            </span>
            <span class="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
              <ng-container *ngIf="selectedZone.codFeeType === 'percent'">
                {{ 'FINANCES.PRICING.COD_LABEL_PERCENT' | translate:{ percent: selectedZone.codPercent } }}
              </ng-container>
              <ng-container *ngIf="selectedZone.codFeeType !== 'percent'">
                {{ 'FINANCES.PRICING.COD_LABEL_FLAT' | translate:{ amount: selectedZone.codFlatFee } }}
              </ng-container>
            </span>
          </div>
        </div>
      </div>

      <div *ngIf="!isLoading && !zones.length" class="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
          <span class="material-symbols-outlined text-[30px]">location_off</span>
        </div>
        <h3 class="text-lg font-black text-slate-900">{{ 'FINANCES.PRICING.NO_ZONES_TITLE' | translate }}</h3>
        <p class="mt-2 text-sm font-medium text-slate-500">
          {{ emptyStateMessage || ('FINANCES.PRICING.NO_ZONES_DESC' | translate) }}
        </p>
        <div class="mt-5 flex justify-center gap-3" *ngIf="selectedScope !== 'global'">
          <app-button
            *ngIf="selectedScope !== 'city'"
            variant="outline"
            size="sm"
            customClass="!rounded-xl !bg-white hover:!bg-slate-50"
            (btnClick)="changeScope('city')">
            Cities
          </app-button>
          <app-button
            *ngIf="selectedScope !== 'region'"
            variant="outline"
            size="sm"
            customClass="!rounded-xl !bg-white hover:!bg-slate-50"
            (btnClick)="changeScope('region')">
            Regions
          </app-button>
          <app-button
            variant="primary"
            size="sm"
            customClass="!rounded-xl"
            (btnClick)="changeScope('global')">
            Global
          </app-button>
        </div>
      </div>

      <div *ngIf="selectedZone" class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-[11px] font-bold text-slate-400">{{ 'FINANCES.PRICING.SELECTED_ZONE' | translate }}</p>
          <h3 class="mt-1 text-lg font-black text-slate-900">{{ itemDisplayLabel(selectedZone) }}</h3>
          <p class="mt-1 text-[12px] font-medium" [ngClass]="isDirty ? 'text-amber-600' : 'text-slate-500'">
            {{ (isDirty ? 'FINANCES.PRICING.UNSAVED_CHANGES' : 'FINANCES.PRICING.ALL_SAVED') | translate }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <app-button
            variant="outline"
            size="sm"
            customClass="!rounded-xl !bg-white hover:!bg-slate-50"
            [disabled]="!isDirty || isSaving"
            (btnClick)="resetChanges()">
            {{ 'FINANCES.PRICING.DISCARD' | translate }}
          </app-button>

          <app-button
            variant="primary"
            size="sm"
            customClass="!rounded-xl shadow-sm"
            [disabled]="!canSave"
            [isLoading]="isSaving"
            (btnClick)="confirmSave()">
            <span class="material-symbols-outlined text-[16px] rtl:ml-1 ltr:mr-1">save</span>
            {{ 'FINANCES.PRICING.SAVE_CHANGES' | translate }}
          </app-button>
        </div>
      </div>

      <div *ngIf="selectedZone" class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <app-card variant="default" rounded="2xl" padding="none" customClass="flex h-full flex-col overflow-visible border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
          <div class="flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-slate-50/60 px-5 py-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-100 bg-amber-50">
                <span class="material-symbols-outlined text-[20px] text-amber-500">local_shipping</span>
              </div>
              <div>
                <h3 class="text-[15px] font-black text-slate-900">{{ 'FINANCES.PRICING.BASE_DELIVERY' | translate }}</h3>
                <p class="mt-0.5 text-[11px] font-bold text-slate-500">{{ 'FINANCES.PRICING.BASE_DELIVERY_DESC' | translate }}</p>
              </div>
            </div>
            <button
              type="button"
              (click)="togglePricingActive()"
              class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zadna-primary focus:ring-offset-2"
              [ngClass]="selectedZone.isPricingActive ? 'bg-zadna-primary' : 'bg-slate-200'">
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
                [ngClass]="selectedZone.isPricingActive ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </div>

          <div
            class="flex-1 space-y-5 p-5 transition-opacity duration-200"
            [class.pointer-events-none]="!selectedZone.isPricingActive"
            [class.opacity-40]="!selectedZone.isPricingActive">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-slate-600">{{ 'FINANCES.PRICING.BASE_FEE' | translate }}</label>
                <div class="relative">
                  <input
                    type="number"
                    [ngModel]="selectedZone.baseDeliveryFee"
                    (ngModelChange)="updateNumberField('baseDeliveryFee', $event)"
                    min="0"
                    class="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-left text-[14px] font-black text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary" />
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">{{ 'FINANCES.CURRENCY' | translate }}</span>
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-slate-600">{{ 'FINANCES.PRICING.INCLUDED_KM' | translate }}</label>
                <div class="relative">
                  <input
                    type="number"
                    [ngModel]="selectedZone.includedKm"
                    (ngModelChange)="updateNumberField('includedKm', $event)"
                    min="0"
                    step="0.5"
                    class="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-left text-[14px] font-black text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary" />
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">KM</span>
                </div>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-[11px] font-bold text-slate-600">{{ 'FINANCES.PRICING.EXTRA_KM_FEE' | translate }}</label>
              <div class="relative">
                <input
                  type="number"
                  [ngModel]="selectedZone.extraKmFee"
                  (ngModelChange)="updateNumberField('extraKmFee', $event)"
                  min="0"
                  step="0.5"
                  class="w-full rounded-xl border border-slate-200 bg-white pl-16 pr-4 text-left text-[14px] font-black text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary" />
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">{{ 'FINANCES.CURRENCY' | translate }}/KM</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-slate-600">{{ 'FINANCES.PRICING.MIN_FEE' | translate }}</label>
                <div class="relative">
                  <input
                    type="number"
                    [ngModel]="selectedZone.minDeliveryFee"
                    (ngModelChange)="updateNumberField('minDeliveryFee', $event)"
                    min="0"
                    class="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-left text-[14px] font-black text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary" />
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">{{ 'FINANCES.CURRENCY' | translate }}</span>
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-slate-600">{{ 'FINANCES.PRICING.MAX_FEE' | translate }}</label>
                <div class="relative">
                  <input
                    type="number"
                    [ngModel]="selectedZone.maxDeliveryFee"
                    (ngModelChange)="updateNumberField('maxDeliveryFee', $event)"
                    min="0"
                    class="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-left text-[14px] font-black text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary" />
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">{{ 'FINANCES.CURRENCY' | translate }}</span>
                </div>
              </div>
            </div>
          </div>
        </app-card>

        <app-card variant="default" rounded="2xl" padding="none" customClass="flex h-full flex-col overflow-visible border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
          <div class="flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-slate-50/60 px-5 py-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50">
                <span class="material-symbols-outlined text-[20px] text-indigo-500">local_atm</span>
              </div>
              <div>
                <h3 class="text-[15px] font-black text-slate-900">{{ 'FINANCES.PRICING.COD_FEE' | translate }}</h3>
                <p class="mt-0.5 text-[11px] font-bold text-slate-500">{{ 'FINANCES.PRICING.COD_FEE_DESC' | translate }}</p>
              </div>
            </div>
            <button
              type="button"
              (click)="toggleCodActive()"
              class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              [ngClass]="selectedZone.isCodFeeActive ? 'bg-indigo-500' : 'bg-slate-200'">
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
                [ngClass]="selectedZone.isCodFeeActive ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </div>

          <div
            class="flex-1 space-y-5 p-5 transition-opacity duration-200"
            [class.pointer-events-none]="!selectedZone.isCodFeeActive"
            [class.opacity-40]="!selectedZone.isCodFeeActive">
            <div class="space-y-1.5">
              <label class="block text-[11px] font-bold text-slate-600">{{ 'FINANCES.PRICING.FEE_TYPE' | translate }}</label>
              <div class="relative">
                <select
                  [(ngModel)]="selectedZone.codFeeType"
                  (ngModelChange)="markDirty()"
                  class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-black text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                  <option value="flat">{{ 'FINANCES.PRICING.FLAT_FEE' | translate }}</option>
                  <option value="percent">{{ 'FINANCES.PRICING.PERCENTAGE' | translate }}</option>
                </select>
                <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">unfold_more</span>
              </div>
              <p class="text-[11px] font-medium text-slate-400">
                {{ 'FINANCES.PRICING.BACKEND_HINT' | translate }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5" [class.opacity-30]="selectedZone.codFeeType === 'flat'">
                <label class="block text-[11px] font-bold text-slate-600">{{ 'FINANCES.PRICING.PERCENTAGE' | translate }}</label>
                <div class="relative">
                  <input
                    type="number"
                    [ngModel]="selectedZone.codPercent"
                    (ngModelChange)="updateNumberField('codPercent', $event)"
                    min="0"
                    max="100"
                    step="0.1"
                    [disabled]="selectedZone.codFeeType === 'flat'"
                    class="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-left text-[14px] font-black text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50" />
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-black text-slate-400">%</span>
                </div>
              </div>
              <div class="space-y-1.5" [class.opacity-30]="selectedZone.codFeeType === 'percent'">
                <label class="block text-[11px] font-bold text-slate-600">{{ 'FINANCES.PRICING.FLAT_AMOUNT' | translate }}</label>
                <div class="relative">
                  <input
                    type="number"
                    [ngModel]="selectedZone.codFlatFee"
                    (ngModelChange)="updateNumberField('codFlatFee', $event)"
                    min="0"
                    [disabled]="selectedZone.codFeeType === 'percent'"
                    class="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-left text-[14px] font-black text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50" />
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">{{ 'FINANCES.CURRENCY' | translate }}</span>
                </div>
              </div>
            </div>
          </div>
        </app-card>

        <app-card variant="default" rounded="2xl" padding="none" customClass="flex h-full flex-col overflow-visible border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
          <div class="flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-slate-50/60 px-5 py-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-100 bg-purple-50">
                <span class="material-symbols-outlined text-[20px] text-purple-500">account_balance</span>
              </div>
              <div>
                <h3 class="text-[15px] font-black text-slate-900">{{ 'FINANCES.PRICING.VAT_TITLE' | translate }}</h3>
                <p class="mt-0.5 text-[11px] font-bold text-slate-500">{{ 'FINANCES.PRICING.VAT_DESC' | translate }}</p>
              </div>
            </div>
            <button
              type="button"
              (click)="toggleVatActive()"
              class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              [ngClass]="selectedZone.isVatActive ? 'bg-purple-500' : 'bg-slate-200'">
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
                [ngClass]="selectedZone.isVatActive ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </div>

          <div
            class="flex flex-1 flex-col items-center justify-center space-y-6 p-5 transition-opacity duration-200"
            [class.pointer-events-none]="!selectedZone.isVatActive"
            [class.opacity-40]="!selectedZone.isVatActive">
            <div class="text-center">
              <div class="mb-2 text-4xl font-black text-purple-600 tabular-nums">
                {{ selectedZone.vatPercent }}<span class="text-2xl text-purple-400">%</span>
              </div>
              <p class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.PRICING.CURRENT_PERCENT' | translate }}</p>
            </div>

            <div class="w-full">
              <input
                type="range"
                [ngModel]="selectedZone.vatPercent"
                (ngModelChange)="updateNumberField('vatPercent', $event)"
                min="0"
                max="25"
                step="1"
                class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-purple-600" />
              <div class="mt-2 flex justify-between text-[10px] font-bold text-slate-400">
                <span>0%</span>
                <span>25%</span>
              </div>
            </div>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class PlatformPricingComponent implements OnInit {
  private readonly financeService = inject(FinanceService);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly scopeFallbackOrder: PricingScope[] = ['zone', 'city', 'region', 'global'];
  private readonly cityArabicMap: Record<string, string> = {
    riyadh: 'الرياض',
    jeddah: 'جدة',
    dammam: 'الدمام',
    khobar: 'الخبر',
    'al khobar': 'الخبر',
    makkah: 'مكة',
    mecca: 'مكة',
    madinah: 'المدينة',
    medina: 'المدينة',
    taif: 'الطائف',
    tabuk: 'تبوك'
  };
  private readonly zoneArabicMap: Record<string, string> = {
    'al olaya': 'العليا',
    olaya: 'العليا',
    'al sulaymaniyah': 'السليمانية',
    sulaymaniyah: 'السليمانية',
    'al malqa': 'الملقا',
    malqa: 'الملقا',
    'al yasmin': 'الياسمين',
    yasmin: 'الياسمين',
    'al nakheel': 'النخيل',
    nakheel: 'النخيل',
    'al rawdah': 'الروضة',
    rawdah: 'الروضة',
    standard: 'قياسي',
    central: 'المركزية',
    remote: 'البعيدة',
    north: 'الشمال',
    south: 'الجنوب',
    east: 'الشرق',
    west: 'الغرب',
    airport: 'المطار',
    industrial: 'الصناعية',
    branch: 'الفرع',
    zone: 'المنطقة'
  };

  selectedScope: PricingScope = 'zone';
  allItems: PricingSettingsItem[] = [];
  zones: PricingSettingsItem[] = [];
  regionOptions: Array<{ id: string; label: string }> = [];
  selectedRegionFilter = 'all';
  selectedZoneId: string | null = null;
  selectedZone: PricingSettingsItem | null = null;
  emptyStateMessage = '';

  isLoading = false;
  isSaving = false;
  isDirty = false;
  showConfirm = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadData();
  }

  get canSave(): boolean {
    return Boolean(this.selectedZone) && this.isDirty && !this.isSaving;
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.emptyStateMessage = '';

    this.loadScopeData();
  }

  onZoneChange(): void {
    const zone = this.zones.find((item) => this.itemId(item) === this.selectedZoneId);
    this.selectedZone = zone ? this.clone(zone) : null;
    this.isDirty = false;
    this.showConfirm = false;
  }

  resetChanges(): void {
    this.onZoneChange();
  }

  confirmSave(): void {
    if (!this.canSave) {
      return;
    }

    this.showConfirm = true;
  }

  closeConfirm(): void {
    if (this.isSaving) {
      return;
    }

    this.showConfirm = false;
  }

  savePricing(): void {
    if (!this.selectedZone || this.isSaving) {
      return;
    }

    const payload = this.buildSavePayload(this.selectedZone);
    this.isSaving = true;
    this.errorMessage = '';

    this.saveScopePayload(payload);
  }

  togglePricingActive(): void {
    if (!this.selectedZone) {
      return;
    }

    this.selectedZone.isPricingActive = !this.selectedZone.isPricingActive;
    this.markDirty();
  }

  toggleCodActive(): void {
    if (!this.selectedZone) {
      return;
    }

    this.selectedZone.isCodFeeActive = !this.selectedZone.isCodFeeActive;
    this.markDirty();
  }

  toggleVatActive(): void {
    if (!this.selectedZone) {
      return;
    }

    this.selectedZone.isVatActive = !this.selectedZone.isVatActive;
    this.markDirty();
  }

  updateNumberField(field: NumericZoneField, value: number | string): void {
    if (!this.selectedZone) {
      return;
    }

    const numericValue = Number(value);
    ((this.selectedZone as unknown) as Record<string, number>)[field] = Number.isFinite(numericValue)
      ? Math.max(0, numericValue)
      : 0;

    this.markDirty();
  }

  markDirty(): void {
    this.isDirty = true;
  }

  displayCityName(city: string): string {
    if (!city) {
      return '';
    }

    if (this.containsArabic(city)) {
      return city;
    }

    return this.cityArabicMap[this.normalizeLookupKey(city)] ?? city;
  }

  displayZoneName(zoneName: string): string {
    if (!zoneName) {
      return '';
    }

    if (this.containsArabic(zoneName)) {
      return zoneName;
    }

    const normalized = this.normalizeLookupKey(zoneName);
    if (this.zoneArabicMap[normalized]) {
      return this.zoneArabicMap[normalized];
    }

    const translated = normalized
      .split(/\s+/)
      .map((part) => this.zoneArabicMap[part] ?? part)
      .join(' ')
      .trim();

    return translated || zoneName;
  }

  changeScope(scope: PricingScope): void {
    if (this.selectedScope === scope) {
      return;
    }

    this.selectedScope = scope;
    this.selectedRegionFilter = 'all';
    this.selectedZoneId = null;
    this.selectedZone = null;
    this.showConfirm = false;
    this.isDirty = false;
    this.loadData();
  }

  scopeButtonClass(scope: PricingScope): string {
    return this.selectedScope === scope
      ? 'bg-zadna-primary text-white shadow-sm'
      : 'text-slate-600 hover:bg-slate-50';
  }

  applyFilters(): void {
    this.zones = this.allItems.filter((item) => this.matchesRegionFilter(item));
    if (!this.zones.some((item) => this.itemId(item) === this.selectedZoneId)) {
      this.selectedZoneId = this.zones[0] ? this.itemId(this.zones[0]) : null;
    }
    this.onZoneChange();
  }

  itemId(item: PricingSettingsItem): string {
    if ('zoneId' in item) return item.zoneId;
    if ('cityId' in item) return item.cityId;
    if ('regionId' in item && item.pricingScope === 'region') return item.regionId;
    return item.id;
  }

  itemPrimaryLabel(item: PricingSettingsItem): string {
    if ('zoneName' in item) return this.displayZoneName(item.zoneName);
    if ('cityNameAr' in item) return item.cityNameAr;
    if ('regionNameAr' in item) return item.regionNameAr;
    return this.translate.currentLang === 'ar' ? 'الإعدادات العامة' : 'Global defaults';
  }

  itemSecondaryLabel(item: PricingSettingsItem): string {
    if ('city' in item) {
      const city = this.displayCityName(item.city);
      const region = item.regionNameAr?.trim();
      return region ? `${city} - ${region}` : city;
    }

    if ('cityNameAr' in item) {
      return item.regionNameAr;
    }

    return '';
  }

  itemDisplayLabel(item: PricingSettingsItem): string {
    if ('zoneName' in item) {
      const zoneName = this.displayZoneName(item.zoneName);
      const city = this.displayCityName(item.city);
      return city ? `${zoneName} - ${city}` : zoneName;
    }

    const primary = this.itemPrimaryLabel(item);
    const secondary = this.itemSecondaryLabel(item);
    return secondary ? `${primary} - ${secondary}` : primary;
  }

  private buildSavePayload(zone: PricingSettingsItem): PricingSettingsItem {
    const minDeliveryFee = Math.min(zone.minDeliveryFee, zone.maxDeliveryFee || zone.minDeliveryFee);
    const maxDeliveryFee = Math.max(zone.maxDeliveryFee, minDeliveryFee);

    return {
      ...this.clone(zone),
      baseDeliveryFee: this.normalizeNumber(zone.baseDeliveryFee),
      includedKm: this.normalizeNumber(zone.includedKm),
      extraKmFee: this.normalizeNumber(zone.extraKmFee),
      minDeliveryFee: this.normalizeNumber(minDeliveryFee),
      maxDeliveryFee: this.normalizeNumber(maxDeliveryFee),
      vatPercent: this.normalizeNumber(zone.vatPercent),
      codFlatFee: this.normalizeNumber(zone.codFlatFee),
      codPercent: this.normalizeNumber(zone.codPercent),
      codFeeType: zone.codFeeType === 'percent' ? 'percent' : 'flat'
    } as PricingSettingsItem;
  }

  private loadScopeData(): void {
    const source$: Observable<PricingSettingsItem[] | PricingSettingsItem> =
      this.selectedScope === 'city' ? this.financeService.getCityPricingSettings()
      : this.selectedScope === 'region' ? this.financeService.getRegionPricingSettings()
      : this.selectedScope === 'global' ? this.financeService.getDeliveryPricingDefaults()
      : this.financeService.getZonePricingSettings();

    source$.subscribe({
      next: (result: PricingSettingsItem[] | PricingSettingsItem) => {
        this.allItems = Array.isArray(result) ? result : [result];
        if (!this.allItems.length) {
          this.tryFallbackScope();
          return;
        }

        this.regionOptions = this.buildRegionOptions(this.allItems);
        this.applyFilters();
        this.emptyStateMessage = this.buildEmptyStateMessage();
        this.isDirty = false;
        this.isLoading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = this.describeApiError(error);
        this.allItems = [];
        this.zones = [];
        this.selectedZone = null;
        this.isLoading = false;
      }
    });
  }

  private tryFallbackScope(): void {
    const currentIndex = this.scopeFallbackOrder.indexOf(this.selectedScope);
    const nextScope = this.scopeFallbackOrder[currentIndex + 1];

    if (nextScope) {
      this.selectedScope = nextScope;
      this.selectedRegionFilter = 'all';
      this.selectedZoneId = null;
      this.selectedZone = null;
      this.loadScopeData();
      return;
    }

    this.regionOptions = [];
    this.zones = [];
    this.selectedZoneId = null;
    this.selectedZone = null;
    this.emptyStateMessage = this.buildEmptyStateMessage();
    this.isDirty = false;
    this.isLoading = false;
  }

  private buildEmptyStateMessage(): string {
    if (this.selectedScope === 'zone') {
      return this.translate.currentLang === 'ar'
        ? 'لم يتم العثور على مناطق توصيل فعلية. يمكنك إدارة التسعير من مستوى المدينة أو المنطقة أو الإعدادات العامة.'
        : 'No delivery zones were found. You can manage pricing from cities, regions, or global defaults.';
    }

    if (this.selectedScope === 'city') {
      return this.translate.currentLang === 'ar'
        ? 'لا توجد مدن متاحة لهذا الفلتر حاليًا. جرّب المنطقة أو الإعدادات العامة.'
        : 'No cities are available for the current filter. Try regions or global defaults.';
    }

    if (this.selectedScope === 'region') {
      return this.translate.currentLang === 'ar'
        ? 'لا توجد مناطق إدارية متاحة حاليًا. يمكنك استخدام الإعدادات العامة.'
        : 'No administrative regions are available right now. You can use global defaults.';
    }

    return this.translate.currentLang === 'ar'
      ? 'لا توجد إعدادات تسعير متاحة حاليًا.'
      : 'No pricing settings are available right now.';
  }

  private saveScopePayload(payload: PricingSettingsItem): void {
    const request$: Observable<PricingSettingsItem> =
      this.selectedScope === 'city' && 'cityId' in payload
        ? this.financeService.updateCityPricingSettings(payload.cityId, payload as CityDeliveryPricingSettings)
      : this.selectedScope === 'region' && 'regionId' in payload
        ? this.financeService.updateRegionPricingSettings(payload.regionId!, payload as RegionDeliveryPricingSettings)
      : this.selectedScope === 'global' && 'id' in payload
        ? this.financeService.updateDeliveryPricingDefaults(payload as DeliveryPricingDefaults)
      : this.financeService.updateZonePricingSettings((payload as ZoneFinanceSettings).zoneId, payload as ZoneFinanceSettings);

    request$.subscribe({
      next: (savedItem: PricingSettingsItem) => {
        const id = this.itemId(savedItem);
        const allIndex = this.allItems.findIndex((item) => this.itemId(item) === id);
        if (allIndex >= 0) {
          this.allItems[allIndex] = this.clone(savedItem);
        } else {
          this.allItems = [this.clone(savedItem), ...this.allItems];
        }

        this.applyFilters();
        this.selectedZone = this.clone(savedItem);
        this.selectedZoneId = id;
        this.isDirty = false;
        this.isSaving = false;
        this.showConfirm = false;
        this.toastService.success(this.translate.instant('FINANCES.PRICING.SAVE_SUCCESS'), this.translate.instant('FINANCES.SHELL.ROUTES.PRICING.LABEL'));
      },
      error: (error: unknown) => {
        this.isSaving = false;
        this.errorMessage = this.describeApiError(error);
        this.toastService.error(this.errorMessage, this.translate.instant('FINANCES.SHELL.ROUTES.PRICING.LABEL'));
      }
    });
  }

  private matchesRegionFilter(item: PricingSettingsItem): boolean {
    if (this.selectedRegionFilter === 'all' || this.selectedScope === 'global') {
      return true;
    }

    if ('regionId' in item && item.regionId) {
      return item.regionId === this.selectedRegionFilter;
    }

    return false;
  }

  private buildRegionOptions(items: PricingSettingsItem[]): Array<{ id: string; label: string }> {
    const map = new Map<string, string>();
    items.forEach((item) => {
      if ('regionId' in item && item.regionId) {
        const label = ('regionNameAr' in item && item.regionNameAr ? item.regionNameAr : item.regionId) as string;
        map.set(item.regionId, label);
      }
    });

    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }

  private normalizeNumber(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.round((value + Number.EPSILON) * 100) / 100);
  }

  private describeApiError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return this.translate.currentLang === 'ar' 
          ? 'تعذر الاتصال بالباك إند الخاص بالتسعير. شغّل الـ API ثم أعد المحاولة.'
          : 'Could not connect to the pricing backend. Please ensure the API is running.';
      }
 
      const apiMessage =
        (typeof error.error === 'string' && error.error) ||
        error.error?.message ||
        error.error?.title ||
        error.message;
 
      return apiMessage || (this.translate.currentLang === 'ar' ? 'تعذر حفظ إعدادات التسعير حاليًا.' : 'Could not save pricing settings at this time.');
    }
 
    return this.translate.currentLang === 'ar' ? 'تعذر حفظ إعدادات التسعير حاليًا.' : 'Could not save pricing settings at this time.';
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }

  private normalizeLookupKey(value: string): string {
    return value
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private containsArabic(value: string): boolean {
    return /[\u0600-\u06FF]/.test(value);
  }
}
