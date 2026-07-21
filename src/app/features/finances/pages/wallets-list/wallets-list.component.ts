import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { KeyValueGridComponent, KeyValueGridItem } from '../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { getFinanceLocale } from '../../utils/finance-i18n.utils';
import { AdminWalletSummaryDto, WalletsService } from '../../services/wallets.service';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-wallets-list',
 standalone: true,
 imports: [
 CommonModule,
 FormsModule,
 TranslateModule,
 AppPaginationComponent,
 AppCardComponent,
 KeyValueGridComponent,
 RouterLink,
 AppPageHeaderComponent
 ],
 template: `
 <div class="flex flex-col gap-6 animate-in fade-in duration-700">

 <!-- شريط الصفحة العلوي (Header) -->
 <app-page-header [title]="'FINANCES.WALLETS.TITLE' | translate" [subtitle]="'FINANCES.WALLETS.SUBTITLE' | translate">
 <div actions class="flex flex-wrap items-center gap-3">
 <!-- أزرار الفلترة حسب نوع المالك -->
 <div class="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200">
 <button *ngFor="let option of ownerOptions"
 (click)="setOwnerType(option.value)"
 class="px-4 py-2 text-[12px] font-bold rounded-lg transition-all duration-200"
 [ngClass]="ownerType === option.value
 ? 'bg-white text-zadna-primary shadow-sm border border-slate-200'
 : 'text-slate-500 hover:text-slate-800'">
 {{ option.labelKey | translate }}
 </button>
 </div>
 <div class="rounded-xl border border-slate-200 bg-white px-4 py-2 flex items-center justify-center gap-2 shadow-sm">
 <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
 <span class="text-[12px] font-bold text-slate-600 tabular-nums">{{ 'FINANCES.WALLETS.ACTIVE_COUNT' | translate: { count: totalCount } }}</span>
 </div>
 </div>
 </app-page-header>

 <!-- ملخص الأرصدة (Summary Cards) -->
 <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
 <app-card variant="default" rounded="2xl" padding="none" customClass="bg-white border-slate-200 shadow-sm overflow-hidden flex items-center p-5 gap-4 transition-all hover:shadow-md">
 <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
 <span class="material-symbols-outlined text-emerald-500 text-[24px]">account_balance</span>
 </div>
 <div>
 <p class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{{ 'FINANCES.WALLETS.TOTAL_PLATFORM_BALANCE' | translate }}</p>
 <p class="text-2xl font-black text-slate-900 tabular-nums tracking-tight">{{ formatNumber(totalPlatformBalance) }} <span class="text-sm text-slate-400 font-bold">{{ 'FINANCES.CURRENCY' | translate }}</span></p>
 </div>
 </app-card>

 <app-card variant="default" rounded="2xl" padding="none" customClass="bg-white border-slate-200 shadow-sm overflow-hidden flex items-center p-5 gap-4 transition-all hover:shadow-md">
 <div class="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
 <span class="material-symbols-outlined text-amber-500 text-[24px]">payments</span>
 </div>
 <div>
 <p class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{{ 'FINANCES.WALLETS.PENDING_WITHDRAWALS' | translate }}</p>
 <p class="text-2xl font-black text-slate-900 tabular-nums tracking-tight">{{ formatNumber(totalPendingWithdrawals) }} <span class="text-sm text-slate-400 font-bold">{{ 'FINANCES.CURRENCY' | translate }}</span></p>
 </div>
 </app-card>

 <app-card variant="default" rounded="2xl" padding="none" customClass="bg-white border-slate-200 shadow-sm overflow-hidden flex items-center p-5 gap-4 transition-all hover:shadow-md">
 <div class="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center border border-cyan-100 shrink-0">
 <span class="material-symbols-outlined text-cyan-600 text-[24px]">account_balance_wallet</span>
 </div>
 <div>
 <p class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{{ 'FINANCES.WALLETS.TOTAL_WALLETS' | translate }}</p>
 <p class="text-2xl font-black text-slate-900 tabular-nums tracking-tight">{{ formatNumber(totalCount) }} <span class="text-sm text-slate-400 font-bold">{{ 'FINANCES.WALLETS.WALLET_UNIT' | translate }}</span></p>
 </div>
 </app-card>
 </div>

 <!-- شبكة المحافظ -->
 <div *ngIf="isLoading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 <div *ngFor="let _ of [1,2,3,4,5,6]" class="h-44 animate-pulse rounded-2xl border border-slate-100 bg-white shadow-sm"></div>
 </div>

 <div *ngIf="!isLoading && wallets.length" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 <a *ngFor="let wallet of wallets"
 [routerLink]="['/finances/wallets', wallet.id]"
 class="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-zadna-primary/30 hover:shadow-lg hover:shadow-zadna-primary/5">
 
 <div class="flex items-start justify-between gap-3 mb-4">
 <div class="flex items-start gap-3 min-w-0">
 <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 group-hover:scale-105"
 [ngClass]="wallet.ownerType === 'Vendor' ? 'bg-cyan-50 text-cyan-600 border-cyan-100 group-hover:bg-cyan-100' : 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100'">
 <span class="material-symbols-outlined text-[24px]">
 {{ wallet.ownerType === 'Vendor' ? 'storefront' : 'local_shipping' }}
 </span>
 </div>
 <div class="min-w-0">
 <p class="truncate text-[15px] font-black text-slate-900 leading-tight">{{ wallet.ownerName }}</p>
 <div class="flex items-center gap-2 mt-1">
 <span class="inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest"
 [ngClass]="wallet.ownerType === 'Vendor' ? 'bg-cyan-50 text-cyan-700' : 'bg-amber-50 text-amber-700'">
 {{ (wallet.ownerType === 'Vendor' ? 'FINANCES.ENTITIES.VENDOR' : 'FINANCES.ENTITIES.DRIVER') | translate }}
 </span>
 <p class="text-[11px] font-bold text-slate-500 truncate" dir="ltr">{{ wallet.ownerPhone || ('FINANCES.WALLETS.NO_PHONE' | translate) }}</p>
 </div>
 </div>
 </div>
 <span class="material-symbols-outlined text-slate-300 rtl:rotate-180 transition-transform group-hover:text-zadna-primary group-hover:-translate-x-1">arrow_forward</span>
 </div>

 <div class="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
 <div>
 <p class="text-[10px] font-bold text-slate-400 mb-1">{{ 'FINANCES.WALLETS.AVAILABLE_BALANCE' | translate }}</p>
 <p class="text-lg font-black text-emerald-600 tabular-nums leading-none tracking-tight">{{ formatNumber(getAvailableBalance(wallet)) }} <span class="text-[10px] text-emerald-600/70">{{ 'FINANCES.CURRENCY' | translate }}</span></p>
 </div>
 <div>
 <p class="text-[10px] font-bold text-slate-400 mb-1">{{ 'FINANCES.WALLETS.PENDING_BALANCE' | translate }}</p>
 <p class="text-lg font-black text-amber-600 tabular-nums leading-none tracking-tight">{{ formatNumber(wallet.pendingBalance) }} <span class="text-[10px] text-amber-600/70">{{ 'FINANCES.CURRENCY' | translate }}</span></p>
 </div>
 </div>
 </a>
 </div>

 <!-- حالة ما فيه بيانات -->
 <div *ngIf="!isLoading &&!wallets.length" class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed text-center">
 <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
 <span class="material-symbols-outlined text-[40px] text-slate-300">account_balance_wallet</span>
 </div>
 <h3 class="text-lg font-black text-slate-800">{{ 'FINANCES.WALLETS.NO_DATA_TITLE' | translate }}</h3>
 <p class="mt-2 text-[13px] font-medium text-slate-500 max-w-sm">
 {{ 'FINANCES.WALLETS.NO_DATA_DESC' | translate }}
 </p>
 </div>

 <!-- الترقيم (Pagination) -->
 <div *ngIf="wallets.length > 0" class="flex justify-center pt-2 pb-8">
 <app-pagination
 [currentPage]="page"
 [pageSize]="pageSize"
 [totalItems]="totalCount"
 (pageChange)="changePage($event)">
 </app-pagination>
 </div>
 </div>
 `
})
export class WalletsListComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
 private readonly walletsService = inject(WalletsService);
 private readonly translate = inject(TranslateService);

 wallets: AdminWalletSummaryDto[] = [];
 isLoading = false;
 page = 1;
 pageSize = 24; // Show more per page to fit grid nicely
 totalCount = 0;
 ownerType: string | null = null;
 totalPlatformBalance = 0;
 totalPendingWithdrawals = 0;

 readonly ownerOptions: Array<{ labelKey: string; value: string | null }> = [
 { labelKey: 'FINANCES.WALLETS.TABS.ALL', value: null },
 { labelKey: 'FINANCES.WALLETS.TABS.VENDORS', value: 'Vendor' },
 { labelKey: 'FINANCES.WALLETS.TABS.DRIVERS', value: 'Driver' }
 ];

 ngOnInit(): void {
 this.loadData();
 }

 loadData(): void {
 this.isLoading = true;
 this.walletsService.getWallets(this.ownerType ?? undefined, this.page, this.pageSize).pipe(take(1)).subscribe({
 next: (data) => {
 this.cdr.markForCheck();
 this.wallets = data.items;
 this.totalCount = data.totalCount;
 this.totalPlatformBalance = data.totalPlatformBalance;
 this.totalPendingWithdrawals = data.totalPendingWithdrawals;
 this.isLoading = false;
 },
 error: () => {
 this.cdr.markForCheck();
 this.wallets = [];
 this.isLoading = false;
 }
 });
 }

 setOwnerType(value: string | null): void {
 this.ownerType = value;
 this.page = 1;
 this.loadData();
 }

 changePage(page: number): void {
 this.page = page;
 this.loadData();
 }

 formatNumber(value: number): string {
 return value.toLocaleString(getFinanceLocale(this.translate.currentLang), {
 minimumFractionDigits: 0,
 maximumFractionDigits: 2
 });
 }

 getAvailableBalance(wallet: AdminWalletSummaryDto): number {
 if (typeof wallet.availableBalance === 'number') {
 return wallet.availableBalance;
 }

 const reserved = wallet.pendingBalance ?? 0;
 const codOwed = wallet.codOwedBalance ?? 0;
 return Math.max(0, wallet.currentBalance - codOwed - reserved);
 }
}
