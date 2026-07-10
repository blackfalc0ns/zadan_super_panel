import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
 MarketingCoupon,
 MarketingCouponPayload,
 MarketingCouponUpdatePayload
} from '@marketing/models/marketing.models';
import { MarketingApiService } from '@marketing/services/marketing.api.service';
import {
 describeApiError,
 formatDateTime,
 toDateTimeLocalInput,
 toNullableUtcIso
} from '@marketing/utils/marketing-date.utils';
import { MarketingScheduleCellComponent } from '@marketing/components/marketing-schedule-cell/marketing-schedule-cell.component';
import { Vendor } from '@vendors/models/vendors.domain.models';
import { VendorService } from '@vendors/services/vendor.api.service';
import { DeleteConfirmationModalComponent } from '@shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { DataTableComponent, TableColumn } from '@shared/components/ui/data-table/data-table.component';
import { StatusPillComponent } from '@shared/components/ui/status-pill/status-pill.component';
import { AppPaginationComponent } from '@shared/components/ui/pagination/pagination.component';
import { ToastService } from '@shared/services/toast.service';
import { SearchableSelectComponent, SearchableSelectOption } from '@shared/components/ui/form-controls/select/searchable-select.component';

interface CouponFormValue {
 code: string;
 title: string;
 discountType: 'Fixed' | 'Percentage';
 discountValue: number | null;
 minOrderAmount: number | null;
 maxDiscountAmount: number | null;
 startsAtLocal: string;
 endsAtLocal: string;
 usageLimit: number | null;
 perUserLimit: number | null;
 isActive: boolean;
 applyToAllVendors: boolean;
 vendorIds: string[];
}

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-marketing-coupons',
 standalone: true,
 imports: [CommonModule, FormsModule, TranslateModule, StatusPillComponent, DeleteConfirmationModalComponent, DataTableComponent, SearchableSelectComponent, MarketingScheduleCellComponent, AppPaginationComponent],
 template: `
 <div class="space-y-6">
 <div class="flex flex-wrap items-center justify-between gap-4">
 <div class="flex w-full max-w-3xl flex-wrap items-center gap-3">
 <div class="relative min-w-[16rem] flex-1">
 <span class="material-symbols-outlined pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
 <input
 [(ngModel)]="searchTerm"
 (ngModelChange)="onSearchChange()"
 type="text"
 [placeholder]="'MARKETING.COUPONS.SEARCH_PLACEHOLDER' | translate"
 class="h-11 w-full rounded-xl border border-slate-200 bg-white ps-12 pe-4 text-sm font-bold text-slate-700 outline-none transition focus:border-zadna-primary focus:ring-4 focus:ring-zadna-primary/10" />
 </div>

 <app-searchable-select
 [(ngModel)]="statusFilter"
 (ngModelChange)="onSearchChange()"
 [options]="translatedStatusOptions"
 [searchable]="false"
 [allowClear]="false"
 customClass="min-w-[10rem]">
 </app-searchable-select>
 </div>

 <div class="flex items-center gap-3">
 <button
 type="button"
 (click)="loadCoupons()"
 [disabled]="loading"
 class="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
 <span class="material-symbols-outlined text-[18px]" [class.opacity-40]="loading">refresh</span>
 {{ 'MARKETING.ACTIONS.REFRESH' | translate }}
 </button>

 <button
 type="button"
 (click)="openCreate()"
 class="flex h-11 items-center gap-2 rounded-xl bg-zadna-primary px-5 text-sm font-bold text-white transition hover:bg-zadna-primary/90">
 <span class="material-symbols-outlined text-[18px]">add</span>
 {{ 'MARKETING.COUPONS.ACTIONS.ADD_NEW' | translate }}
 </button>
 </div>
 </div>

 <div *ngIf="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
 {{ error }}
 </div>

 <app-data-table
 [data]="paginatedCoupons"
 [columns]="tableColumns"
 [isLoading]="loading"
 [emptyStateIcon]="'sell'"
 [emptyStateActionLabel]="'MARKETING.COUPONS.ACTIONS.ADD_NEW' | translate"
 [emptyStateTitle]="'MARKETING.COUPONS.MESSAGES.EMPTY_TITLE' | translate"
 [emptyStateMessage]="'MARKETING.COUPONS.MESSAGES.EMPTY_SUBTITLE' | translate"
 [containerClass]="'bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/70 shadow-sm'"
 (emptyStateAction)="openCreate()">
 <ng-template #customColumn let-coupon let-column="column">
 <ng-container *ngIf="column.key === 'code'">
 <div class="flex flex-col text-start">
 <span class="text-[13px] font-black text-slate-900">{{ coupon.code }}</span>
 <span class="mt-1 text-[11px] font-bold text-slate-500">{{ coupon.title }}</span>
 </div>
 </ng-container>

 <ng-container *ngIf="column.key === 'discount'">
 <div class="flex flex-col text-start">
 <span class="text-[13px] font-black text-slate-900">{{ formatDiscount(coupon) }}</span>
 <span class="mt-1 text-[11px] font-bold text-slate-500">{{ formatOrderConstraint(coupon) }}</span>
 </div>
 </ng-container>

 <ng-container *ngIf="column.key === 'vendors'">
 <div class="flex flex-col text-start">
 <span class="text-[13px] font-black text-slate-900">{{ coupon.assignedVendorsCount }}</span>
 <span class="mt-1 text-[11px] font-bold text-slate-500">{{ formatVendorNames(coupon) }}</span>
 </div>
 </ng-container>

 <ng-container *ngIf="column.key === 'schedule'">
 <div class="flex flex-col gap-1 text-start">
 <app-marketing-schedule-cell
 [startsAtUtc]="coupon.startsAtUtc"
 [endsAtUtc]="coupon.endsAtUtc">
 </app-marketing-schedule-cell>
 <span class="text-[10px] font-bold text-slate-400">
 {{ 'MARKETING.COUPONS.TABLE.LAST_UPDATE' | translate }} {{ formatDateTimeLabel(coupon.updatedAtUtc) }}
 </span>
 </div>
 </ng-container>

 <ng-container *ngIf="column.key === 'status'">
 <div class="flex justify-start">
 <app-status-pill
 [label]="(coupon.isActive ? 'MARKETING.VISIBILITY.ENABLED' : 'MARKETING.VISIBILITY.DISABLED') | translate"
 [variant]="coupon.isActive ? 'success' : 'neutral'"
 size="sm">
 </app-status-pill>
 </div>
 </ng-container>

 <ng-container *ngIf="column.key === 'actions'">
 <div class="flex justify-end gap-1.5" (click)="$event.stopPropagation()">
 <button
 type="button"
 class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-colors hover:bg-zadna-primary/10 hover:text-zadna-primary"
 (click)="openEdit(coupon.id)"
 [title]="'MARKETING.ACTIONS.EDIT' | translate">
 <span class="material-symbols-outlined text-[18px]">edit</span>
 </button>

 <button
 type="button"
 class="flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
 [ngClass]="coupon.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'"
 (click)="toggleStatus(coupon)"
 [disabled]="togglingCouponId === coupon.id"
 [title]="(coupon.isActive ? 'MARKETING.ACTIONS.DEACTIVATE' : 'MARKETING.ACTIONS.ACTIVATE') | translate">
 <span *ngIf="togglingCouponId === coupon.id" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
 <span *ngIf="togglingCouponId!== coupon.id" class="material-symbols-outlined text-[18px]">{{ coupon.isActive ? 'pause' : 'play_arrow' }}</span>
 </button>

 <button
 type="button"
 class="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-100"
 (click)="promptDelete(coupon)"
 [title]="'MARKETING.COUPONS.MESSAGES.DELETE_TITLE' | translate">
 <span class="material-symbols-outlined text-[18px]">delete</span>
 </button>
 </div>
 </ng-container>
 </ng-template>

 <ng-template #mobileCard let-coupon>
 <div class="space-y-4">
 <div class="flex items-start justify-between gap-3">
 <div class="min-w-0">
 <div class="truncate text-sm font-black text-slate-900">{{ coupon.code }}</div>
 <div class="mt-1 text-xs font-bold text-slate-500">{{ coupon.title }}</div>
 </div>

 <app-status-pill
 [label]="(coupon.isActive ? 'MARKETING.VISIBILITY.ENABLED' : 'MARKETING.VISIBILITY.DISABLED') | translate"
 [variant]="coupon.isActive ? 'success' : 'neutral'"
 size="sm">
 </app-status-pill>
 </div>

 <div class="grid grid-cols-2 gap-3 text-xs font-bold text-slate-600">
 <div class="rounded-2xl bg-slate-50 px-3 py-2">
 <div class="text-[10px] text-slate-400">{{ 'MARKETING.COUPONS.TABLE.DISCOUNT' | translate }}</div>
 <div class="mt-1 text-slate-800">{{ formatDiscount(coupon) }}</div>
 </div>

 <div class="rounded-2xl bg-slate-50 px-3 py-2">
 <div class="text-[10px] text-slate-400">{{ 'MARKETING.COUPONS.TABLE.VENDORS' | translate }}</div>
 <div class="mt-1 text-slate-800">{{ coupon.assignedVendorsCount }}</div>
 </div>
 </div>

 <div class="space-y-2 text-xs font-bold text-slate-500">
 <div>{{ formatOrderConstraint(coupon) }}</div>
 <app-marketing-schedule-cell
 [startsAtUtc]="coupon.startsAtUtc"
 [endsAtUtc]="coupon.endsAtUtc">
 </app-marketing-schedule-cell>
 </div>

 <div class="flex flex-wrap justify-end gap-2">
 <button
 type="button"
 class="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700"
 (click)="openEdit(coupon.id)">
 {{ 'MARKETING.ACTIONS.EDIT' | translate }}
 </button>

 <button
 type="button"
 class="rounded-xl px-3 py-2 text-xs font-black"
 [ngClass]="coupon.isActive ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'"
 [disabled]="togglingCouponId === coupon.id"
 (click)="toggleStatus(coupon)">
 <span *ngIf="togglingCouponId === coupon.id" class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
 <ng-container *ngIf="togglingCouponId!== coupon.id">{{ (coupon.isActive ? 'MARKETING.ACTIONS.DEACTIVATE' : 'MARKETING.ACTIONS.ACTIVATE') | translate }}</ng-container>
 </button>

 <button
 type="button"
 class="rounded-xl bg-red-100 px-3 py-2 text-xs font-black text-red-700"
 (click)="promptDelete(coupon)">
 {{ 'MARKETING.ACTIONS.DELETE' | translate }}
 </button>
 </div>
 </div>
 </ng-template>
 </app-data-table>

 <div class="pt-6 animate-in fade-in duration-700 slide-in-from-bottom-5">
 <app-pagination
 *ngIf="!loading && totalItems > 0"
 [currentPage]="page"
 [pageSize]="pageSize"
 [totalItems]="totalItems"
 (pageChange)="changePage($event)">
 </app-pagination>
 </div>
 </div>

 <div *ngIf="isModalOpen" class="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm">
 <div class="relative my-6 w-full max-w-5xl rounded-[2rem] bg-white shadow-2xl">
 <div *ngIf="loadingCouponDetails" class="absolute inset-0 z-10 flex items-center justify-center rounded-[2rem] bg-white/80 backdrop-blur-sm">
 <div class="flex flex-col items-center gap-3">
 <span class="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-zadna-primary border-t-transparent"></span>
 <span class="text-sm font-bold text-slate-600">{{ 'MARKETING.COUPONS.ACTIONS.LOADING' | translate }}</span>
 </div>
 </div>

 <div class="flex items-center justify-between border-b border-slate-100 px-6 py-5">
 <div>
 <h3 class="text-xl font-black text-slate-900">{{ (selectedCoupon ? 'MARKETING.COUPONS.MODAL.EDIT_TITLE' : 'MARKETING.COUPONS.MODAL.CREATE_TITLE') | translate }}</h3>
 <p class="mt-1 text-sm font-bold text-slate-500">{{ 'MARKETING.COUPONS.MODAL.SUBTITLE' | translate }}</p>
 </div>

 <button
 type="button"
 (click)="closeModal()"
 [disabled]="saving || loadingCouponDetails"
 class="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
 <span class="material-symbols-outlined">close</span>
 </button>
 </div>

 <form (ngSubmit)="saveCoupon()" class="space-y-6 px-6 py-6">
 <div class="grid gap-5 lg:grid-cols-2">
 <label class="space-y-2">
 <span class="text-sm font-black text-slate-700">{{ 'MARKETING.COUPONS.FIELDS.CODE' | translate }}</span>
 <input [(ngModel)]="form.code" name="code" type="text" placeholder="WELCOME20"
 class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-zadna-primary focus:ring-4 focus:ring-zadna-primary/10" />
 </label>

 <label class="space-y-2">
 <span class="text-sm font-black text-slate-700">{{ 'MARKETING.COUPONS.FIELDS.TITLE' | translate }}</span>
 <input [(ngModel)]="form.title" name="title" type="text" [placeholder]="'MARKETING.COUPONS.MESSAGES.TITLE_PLACEHOLDER' | translate"
 class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-zadna-primary focus:ring-4 focus:ring-zadna-primary/10" />
 </label>

 <label class="space-y-2">
 <span class="text-sm font-black text-slate-700">{{ 'MARKETING.COUPONS.FIELDS.DISCOUNT_TYPE' | translate }}</span>
 <app-searchable-select
 [(ngModel)]="form.discountType"
 [options]="translatedDiscountTypeOptions"
 [searchable]="false"
 [allowClear]="false">
 </app-searchable-select>
 </label>

 <label class="space-y-2">
 <span class="text-sm font-black text-slate-700">{{ 'MARKETING.COUPONS.FIELDS.DISCOUNT_VALUE' | translate }}</span>
 <input [(ngModel)]="form.discountValue" name="discountValue" type="number" min="0" step="0.01"
 class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-zadna-primary focus:ring-4 focus:ring-zadna-primary/10" />
 </label>

 <label class="space-y-2">
 <span class="text-sm font-black text-slate-700">{{ 'MARKETING.COUPONS.FIELDS.MIN_ORDER' | translate }}</span>
 <input [(ngModel)]="form.minOrderAmount" name="minOrderAmount" type="number" min="0" step="0.01"
 class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-zadna-primary focus:ring-4 focus:ring-zadna-primary/10" />
 </label>

 <label class="space-y-2">
 <span class="text-sm font-black text-slate-700">{{ 'MARKETING.COUPONS.FIELDS.MAX_DISCOUNT' | translate }}</span>
 <input [(ngModel)]="form.maxDiscountAmount" name="maxDiscountAmount" type="number" min="0" step="0.01" [disabled]="form.discountType!== 'Percentage'"
 class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-zadna-primary focus:ring-4 focus:ring-zadna-primary/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400" />
 </label>

 <label class="space-y-2">
 <span class="text-sm font-black text-slate-700">{{ 'MARKETING.COUPONS.FIELDS.STARTS_AT' | translate }}</span>
 <input [(ngModel)]="form.startsAtLocal" name="startsAtLocal" type="datetime-local"
 class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-zadna-primary focus:ring-4 focus:ring-zadna-primary/10" />
 </label>

 <label class="space-y-2">
 <span class="text-sm font-black text-slate-700">{{ 'MARKETING.COUPONS.FIELDS.ENDS_AT' | translate }}</span>
 <input [(ngModel)]="form.endsAtLocal" name="endsAtLocal" type="datetime-local"
 class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-zadna-primary focus:ring-4 focus:ring-zadna-primary/10" />
 </label>

 <label class="space-y-2">
 <span class="text-sm font-black text-slate-700">{{ 'MARKETING.COUPONS.FIELDS.USAGE_LIMIT' | translate }}</span>
 <input [(ngModel)]="form.usageLimit" name="usageLimit" type="number" min="0" step="1"
 class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-zadna-primary focus:ring-4 focus:ring-zadna-primary/10" />
 </label>

 <label class="space-y-2">
 <span class="text-sm font-black text-slate-700">{{ 'MARKETING.COUPONS.FIELDS.PER_USER_LIMIT' | translate }}</span>
 <input [(ngModel)]="form.perUserLimit" name="perUserLimit" type="number" min="0" step="1"
 class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-zadna-primary focus:ring-4 focus:ring-zadna-primary/10" />
 </label>
 </div>

 <label *ngIf="selectedCoupon" class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
 <input [(ngModel)]="form.isActive" name="isActive" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-zadna-primary focus:ring-zadna-primary/20" />
 <span class="text-sm font-black text-slate-700">{{ 'MARKETING.COUPONS.FIELDS.IS_ACTIVE' | translate }}</span>
 </label>

 <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
 <label class="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
 <input
 [(ngModel)]="form.applyToAllVendors"
 name="applyToAllVendors"
 type="checkbox"
 class="h-4 w-4 rounded border-slate-300 text-zadna-primary focus:ring-zadna-primary/20" />
 <div>
 <div class="text-sm font-black text-slate-800">{{ 'MARKETING.COUPONS.FIELDS.APPLY_ALL_VENDORS' | translate }}</div>
 <div class="mt-1 text-xs font-bold text-slate-500">{{ 'MARKETING.COUPONS.FIELDS.APPLY_ALL_DESC' | translate }}</div>
 </div>
 </label>

 <div class="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h4 class="text-base font-black text-slate-900">{{ 'MARKETING.COUPONS.FIELDS.BENEFICIARY_VENDORS' | translate }}</h4>
 <p class="mt-1 text-sm font-bold text-slate-500">{{ 'MARKETING.COUPONS.FIELDS.BENEFICIARY_DESC' | translate }}</p>
 </div>

 <input
 [(ngModel)]="vendorSearchTerm"
 name="vendorSearchTerm"
 type="text"
 [placeholder]="'MARKETING.COUPONS.FIELDS.VENDOR_SEARCH' | translate"
 [disabled]="form.applyToAllVendors"
 class="h-11 min-w-[14rem] rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-zadna-primary focus:ring-4 focus:ring-zadna-primary/10" />
 </div>

 <div class="mt-4 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white"
 [class.pointer-events-none]="form.applyToAllVendors"
 [class.opacity-60]="form.applyToAllVendors">
 <label *ngFor="let vendor of filteredVendors" class="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50">
 <input type="checkbox" [checked]="isVendorSelected(vendor.id)" (change)="toggleVendorSelection(vendor.id)" [disabled]="form.applyToAllVendors"
 class="h-4 w-4 rounded border-slate-300 text-zadna-primary focus:ring-zadna-primary/20" />
 <div class="min-w-0">
 <div class="truncate text-sm font-black text-slate-800">{{ vendor.businessNameAr || vendor.businessNameEn }}</div>
 <div class="mt-1 truncate text-xs font-bold text-slate-400">{{ vendor.businessNameEn || vendor.businessNameAr }}</div>
 </div>
 </label>

 <div *ngIf="filteredVendors.length === 0" class="px-4 py-8 text-center text-sm font-bold text-slate-400">
 {{ 'MARKETING.COUPONS.MESSAGES.NO_VENDORS_MATCH' | translate }}
 </div>
 </div>

 <div class="mt-4 flex flex-wrap gap-2">
 <button
 type="button"
 (click)="selectAllVisibleVendors()"
 [disabled]="form.applyToAllVendors"
 class="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 transition hover:border-zadna-primary hover:text-zadna-primary">
 {{ 'MARKETING.COUPONS.ACTIONS.SELECT_VISIBLE' | translate }}
 </button>

 <button
 type="button"
 (click)="clearVendorSelection()"
 [disabled]="form.applyToAllVendors"
 class="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 transition hover:border-red-200 hover:text-red-600">
 {{ 'MARKETING.COUPONS.ACTIONS.CLEAR_SELECTION' | translate }}
 </button>
 </div>
 </div>

 <div *ngIf="modalError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
 {{ modalError }}
 </div>

 <div class="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">
 <button
 type="button"
 (click)="closeModal()"
 [disabled]="saving || loadingCouponDetails"
 class="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
 {{ 'MARKETING.COUPONS.ACTIONS.CANCEL' | translate }}
 </button>

 <button
 type="submit"
 [disabled]="saving || loadingCouponDetails"
 class="flex h-11 min-w-[8.5rem] items-center justify-center gap-2 rounded-xl bg-zadna-primary px-5 text-sm font-bold text-white transition hover:bg-zadna-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
 <span *ngIf="saving" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
 {{ (saving ? 'MARKETING.ACTIONS.SAVING' : 'MARKETING.COUPONS.ACTIONS.SAVE') | translate }}
 </button>
 </div>
 </form>
 </div>
 </div>

 <app-delete-confirmation-modal
 [isOpen]="deleteTarget!== null"
 [isLoading]="deleting"
 [title]="'MARKETING.COUPONS.MESSAGES.DELETE_TITLE' | translate"
 [message]="'MARKETING.COUPONS.MESSAGES.DELETE_MESSAGE' | translate"
 (close)="onDeleteModalClose()"
 (confirm)="confirmDelete()">
 </app-delete-confirmation-modal>
 `
})
export class MarketingCouponsComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
 coupons: MarketingCoupon[] = [];
 vendors: Vendor[] = [];
 loading = false;
 saving = false;
 loadingCouponDetails = false;
 deleting = false;
 togglingCouponId: string | null = null;
 error = '';
 modalError = '';
 searchTerm = '';
 vendorSearchTerm = '';
 statusFilter: 'all' | 'active' | 'inactive' = 'all';
 page = 1;
 pageSize = 10;
 isModalOpen = false;
 selectedCoupon: MarketingCoupon | null = null;
 deleteTarget: MarketingCoupon | null = null;

 readonly tableColumns: TableColumn[] = [
 { key: 'code', title: 'MARKETING.COUPONS.TABLE.COUPON', type: 'custom', width: '18rem', align: 'left' },
 { key: 'discount', title: 'MARKETING.COUPONS.TABLE.DISCOUNT', type: 'custom', width: '14rem', align: 'left' },
 { key: 'vendors', title: 'MARKETING.COUPONS.TABLE.VENDORS', type: 'custom', width: '16rem', align: 'left' },
 { key: 'schedule', title: 'MARKETING.COUPONS.TABLE.SCHEDULE', type: 'custom', width: '18rem', align: 'left' },
 { key: 'status', title: 'MARKETING.COUPONS.TABLE.STATUS', type: 'custom', width: '8rem', align: 'left' },
 { key: 'actions', title: 'MARKETING.COUPONS.TABLE.ACTIONS', type: 'custom', width: '10rem', align: 'right' }
 ];

 form: CouponFormValue = this.createEmptyForm();

 constructor(
 private readonly marketingApi: MarketingApiService,
 private readonly vendorService: VendorService,
 private readonly toastService: ToastService,
 private readonly translateService: TranslateService
 ) {}

 get translatedStatusOptions(): SearchableSelectOption[] {
 return [
 { label: this.translateService.instant('MARKETING.COUPONS.STATUS_OPTIONS.ALL'), value: 'all' },
 { label: this.translateService.instant('MARKETING.COUPONS.STATUS_OPTIONS.ACTIVE'), value: 'active' },
 { label: this.translateService.instant('MARKETING.COUPONS.STATUS_OPTIONS.INACTIVE'), value: 'inactive' }
 ];
 }

 get translatedDiscountTypeOptions(): SearchableSelectOption[] {
 return [
 { label: this.translateService.instant('MARKETING.COUPONS.DISCOUNT_TYPES.FIXED'), value: 'Fixed' },
 { label: this.translateService.instant('MARKETING.COUPONS.DISCOUNT_TYPES.PERCENTAGE'), value: 'Percentage' }
 ];
 }

 get filteredCoupons(): MarketingCoupon[] {
 const query = this.searchTerm.trim().toLocaleLowerCase();

 return this.coupons.filter((coupon) => {
 const matchesStatus =
 this.statusFilter === 'all' ||
 (this.statusFilter === 'active' && coupon.isActive) ||
 (this.statusFilter === 'inactive' &&!coupon.isActive);

 if (!matchesStatus) {
 return false;
 }

 if (!query) {
 return true;
 }

 const vendorNames = coupon.applicableVendors.flatMap((vendor) => [vendor.vendorNameAr, vendor.vendorNameEn]);
 return [coupon.code, coupon.title,...vendorNames].filter((value): value is string => Boolean(value)).some((value) => value.toLocaleLowerCase().includes(query));
 });
 }

 get totalItems(): number {
 return this.filteredCoupons.length;
 }

 get paginatedCoupons(): MarketingCoupon[] {
 const start = (this.page - 1) * this.pageSize;
 return this.filteredCoupons.slice(start, start + this.pageSize);
 }

 onSearchChange(): void {
 this.page = 1;
 }

 changePage(newPage: number): void {
 this.page = newPage;
 }

 get filteredVendors(): Vendor[] {
 const query = this.vendorSearchTerm.trim().toLocaleLowerCase();
 if (!query) {
 return this.vendors;
 }

 return this.vendors.filter((vendor) =>
 [vendor.businessNameAr, vendor.businessNameEn].filter((value): value is string => Boolean(value)).some((value) => value.toLocaleLowerCase().includes(query))
 );
 }

 ngOnInit(): void {
 this.loadCoupons();
 this.loadVendors();
 }

 loadCoupons(): void {
 this.loading = true;
 this.error = '';

 this.marketingApi.getCoupons().subscribe({
 next: (coupons) => {
 this.cdr.markForCheck();
 this.coupons = [...coupons].sort((left, right) => right.updatedAtUtc.localeCompare(left.updatedAtUtc));
 this.loading = false;
 },
 error: (error) => {
 this.cdr.markForCheck();
 this.loading = false;
 this.error = this.getCouponErrorMessage(error);
 }
 });
 }

 loadVendors(): void {
 this.vendorService.getVendors(1, 200).subscribe({
 next: (response) => {
 this.cdr.markForCheck();
 this.vendors = [...response.items].sort((left, right) =>
 (left.businessNameAr || left.businessNameEn).localeCompare(right.businessNameAr || right.businessNameEn)
 );
 },
 error: () => {
 this.cdr.markForCheck();
 this.vendors = [];
 }
 });
 }

 openCreate(): void {
 this.selectedCoupon = null;
 this.modalError = '';
 this.vendorSearchTerm = '';
 this.form = this.createEmptyForm();
 this.isModalOpen = true;
 }

 openEdit(id: string): void {
 this.loadingCouponDetails = true;
 this.modalError = '';
 this.isModalOpen = true;
 this.selectedCoupon = null;
 this.form = this.createEmptyForm();

 this.marketingApi.getCouponById(id).subscribe({
 next: (coupon) => {
 this.cdr.markForCheck();
 this.selectedCoupon = coupon;
 this.form = {
 code: coupon.code,
 title: coupon.title,
 discountType: coupon.discountType,
 discountValue: coupon.discountValue,
 minOrderAmount: coupon.minOrderAmount ?? null,
 maxDiscountAmount: coupon.maxDiscountAmount ?? null,
 startsAtLocal: toDateTimeLocalInput(coupon.startsAtUtc),
 endsAtLocal: toDateTimeLocalInput(coupon.endsAtUtc),
 usageLimit: coupon.usageLimit ?? null,
 perUserLimit: coupon.perUserLimit ?? null,
 isActive: coupon.isActive,
 applyToAllVendors: coupon.assignedVendorsCount === 0,
 vendorIds: coupon.applicableVendors.map((vendor) => vendor.vendorId)
 };
 this.vendorSearchTerm = '';
 this.loadingCouponDetails = false;
 },
 error: (error) => {
 this.cdr.markForCheck();
 this.loadingCouponDetails = false;
 this.isModalOpen = false;
 this.toastService.error(this.getCouponErrorMessage(error), this.translateService.instant('MARKETING.TABS.COUPONS'));
 }
 });
 }

 closeModal(): void {
 if (this.saving || this.loadingCouponDetails) {
 return;
 }

 this.isModalOpen = false;
 this.selectedCoupon = null;
 this.modalError = '';
 this.vendorSearchTerm = '';
 this.form = this.createEmptyForm();
 }

 onDeleteModalClose(): void {
 if (this.deleting) {
 return;
 }

 this.deleteTarget = null;
 }

 saveCoupon(): void {
 const validationMessage = this.validateCouponForm();
 if (validationMessage) {
 this.modalError = validationMessage;
 return;
 }

 this.saving = true;

 const payload = this.toPayload();
 const request$ = this.selectedCoupon
 ? this.marketingApi.updateCoupon(this.selectedCoupon.id, {...payload, isActive: this.form.isActive })
 : this.marketingApi.createCoupon(payload);

 request$.subscribe({
 next: () => {
 this.cdr.markForCheck();
 this.saving = false;
 const wasEditing = Boolean(this.selectedCoupon);
 this.closeModal();
 this.loadCoupons();
 this.toastService.success(
 wasEditing 
 ? this.translateService.instant('MARKETING.COUPONS.MESSAGES.UPDATED') 
 : this.translateService.instant('MARKETING.COUPONS.MESSAGES.CREATED'), 
 this.translateService.instant('MARKETING.SHELL.TITLE')
 );
 },
 error: (error) => {
 this.cdr.markForCheck();
 this.saving = false;
 this.modalError = this.getCouponErrorMessage(error);
 }
 });
 }

 toggleStatus(coupon: MarketingCoupon): void {
 if (this.togglingCouponId) {
 return;
 }

 this.togglingCouponId = coupon.id;
 const request$ = coupon.isActive
 ? this.marketingApi.deactivateCoupon(coupon.id)
 : this.marketingApi.activateCoupon(coupon.id);

 request$.subscribe({
 next: () => {
 this.cdr.markForCheck();
 this.togglingCouponId = null;
 this.toastService.success(
 coupon.isActive 
 ? this.translateService.instant('MARKETING.COUPONS.MESSAGES.DEACTIVATED') 
 : this.translateService.instant('MARKETING.COUPONS.MESSAGES.ACTIVATED'), 
 this.translateService.instant('MARKETING.SHELL.TITLE')
 );
 this.loadCoupons();
 },
 error: (error) => {
 this.cdr.markForCheck();
 this.togglingCouponId = null;
 this.toastService.error(this.getCouponErrorMessage(error), this.translateService.instant('MARKETING.TABS.COUPONS'));
 }
 });
 }

 promptDelete(coupon: MarketingCoupon): void {
 this.deleteTarget = coupon;
 }

 confirmDelete(): void {
 if (!this.deleteTarget) {
 return;
 }

 this.deleting = true;
 this.marketingApi.deleteCoupon(this.deleteTarget.id).subscribe({
 next: () => {
 this.cdr.markForCheck();
 this.deleting = false;
 this.deleteTarget = null;
 this.toastService.success(this.translateService.instant('MARKETING.COUPONS.MESSAGES.DELETED'), this.translateService.instant('MARKETING.SHELL.TITLE'));
 this.loadCoupons();
 },
 error: (error) => {
 this.cdr.markForCheck();
 this.deleting = false;
 this.toastService.error(this.getCouponErrorMessage(error), this.translateService.instant('MARKETING.TABS.COUPONS'));
 }
 });
 }

 isVendorSelected(vendorId: string): boolean {
 return this.form.vendorIds.includes(vendorId);
 }

 toggleVendorSelection(vendorId: string): void {
 this.form.vendorIds = this.isVendorSelected(vendorId)
 ? this.form.vendorIds.filter((id) => id!== vendorId)
 : [...this.form.vendorIds, vendorId];
 }

 selectAllVisibleVendors(): void {
 const visibleIds = this.filteredVendors.map((vendor) => vendor.id);
 this.form.vendorIds = Array.from(new Set([...this.form.vendorIds,...visibleIds]));
 }

 clearVendorSelection(): void {
 this.form.vendorIds = [];
 }

 formatDiscount(coupon: MarketingCoupon): string {
 const currency = this.translateService.instant('COMMON.CURRENCY');
 return coupon.discountType === 'Percentage'
 ? `${coupon.discountValue}%`
 : `${coupon.discountValue.toFixed(2)} ${currency}`;
 }

 formatOrderConstraint(coupon: MarketingCoupon): string {
 const parts: string[] = [];
 const currency = this.translateService.instant('COMMON.CURRENCY');

 if (coupon.minOrderAmount) {
 parts.push(`${this.translateService.instant('MARKETING.COUPONS.TABLE.MIN_ORDER')} ${coupon.minOrderAmount.toFixed(2)} ${currency}`);
 }

 if (coupon.discountType === 'Percentage' && coupon.maxDiscountAmount) {
 parts.push(`${this.translateService.instant('MARKETING.COUPONS.TABLE.MAX_DISCOUNT')} ${coupon.maxDiscountAmount.toFixed(2)} ${currency}`);
 }

 return parts.join(' • ') || this.translateService.instant('MARKETING.COUPONS.TABLE.NO_CONSTRAINTS');
 }

 formatVendorNames(coupon: MarketingCoupon): string {
 if (coupon.applicableVendors.length === 0) {
 return this.translateService.instant('MARKETING.COUPONS.TABLE.ALL_VENDORS');
 }

 const names = coupon.applicableVendors.slice(0, 2).map((vendor) => vendor.vendorNameAr || vendor.vendorNameEn).join('، ');

 return coupon.applicableVendors.length > 2 ? `${names} +${coupon.applicableVendors.length - 2}` : names;
 }

 formatDateTimeLabel(value: string): string {
 return formatDateTime(value);
 }

 private createEmptyForm(): CouponFormValue {
 return {
 code: '',
 title: '',
 discountType: 'Fixed',
 discountValue: null,
 minOrderAmount: null,
 maxDiscountAmount: null,
 startsAtLocal: '',
 endsAtLocal: '',
 usageLimit: null,
 perUserLimit: null,
 isActive: true,
 applyToAllVendors: true,
 vendorIds: []
 };
 }

 private validateCouponForm(): string {
 this.modalError = '';

 if (!this.form.code.trim()) {
 return this.translateService.instant('MARKETING.COUPONS.MESSAGES.REQUIRED_CODE');
 }

 if (!this.form.title.trim()) {
 return this.translateService.instant('MARKETING.COUPONS.MESSAGES.REQUIRED_TITLE');
 }

 if (!this.form.discountValue || this.form.discountValue <= 0) {
 return this.translateService.instant('MARKETING.COUPONS.MESSAGES.DISCOUNT_GT_ZERO');
 }

 if (this.form.discountType === 'Percentage' && this.form.discountValue > 100) {
 return this.translateService.instant('MARKETING.COUPONS.MESSAGES.PERCENT_MAX');
 }

 if (this.form.startsAtLocal && this.form.endsAtLocal) {
 const start = new Date(this.form.startsAtLocal);
 const end = new Date(this.form.endsAtLocal);
 if (!Number.isNaN(start.getTime()) &&!Number.isNaN(end.getTime()) && end <= start) {
 return this.translateService.instant('MARKETING.COUPONS.MESSAGES.INVALID_DATE_RANGE');
 }
 }

 if (this.form.usageLimit!= null && this.form.usageLimit <= 0) {
 return this.translateService.instant('MARKETING.COUPONS.MESSAGES.USAGE_LIMIT_GT_ZERO');
 }

 if (this.form.perUserLimit!= null && this.form.perUserLimit <= 0) {
 return this.translateService.instant('MARKETING.COUPONS.MESSAGES.USAGE_LIMIT_GT_ZERO');
 }

 if (
 this.form.usageLimit!= null &&
 this.form.perUserLimit!= null &&
 this.form.perUserLimit > this.form.usageLimit
 ) {
 return this.translateService.instant('MARKETING.COUPONS.MESSAGES.PER_USER_LIMIT_EXCEEDS_USAGE');
 }

 if (!this.form.applyToAllVendors && this.form.vendorIds.length === 0) {
 return this.translateService.instant('MARKETING.COUPONS.MESSAGES.VENDORS_REQUIRED');
 }

 return '';
 }

 private getCouponErrorMessage(error: unknown): string {
 const message = describeApiError(error).trim();
 const normalized = message.toLowerCase();

 if (
 normalized.includes('coupon code already exists') ||
 normalized.includes('duplicate_coupon_code')
 ) {
 return this.translateService.instant('MARKETING.COUPONS.MESSAGES.DUPLICATE_CODE');
 }

 if (normalized.includes('required')) {
 return this.translateService.instant('MARKETING.BANNERS.MESSAGES.REQUIRED_FIELDS');
 }

 if (normalized.includes('greater than zero')) {
 return this.translateService.instant('MARKETING.COUPONS.MESSAGES.DISCOUNT_GT_ZERO');
 }

 if (normalized.includes('percentage') && normalized.includes('100')) {
 return this.translateService.instant('MARKETING.COUPONS.MESSAGES.PERCENT_MAX');
 }

 if (normalized.includes('invalid date range')) {
 return this.translateService.instant('MARKETING.COUPONS.MESSAGES.INVALID_DATE_RANGE');
 }

 if (normalized.includes('vendor') && normalized.includes('not found')) {
 return this.translateService.instant('MARKETING.COUPONS.MESSAGES.VENDOR_NOT_FOUND');
 }

 if (normalized.includes('coupon') && normalized.includes('not found')) {
 return this.translateService.instant('MARKETING.COUPONS.MESSAGES.COUPON_NOT_FOUND');
 }

 return message;
 }

 private toPayload(): MarketingCouponPayload {
 return {
 code: this.form.code.trim().toUpperCase(),
 title: this.form.title.trim(),
 discountType: this.form.discountType,
 discountValue: Number(this.form.discountValue ?? 0),
 minOrderAmount: this.normalizeOptionalNumber(this.form.minOrderAmount),
 maxDiscountAmount: this.form.discountType === 'Percentage'
 ? this.normalizeOptionalNumber(this.form.maxDiscountAmount)
 : null,
 startsAtUtc: toNullableUtcIso(this.form.startsAtLocal),
 endsAtUtc: toNullableUtcIso(this.form.endsAtLocal),
 usageLimit: this.normalizeOptionalInt(this.form.usageLimit),
 perUserLimit: this.normalizeOptionalInt(this.form.perUserLimit),
 vendorIds: this.form.applyToAllVendors ? [] : this.form.vendorIds
 };
 }

 private normalizeOptionalNumber(value: number | null): number | null {
 return value == null || Number.isNaN(value) || value <= 0 ? null : Number(value);
 }

 private normalizeOptionalInt(value: number | null): number | null {
 return value == null || Number.isNaN(value) || value <= 0 ? null : Math.trunc(value);
 }
}
