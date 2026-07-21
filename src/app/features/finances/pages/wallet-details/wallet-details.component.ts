import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { WalletsService, AdminWalletSummaryDto, AdminWalletTransactionDto } from '../../services/wallets.service';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { KeyValueGridComponent, KeyValueGridItem } from '../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { MoneyBadgeComponent } from '../../components/money-badge/money-badge.component';
import { getFinanceLocale, resolveWalletOwnerEntityLabel, resolveWalletReferenceTypeLabel, resolveWalletTxnTypeLabel } from '../../utils/finance-i18n.utils';
import { resolveWalletMemo } from '../../utils/wallet-memo-i18n';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-wallet-details',
 standalone: true,
 imports: [
 CommonModule,
 FormsModule,
 TranslateModule,
 AppPaginationComponent,
 AppCardComponent,
 AppButtonComponent,
 KeyValueGridComponent,
 MoneyBadgeComponent,
 AppPageHeaderComponent
 ],
 template: `
 <div class="flex flex-col gap-6 animate-in fade-in duration-700">

 <!-- شريط الصفحة العلوي (Header) -->
 <app-page-header [title]="'FINANCES.WALLET_DETAILS.TITLE' | translate" [subtitle]="'FINANCES.WALLET_DETAILS.SUBTITLE' | translate" [showBack]="true" backUrl="/finances/wallets">
 <div actions class="flex items-center gap-3">
 <app-button variant="primary" size="sm" customClass="!rounded-xl shadow-sm" (btnClick)="isAdjustModalOpen = true" *ngIf="wallet">
 <span class="material-symbols-outlined text-[16px] rtl:ml-1 ltr:mr-1">edit_square</span>
 {{ 'FINANCES.WALLET_DETAILS.MANUAL_ADJUST' | translate }}
 </app-button>
 </div>
 </app-page-header>

 <!-- ملخص المحفظة (Wallet Summary) -->
 <ng-container *ngIf="wallet">
 <app-card variant="default" rounded="2xl" padding="none" customClass="border-slate-200 shadow-sm overflow-hidden bg-white">
 <div class="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
 <div class="flex items-center gap-4">
 <div class="w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0"
 [ngClass]="getOwnerIconClass(wallet.ownerType)">
 <span class="material-symbols-outlined text-[28px]">{{ getOwnerIcon(wallet.ownerType) }}</span>
 </div>
 <div>
 <div class="flex items-center gap-2 mb-1">
 <h2 class="text-xl font-black text-slate-900">{{ wallet.ownerName }}</h2>
 <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border"
 [ngClass]="getOwnerBadgeClass(wallet.ownerType)">
 {{ resolveWalletOwnerEntityLabel(wallet.ownerType) | translate }}
 </span>
 </div>
 <p class="text-[12px] font-bold text-slate-500" dir="ltr">{{ wallet.ownerPhone || ('FINANCES.WALLET_DETAILS.NO_PHONE_REGISTERED' | translate) }}</p>
 <p class="text-[10px] font-bold text-slate-400 mt-1 font-mono uppercase">ID: {{ wallet.id }}</p>
 </div>
 </div>
 
 <div class="flex gap-6 text-left rtl:text-right">
 <div class="px-5 py-3 bg-white rounded-xl border border-slate-200 shadow-sm">
 <p class="text-[11px] font-bold text-slate-500 mb-1">{{ 'FINANCES.WALLET_DETAILS.PENDING_BALANCE_LABEL' | translate }}</p>
 <p class="text-xl font-black tabular-nums tracking-tight text-amber-600">{{ formatNumber(wallet.pendingBalance) }} <span class="text-sm font-bold text-amber-600/70">{{ 'FINANCES.CURRENCY' | translate }}</span></p>
 </div>
 <div class="px-5 py-3 bg-white rounded-xl border border-slate-200 shadow-sm">
 <p class="text-[11px] font-bold text-slate-500 mb-1">{{ 'FINANCES.WALLET_DETAILS.AVAILABLE_BALANCE_LABEL' | translate }}</p>
 <p class="text-xl font-black tabular-nums tracking-tight text-emerald-600">{{ formatNumber(getAvailableBalance(wallet)) }} <span class="text-sm font-bold text-emerald-600/70">{{ 'FINANCES.CURRENCY' | translate }}</span></p>
 </div>
 <div *ngIf="hasLedgerBalanceMismatch(wallet)" class="px-5 py-3 bg-white rounded-xl border border-slate-200 shadow-sm">
 <p class="text-[11px] font-bold text-slate-500 mb-1">{{ 'FINANCES.WALLET_DETAILS.LEDGER_BALANCE_LABEL' | translate }}</p>
 <p class="text-xl font-black tabular-nums tracking-tight text-slate-700">{{ formatNumber(wallet.currentBalance) }} <span class="text-sm font-bold text-slate-500">{{ 'FINANCES.CURRENCY' | translate }}</span></p>
 </div>
 </div>
 </div>
 </app-card>
 </ng-container>

 <!-- سجل الحركات (Ledger) -->
 <app-card variant="default" rounded="2xl" padding="none" customClass="border-slate-200 shadow-sm overflow-hidden bg-white">
 <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
 <div class="flex items-center gap-3">
 <div class="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
 <span class="material-symbols-outlined text-slate-600 text-[18px]">receipt_long</span>
 </div>
 <div>
 <h3 class="text-[15px] font-black text-slate-900 tracking-tight">{{ 'FINANCES.WALLET_DETAILS.TABLE.TITLE' | translate }}</h3>
 <p class="text-[11px] font-bold text-slate-500 mt-0.5">{{ 'FINANCES.WALLET_DETAILS.TABLE.DESC' | translate }}</p>
 </div>
 </div>
 </div>

 <div class="overflow-x-auto">
 <table class="w-full whitespace-nowrap text-right text-[13px]">
 <thead>
 <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
 <th class="px-6 py-4 rtl:text-right ltr:text-left">{{ 'FINANCES.WALLET_DETAILS.TABLE.DATETIME' | translate }}</th>
 <th class="px-6 py-4 rtl:text-right ltr:text-left">{{ 'FINANCES.WALLET_DETAILS.TABLE.TYPE' | translate }}</th>
 <th class="px-6 py-4 rtl:text-right ltr:text-left w-1/3">{{ 'FINANCES.WALLET_DETAILS.TABLE.DESCRIPTION' | translate }}</th>
 <th class="px-6 py-4 rtl:text-right ltr:text-left">{{ 'FINANCES.WALLET_DETAILS.TABLE.REFERENCE' | translate }}</th>
 <th class="px-6 py-4 rtl:text-left ltr:text-right">{{ 'FINANCES.WALLET_DETAILS.TABLE.AMOUNT' | translate }}</th>
 </tr>
 </thead>
 <tbody class="divide-y divide-slate-100">
 <tr *ngFor="let txn of transactions"
 class="group hover:bg-slate-50/80 transition-colors duration-150"
 [class.opacity-50]="isLoadingTransactions">

 <td class="px-6 py-4 align-middle">
 <div class="flex flex-col gap-0.5">
 <span class="font-bold text-slate-900 tabular-nums">{{ formatDate(txn.createdAtUtc) }}</span>
 <span class="text-[10px] font-bold text-slate-400 tabular-nums">{{ formatTime(txn.createdAtUtc) }}</span>
 </div>
 </td>

 <td class="px-6 py-4 align-middle">
 <span class="inline-flex px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border"
 [ngClass]="getTypeBadgeClass(txn.txnType)">
 {{ getTranslatedTxnType(txn.txnType) | translate }}
 </span>
 </td>

 <td class="px-6 py-4 align-middle whitespace-normal min-w-[200px]">
 <ng-container *ngIf="resolveWalletMemo(txn.description) as memo; else rawDescription">
 <span class="font-bold text-slate-700 leading-tight">{{ memo.key | translate: memo.params }}</span>
 </ng-container>
 <ng-template #rawDescription>
 <span class="font-bold text-slate-700 leading-tight">{{ txn.description || '--' }}</span>
 </ng-template>
 </td>

 <td class="px-6 py-4 align-middle">
 <div class="flex flex-col gap-0.5">
 <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">
 {{ txn.referenceType ? (resolveWalletReferenceTypeLabel(txn.referenceType) | translate) : ('FINANCES.WALLET_DETAILS.TABLE.NO_REFERENCE' | translate) }}
 </span>
 <span class="text-[11px] font-mono font-bold text-slate-600 truncate max-w-[120px]" [title]="txn.referenceId || ''">{{ txn.referenceId || '--' }}</span>
 </div>
 </td>

 <td class="px-6 py-4 align-middle text-left" dir="ltr">
 <app-money-badge
 [amount]="txn.amount"
 [direction]="txn.direction === 'IN' ? 'credit' : 'debit'"
 [showDirection]="true"
 [currency]="'FINANCES.CURRENCY' | translate"
 size="sm">
 </app-money-badge>
 </td>

 </tr>
 </tbody>
 </table>
 </div>

 <div *ngIf="!isLoadingTransactions && transactions.length === 0"
 class="flex flex-col items-center justify-center py-24 text-center bg-white">
 <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
 <span class="material-symbols-outlined text-4xl text-slate-300">receipt_long</span>
 </div>
 <p class="text-[15px] font-black text-slate-800">{{ 'FINANCES.WALLET_DETAILS.NO_TXNS_TITLE' | translate }}</p>
 <p class="text-[12px] font-medium text-slate-500 mt-1">{{ 'FINANCES.WALLET_DETAILS.NO_TXNS_DESC' | translate }}</p>
 </div>
 </app-card>

 <div *ngIf="transactions.length > 0" class="flex justify-center pt-2 pb-8">
 <app-pagination
 [currentPage]="page"
 [pageSize]="pageSize"
 [totalItems]="totalCount"
 (pageChange)="changePage($event)">
 </app-pagination>
 </div>

 </div>

 <!-- نافذة التسوية اليدوية (Adjustment Modal) -->
 <div *ngIf="isAdjustModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" (click)="isAdjustModalOpen = false"></div>
 <div class="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-7 animate-in zoom-in-95 duration-200">
 <div class="flex items-center justify-between mb-6">
 <h3 class="text-xl font-black text-slate-900 tracking-tight">{{ 'FINANCES.WALLET_DETAILS.MODAL.TITLE' | translate }}</h3>
 <button class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors" (click)="isAdjustModalOpen = false">
 <span class="material-symbols-outlined text-[20px]">close</span>
 </button>
 </div>
 
 <div class="space-y-5">
 <div class="space-y-1.5">
 <label class="block text-[11px] font-bold text-slate-600">{{ 'FINANCES.WALLET_DETAILS.MODAL.DIRECTION' | translate }}</label>
 <div class="relative">
 <select [(ngModel)]="adjustForm.direction" class="w-full appearance-none bg-white border border-slate-200 rounded-xl text-[14px] font-black text-slate-800 py-3 px-4 focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all cursor-pointer">
 <option value="IN">{{ 'FINANCES.WALLET_DETAILS.MODAL.IN' | translate }}</option>
 <option value="OUT">{{ 'FINANCES.WALLET_DETAILS.MODAL.OUT' | translate }}</option>
 </select>
 <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
 </div>
 </div>
 <div class="space-y-1.5">
 <label class="block text-[11px] font-bold text-slate-600">{{ 'FINANCES.WALLET_DETAILS.MODAL.AMOUNT' | translate }}</label>
 <div class="relative">
 <input type="number" [(ngModel)]="adjustForm.amount" min="0.01" class="w-full bg-white border border-slate-200 rounded-xl text-[15px] font-black text-slate-900 py-3 px-4 pl-12 focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all tabular-nums" placeholder="0.00">
 <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">{{ 'FINANCES.CURRENCY' | translate }}</span>
 </div>
 </div>
 <div class="space-y-1.5">
 <label class="block text-[11px] font-bold text-slate-600">{{ 'FINANCES.WALLET_DETAILS.MODAL.REASON' | translate }}</label>
 <textarea [(ngModel)]="adjustForm.description" rows="3" class="w-full bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-800 py-3 px-4 focus:border-zadna-primary focus:ring-1 focus:ring-zadna-primary outline-none transition-all resize-none" [placeholder]="'FINANCES.WALLET_DETAILS.MODAL.REASON_PLACEHOLDER' | translate"></textarea>
 </div>
 </div>

 <div class="flex gap-3 mt-8">
 <app-button variant="ghost" size="md" customClass="!rounded-xl flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700" (btnClick)="isAdjustModalOpen = false">{{ 'FINANCES.WALLET_DETAILS.MODAL.CANCEL' | translate }}</app-button>
 <app-button variant="primary" size="md" customClass="!rounded-xl flex-1 shadow-md shadow-zadna-primary/20" (btnClick)="submitAdjustment()" [disabled]="isSubmitting || adjustForm.amount <= 0 ||!adjustForm.description">
 <span class="material-symbols-outlined text-[18px] rtl:ml-1 ltr:mr-1" *ngIf="!isSubmitting">check_circle</span>
 {{ isSubmitting ? ('FINANCES.WALLET_DETAILS.MODAL.PROCESSING' | translate) : ('FINANCES.WALLET_DETAILS.MODAL.CONFIRM' | translate) }}
 </app-button>
 </div>
 </div>
 </div>
 `
})
export class WalletDetailsComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
 private walletsService = inject(WalletsService);
 private translate = inject(TranslateService);
 private route = inject(ActivatedRoute);
 public router = inject(Router);

 walletId!: string;
 wallet: AdminWalletSummaryDto | null = null;
 
 transactions: AdminWalletTransactionDto[] = [];
 isLoadingTransactions = false;
 page = 1;
 pageSize = 20;
 totalCount = 0;

 isAdjustModalOpen = false;
 isSubmitting = false;
 adjustForm = {
 amount: 0,
 direction: 'IN' as 'IN' | 'OUT',
 description: ''
 };

 ngOnInit(): void {
 this.walletId = this.route.snapshot.paramMap.get('id')!;
 if (this.walletId) {
 this.loadWallet();
 this.loadTransactions();
 }
 }

 loadWallet(): void {
 this.walletsService.getWallet(this.walletId).pipe(take(1)).subscribe(data => {
 this.wallet = data;
 this.cdr.markForCheck();
 });
 }

 loadTransactions(): void {
 this.isLoadingTransactions = true;
 this.walletsService.getWalletTransactions(this.walletId, this.page, this.pageSize).pipe(take(1)).subscribe({
 next: (data) => {
 this.cdr.markForCheck();
 this.transactions = data.items;
 this.totalCount = data.totalCount;
 this.isLoadingTransactions = false;
 },
 error: () => {
 this.isLoadingTransactions = false;
 this.cdr.markForCheck();
 }
 });
 }

 changePage(page: number): void {
 this.page = page;
 this.loadTransactions();
 }

 submitAdjustment(): void {
 this.isSubmitting = true;
 this.walletsService.createAdjustment(this.walletId, {
 amount: this.adjustForm.amount,
 direction: this.adjustForm.direction,
 description: this.adjustForm.description
 }).subscribe({
 next: () => {
 this.cdr.markForCheck();
 this.isSubmitting = false;
 this.isAdjustModalOpen = false;
 this.adjustForm = { amount: 0, direction: 'IN', description: '' };
 this.loadWallet();
 this.page = 1;
 this.loadTransactions();
 },
 error: () => {
 this.isSubmitting = false;
 this.cdr.markForCheck();
 }
 });
 }

 formatDate(ts: string): string {
 return new Date(ts).toLocaleDateString(getFinanceLocale(this.translate.currentLang), { timeZone: 'Asia/Riyadh', calendar: 'gregory' });
 }

 formatTime(ts: string): string {
 return new Date(ts).toLocaleTimeString(getFinanceLocale(this.translate.currentLang), { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit' });
 }

 formatNumber(value: number): string {
 return value.toLocaleString(getFinanceLocale(this.translate.currentLang), {
 minimumFractionDigits: 0,
 maximumFractionDigits: 2
 });
 }

 getTranslatedTxnType(type: string): string {
 return resolveWalletTxnTypeLabel(type);
 }

 resolveWalletMemo = resolveWalletMemo;
 resolveWalletReferenceTypeLabel = resolveWalletReferenceTypeLabel;
 resolveWalletOwnerEntityLabel = resolveWalletOwnerEntityLabel;

 getOwnerIcon(ownerType: string): string {
 const map: Record<string, string> = {
 Vendor: 'storefront',
 Driver: 'local_shipping',
 Platform: 'hub'
 };
 return map[ownerType] ?? 'account_balance_wallet';
 }

 getOwnerIconClass(ownerType: string): string {
 const map: Record<string, string> = {
 Vendor: 'bg-cyan-50 text-cyan-600 border-cyan-100',
 Driver: 'bg-amber-50 text-amber-600 border-amber-100',
 Platform: 'bg-purple-50 text-purple-600 border-purple-100'
 };
 return map[ownerType] ?? 'bg-slate-50 text-slate-600 border-slate-100';
 }

 getOwnerBadgeClass(ownerType: string): string {
 const map: Record<string, string> = {
 Vendor: 'bg-cyan-50 text-cyan-700 border-cyan-100',
 Driver: 'bg-amber-50 text-amber-700 border-amber-100',
 Platform: 'bg-purple-50 text-purple-700 border-purple-100'
 };
 return map[ownerType] ?? 'bg-slate-50 text-slate-700 border-slate-100';
 }

 getTypeBadgeClass(type: string): string {
 const map: Record<string, string> = {
 Payout: 'bg-amber-50 text-amber-700 border-amber-200',
 Refund: 'bg-red-50 text-red-600 border-red-200',
 Settlement: 'bg-emerald-50 text-emerald-700 border-emerald-200',
 Adjustment: 'bg-purple-50 text-purple-700 border-purple-200',
 Hold: 'bg-orange-50 text-orange-700 border-orange-200',
 Release: 'bg-sky-50 text-sky-700 border-sky-200',
 Credit: 'bg-green-50 text-green-700 border-green-200',
 Debit: 'bg-slate-100 text-slate-700 border-slate-200',
 CashCollected: 'bg-indigo-50 text-indigo-700 border-indigo-200',
 OrderRevenue: 'bg-teal-50 text-teal-700 border-teal-200',
 };
 return map[type] ?? 'bg-slate-100 text-slate-600 border-slate-200';
 }

 getAvailableBalance(wallet: AdminWalletSummaryDto): number {
 if (typeof wallet.availableBalance === 'number') {
 return wallet.availableBalance;
 }

 const reserved = wallet.pendingBalance ?? 0;
 const codOwed = wallet.codOwedBalance ?? 0;
 return Math.max(0, wallet.currentBalance - codOwed - reserved);
 }

 hasLedgerBalanceMismatch(wallet: AdminWalletSummaryDto): boolean {
 return Math.abs(wallet.currentBalance - this.getAvailableBalance(wallet)) > 0.009;
 }
}
