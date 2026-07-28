import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { GeographyService } from '../../../../shared/services/geography.service';
import { describeApiError } from '../../../../shared/utils/api-error.util';

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
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-platform-pricing',
 standalone: true,
 imports: [
 CommonModule,
 FormsModule,
 RouterModule,
 TranslateModule,
 AppCardComponent,
 AppButtonComponent,
 AppPageHeaderComponent,
 SearchableSelectComponent
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
 customClass="!flex-1!rounded-xl!bg-slate-50 hover:!bg-slate-100"
 [disabled]="isSaving"
 (btnClick)="closeConfirm()">
 {{ 'COMMON.CANCEL' | translate }}
 </app-button>
 <app-button
 variant="primary"
 size="md"
 customClass="!flex-1!rounded-xl shadow-md shadow-zadna-primary/20"
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
 <div actions class="flex items-center gap-3">
 <a
 routerLink="/finances/fulfillment"
 class="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 hover:border-zadna-primary/30 hover:text-zadna-primary">
 <span class="material-symbols-outlined text-[16px]">tune</span>
 {{ 'FINANCES.SHELL.ROUTES.FULFILLMENT.LABEL' | translate }}
 </a>
 <app-button
 variant="outline"
 size="sm"
 customClass="!rounded-xl !bg-white hover:!bg-slate-50"
 [disabled]="isLoading || isSaving"
 (btnClick)="loadData()">
 <span class="material-symbols-outlined text-[16px] rtl:ml-1 ltr:mr-1">refresh</span>
 {{ 'FINANCES.PRICING.UPDATE' | translate }}
 </app-button>
 </div>
 </app-page-header>

 <div *ngIf="!isLoading && zones.length" class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
 <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
 <div class="inline-flex w-full max-w-full flex-wrap rounded-2xl border border-slate-200 bg-slate-50 p-1 sm:w-auto">
 <button type="button" (click)="changeScope('zone')" [ngClass]="scopeButtonClass('zone')" class="rounded-xl px-4 py-2.5 text-xs font-black transition-all">
 {{ 'FINANCES.PRICING.SCOPE.ZONE' | translate }}
 </button>
 <button type="button" (click)="changeScope('city')" [ngClass]="scopeButtonClass('city')" class="rounded-xl px-4 py-2.5 text-xs font-black transition-all">
 {{ 'FINANCES.PRICING.SCOPE.CITY' | translate }}
 </button>
 <button type="button" (click)="changeScope('region')" [ngClass]="scopeButtonClass('region')" class="rounded-xl px-4 py-2.5 text-xs font-black transition-all">
 {{ 'FINANCES.PRICING.SCOPE.REGION' | translate }}
 </button>
 <button type="button" (click)="changeScope('global')" [ngClass]="scopeButtonClass('global')" class="rounded-xl px-4 py-2.5 text-xs font-black transition-all">
 {{ 'FINANCES.PRICING.SCOPE.GLOBAL' | translate }}
 </button>
 </div>

 <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-end xl:w-auto">
 <app-searchable-select
 *ngIf="selectedScope !== 'global' && regionOptions.length > 1"
 class="min-w-[12rem] flex-1"
 [label]="'FINANCES.PRICING.SCOPE.REGION'"
 [(ngModel)]="selectedRegionFilter"
 [options]="mappedRegionFilterOptions"
 [searchable]="true"
 [allowClear]="false"
 (selectionChange)="applyFilters()">
 </app-searchable-select>

 <app-searchable-select
 class="min-w-[16rem] flex-1"
 [label]="'FINANCES.PRICING.ZONE_LIST_LABEL'"
 [(ngModel)]="selectedZoneId"
 [options]="mappedZoneOptions"
 [searchable]="true"
 [allowClear]="false"
 (selectionChange)="onZoneChange()">
 </app-searchable-select>

 <span class="inline-flex h-11 items-center rounded-full bg-slate-100 px-3 text-[11px] font-black text-slate-600 whitespace-nowrap">
 {{ 'FINANCES.PRICING.ZONES_COUNT' | translate:{ count: zones.length } }}
 </span>
 </div>
 </div>

 <div *ngIf="selectedZone" class="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
 <span class="rounded-full px-3 py-1.5 text-[11px] font-black" [ngClass]="selectedZone.isPricingActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
 {{ (selectedZone.isPricingActive ? 'FINANCES.PRICING.ACTIVE' : 'FINANCES.PRICING.INACTIVE') | translate }}
 </span>
 <span class="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
 {{ 'FINANCES.PRICING.VAT_LABEL' | translate:{ percent: selectedZone.vatPercent } }}
 </span>
 <span class="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
 <ng-container *ngIf="selectedZone.codFeeType === 'percent'">{{ 'FINANCES.PRICING.COD_LABEL_PERCENT' | translate:{ percent: selectedZone.codPercent } }}</ng-container>
 <ng-container *ngIf="selectedZone.codFeeType !== 'percent'">{{ 'FINANCES.PRICING.COD_LABEL_FLAT' | translate:{ amount: selectedZone.codFlatFee } }}</ng-container>
 </span>
 </div>
 </div>

 <div *ngIf="isLoading" class="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
 <div class="flex items-center justify-center gap-3 text-sm font-bold text-slate-500">
 <span class="admin-skeleton admin-skeleton-line sm w-40"></span>
 </div>
 </div>

 <div *ngIf="!isLoading && !zones.length" class="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
 <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
 <span class="material-symbols-outlined text-[30px]">location_off</span>
 </div>
 <h3 class="text-lg font-black text-slate-900">{{ 'FINANCES.PRICING.NO_ZONES_TITLE' | translate }}</h3>
 <p class="mt-2 text-sm font-medium text-slate-500">{{ emptyStateMessage || ('FINANCES.PRICING.NO_ZONES_DESC' | translate) }}</p>
 <div class="mt-5 flex flex-wrap justify-center gap-3" *ngIf="selectedScope !== 'global'">
 <app-button *ngIf="selectedScope !== 'city'" variant="outline" size="sm" customClass="!rounded-xl" (btnClick)="changeScope('city')">{{ 'FINANCES.PRICING.SCOPE.CITY' | translate }}</app-button>
 <app-button *ngIf="selectedScope !== 'region'" variant="outline" size="sm" customClass="!rounded-xl" (btnClick)="changeScope('region')">{{ 'FINANCES.PRICING.SCOPE.REGION' | translate }}</app-button>
 <app-button variant="primary" size="sm" customClass="!rounded-xl" (btnClick)="changeScope('global')">{{ 'FINANCES.PRICING.SCOPE.GLOBAL' | translate }}</app-button>
 </div>
 </div>

 <div *ngIf="selectedZone" class="sticky top-3 z-20 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-md backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
 <div class="min-w-0">
 <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ 'FINANCES.PRICING.SELECTED_ZONE' | translate }}</p>
 <h3 class="mt-1 truncate text-lg font-black text-slate-900">{{ itemDisplayLabel(selectedZone) }}</h3>
 <p class="mt-1 flex items-center gap-2 text-[12px] font-bold" [ngClass]="isDirty ? 'text-amber-600' : 'text-slate-500'">
 <span *ngIf="isDirty" class="material-symbols-outlined text-[16px]">warning</span>
 {{ (isDirty ? 'FINANCES.PRICING.UNSAVED_CHANGES' : 'FINANCES.PRICING.ALL_SAVED') | translate }}
 </p>
 </div>
 <div class="flex flex-wrap items-center gap-3 shrink-0">
 <app-button variant="outline" size="sm" customClass="!rounded-xl !bg-white" [disabled]="!isDirty || isSaving" (btnClick)="resetChanges()">{{ 'FINANCES.PRICING.DISCARD' | translate }}</app-button>
 <app-button variant="primary" size="sm" customClass="!rounded-xl shadow-sm" [disabled]="!canSave" [isLoading]="isSaving" (btnClick)="confirmSave()">
 <span class="material-symbols-outlined text-[16px] rtl:ml-1 ltr:mr-1">save</span>
 {{ 'FINANCES.PRICING.SAVE_CHANGES' | translate }}
 </app-button>
 </div>
 </div>

 <div *ngIf="selectedZone" class="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
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
 [ngClass]="selectedZone.isPricingActive ? 'ltr:translate-x-5 rtl:-translate-x-5' : 'translate-x-0'"></span>
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
 class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pe-14 text-end text-[14px] font-black tabular-nums text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary" />
 <span class="absolute end-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">{{ 'FINANCES.CURRENCY' | translate }}</span>
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
 class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pe-14 text-end text-[14px] font-black tabular-nums text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary" />
 <span class="absolute end-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">KM</span>
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
 class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pe-20 text-end text-[14px] font-black tabular-nums text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary" />
 <span class="absolute end-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">{{ 'FINANCES.CURRENCY' | translate }}/KM</span>
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
 class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pe-14 text-end text-[14px] font-black tabular-nums text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary" />
 <span class="absolute end-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">{{ 'FINANCES.CURRENCY' | translate }}</span>
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
 class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pe-14 text-end text-[14px] font-black tabular-nums text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary" />
 <span class="absolute end-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">{{ 'FINANCES.CURRENCY' | translate }}</span>
 </div>
 </div>
 </div>
 </div>
 </app-card>

 <app-card variant="default" rounded="2xl" padding="none" customClass="flex h-full flex-col overflow-visible border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
 <div class="flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-slate-50/60 px-5 py-4">
 <div class="flex items-center gap-3">
 <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-100 bg-sky-50">
 <span class="material-symbols-outlined text-[20px] text-sky-600">local_atm</span>
 </div>
 <div>
 <h3 class="text-[15px] font-black text-slate-900">{{ 'FINANCES.PRICING.COD_FEE' | translate }}</h3>
 <p class="mt-0.5 text-[11px] font-bold text-slate-500">{{ 'FINANCES.PRICING.COD_FEE_DESC' | translate }}</p>
 </div>
 </div>
 <button
 type="button"
 (click)="toggleCodActive()"
 class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zadna-primary focus:ring-offset-2"
 [ngClass]="selectedZone.isCodFeeActive ? 'bg-zadna-primary' : 'bg-slate-200'">
 <span
 class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
 [ngClass]="selectedZone.isCodFeeActive ? 'ltr:translate-x-5 rtl:-translate-x-5' : 'translate-x-0'"></span>
 </button>
 </div>

 <div
 class="flex-1 space-y-5 p-5 transition-opacity duration-200"
 [class.pointer-events-none]="!selectedZone.isCodFeeActive"
 [class.opacity-40]="!selectedZone.isCodFeeActive">
 <div class="space-y-1.5">
 <app-searchable-select
 [label]="'FINANCES.PRICING.FEE_TYPE'"
 [(ngModel)]="selectedZone.codFeeType"
 [options]="codFeeTypeOptions"
 [searchable]="false"
 [allowClear]="false"
 (selectionChange)="markDirty()">
 </app-searchable-select>
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
 class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pe-12 text-end text-[14px] font-black tabular-nums text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary disabled:bg-slate-50" />
 <span class="absolute end-4 top-1/2 -translate-y-1/2 text-[13px] font-black text-slate-400">%</span>
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
 class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pe-14 text-end text-[14px] font-black tabular-nums text-slate-900 outline-none transition-all focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary disabled:bg-slate-50" />
 <span class="absolute end-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">{{ 'FINANCES.CURRENCY' | translate }}</span>
 </div>
 </div>
 </div>
 </div>
 </app-card>

 <app-card variant="default" rounded="2xl" padding="none" customClass="flex h-full flex-col overflow-visible border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
 <div class="flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-slate-50/60 px-5 py-4">
 <div class="flex items-center gap-3">
 <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-100 bg-violet-50">
 <span class="material-symbols-outlined text-[20px] text-violet-600">account_balance</span>
 </div>
 <div>
 <h3 class="text-[15px] font-black text-slate-900">{{ 'FINANCES.PRICING.VAT_TITLE' | translate }}</h3>
 <p class="mt-0.5 text-[11px] font-bold text-slate-500">{{ 'FINANCES.PRICING.VAT_DESC' | translate }}</p>
 </div>
 </div>
 <button
 type="button"
 (click)="toggleVatActive()"
 class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zadna-primary focus:ring-offset-2"
 [ngClass]="selectedZone.isVatActive ? 'bg-zadna-primary' : 'bg-slate-200'">
 <span
 class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
 [ngClass]="selectedZone.isVatActive ? 'ltr:translate-x-5 rtl:-translate-x-5' : 'translate-x-0'"></span>
 </button>
 </div>

 <div
 class="flex flex-1 flex-col space-y-6 p-5 transition-opacity duration-200"
 [class.pointer-events-none]="!selectedZone.isVatActive"
 [class.opacity-40]="!selectedZone.isVatActive">
 <div>
 <div class="mb-1 text-3xl font-black text-zadna-primary tabular-nums">
 {{ selectedZone.vatPercent }}<span class="text-xl text-zadna-primary/70">%</span>
 </div>
 <p class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.PRICING.CURRENT_PERCENT' | translate }}</p>
 </div>

 <div class="mt-auto w-full">
 <input
 type="range"
 [ngModel]="selectedZone.vatPercent"
 (ngModelChange)="updateNumberField('vatPercent', $event)"
 min="0"
 max="25"
 step="1"
 class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-zadna-primary" />
 <div class="mt-2 flex justify-between text-[10px] font-bold text-slate-400 tabular-nums">
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
 private readonly cdr = inject(ChangeDetectorRef);
 private readonly financeService = inject(FinanceService);
 private readonly geographyService = inject(GeographyService);
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

 ngOnInit(): void {
 this.loadData();
 }

 get canSave(): boolean {
 return Boolean(this.selectedZone) && this.isDirty &&!this.isSaving;
 }

 get mappedRegionFilterOptions(): SearchableSelectOption[] {
 const regionOptions = this.regionOptions.map((region) => ({ label: region.label, value: region.id }));
 if (regionOptions.length <= 1) {
 return regionOptions;
 }

 return [
 { labelKey: 'FINANCES.PRICING.ALL_REGIONS', value: 'all' },
 ...regionOptions
 ];
 }

 get mappedZoneOptions(): SearchableSelectOption[] {
 return this.zones.map((zone) => ({
 label: this.itemDisplayLabel(zone),
 value: this.itemId(zone)
 }));
 }

 readonly codFeeTypeOptions: SearchableSelectOption[] = [
 { labelKey: 'FINANCES.PRICING.FLAT_FEE', value: 'flat' },
 { labelKey: 'FINANCES.PRICING.PERCENTAGE', value: 'percent' }
 ];

 loadData(): void {
 this.isLoading = true;
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

 this.saveScopePayload(payload);
 }

 togglePricingActive(): void {
 if (!this.selectedZone) {
 return;
 }

 this.selectedZone.isPricingActive =!this.selectedZone.isPricingActive;
 this.markDirty();
 }

 toggleCodActive(): void {
 if (!this.selectedZone) {
 return;
 }

 this.selectedZone.isCodFeeActive =!this.selectedZone.isCodFeeActive;
 this.markDirty();
 }

 toggleVatActive(): void {
 if (!this.selectedZone) {
 return;
 }

 this.selectedZone.isVatActive =!this.selectedZone.isVatActive;
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

 const translated = normalized.split(/\s+/).map((part) => this.zoneArabicMap[part] ?? part).join(' ').trim();

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
 this.cdr.markForCheck();
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

 return {...this.clone(zone),
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
 this.cdr.markForCheck();
 this.allItems = this.filterOperationalItems(Array.isArray(result) ? result : [result]);
 if (!this.allItems.length) {
 this.tryFallbackScope();
 return;
 }

 this.regionOptions = this.buildRegionOptions(this.allItems);
 this.selectedRegionFilter = this.resolveDefaultRegionFilter(this.regionOptions);
 this.applyFilters();
 this.emptyStateMessage = this.buildEmptyStateMessage();
 this.isDirty = false;
 this.isLoading = false;
 },
 error: (error: unknown) => {
 this.cdr.markForCheck();
 const message = describeApiError(error, this.translate, { fallbackKey: 'FINANCES.PRICING.SAVE_FAILED' });
 this.toastService.error(message, this.translate.instant('FINANCES.SHELL.ROUTES.PRICING.LABEL'));
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
 ? 'ما لقينا مناطق توصيل فعلية. تقدر تدير التسعير من مستوى المدينة أو المنطقة أو الإعدادات العامة.'
 : 'No delivery zones were found. You can manage pricing from cities, regions, or global defaults.';
 }

 if (this.selectedScope === 'city') {
 return this.translate.currentLang === 'ar'
 ? 'ما فيه مدن متوفرة لهذا الفلتر الحين. جرّب المنطقة أو الإعدادات العامة.'
 : 'No cities are available for the current filter. Try regions or global defaults.';
 }

 if (this.selectedScope === 'region') {
 return this.translate.currentLang === 'ar'
 ? 'ما فيه مناطق إدارية متوفرة الحين. تقدر تستخدم الإعدادات العامة.'
 : 'No administrative regions are available right now. You can use global defaults.';
 }

 return this.translate.currentLang === 'ar'
 ? 'ما فيه إعدادات تسعير متوفرة الحين.'
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
 this.cdr.markForCheck();
 const id = this.itemId(savedItem);
 const allIndex = this.allItems.findIndex((item) => this.itemId(item) === id);
 if (allIndex >= 0) {
 this.allItems[allIndex] = this.clone(savedItem);
 } else {
 this.allItems = [this.clone(savedItem),...this.allItems];
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
 this.cdr.markForCheck();
 this.isSaving = false;
 this.toastService.error(
 describeApiError(error, this.translate, { fallbackKey: 'FINANCES.PRICING.SAVE_FAILED' }),
 this.translate.instant('FINANCES.SHELL.ROUTES.PRICING.LABEL')
 );
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

 private filterOperationalItems(items: PricingSettingsItem[]): PricingSettingsItem[] {
 if (this.selectedScope === 'global') {
 return items;
 }

 return items.filter((item) => {
 if (!('regionCode' in item) || !item.regionCode) {
 return this.selectedScope === 'zone' ? false : true;
 }

 return this.geographyService.isOperationalRegionCode(item.regionCode);
 });
 }

 private resolveDefaultRegionFilter(regions: Array<{ id: string; label: string }>): string {
 if (!regions.length) {
 return 'all';
 }

 if (regions.length === 1) {
 return regions[0].id;
 }

 const easternFromItems = this.allItems.find((item) =>
 'regionCode' in item && this.geographyService.isOperationalRegionCode(item.regionCode) && 'regionId' in item && !!item.regionId
 );

 if (easternFromItems && 'regionId' in easternFromItems && easternFromItems.regionId) {
 return easternFromItems.regionId;
 }

 return regions[0].id;
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

 private clone<T>(value: T): T {
 return JSON.parse(JSON.stringify(value)) as T;
 }

 private normalizeLookupKey(value: string): string {
 return value.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
 }

 private containsArabic(value: string): boolean {
 return /[\u0600-\u06FF]/.test(value);
 }
}
