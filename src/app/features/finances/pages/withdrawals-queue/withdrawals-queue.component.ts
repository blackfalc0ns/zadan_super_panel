import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { switchMap, take } from 'rxjs';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { MoneyBadgeComponent } from '../../components/money-badge/money-badge.component';
import {
 AdminDriverWithdrawalRequestDto,
 AdminPayoutDto,
 WalletsService
} from '../../services/wallets.service';
import { getFinanceLocale } from '../../utils/finance-i18n.utils';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-withdrawals-queue',
 standalone: true,
 imports: [
 CommonModule,
 FormsModule,
 TranslateModule,
 AppPaginationComponent,
 AppCardComponent,
 MoneyBadgeComponent,
 AppPageHeaderComponent
 ],
 template: `
 <div class="flex flex-col gap-6 animate-in fade-in duration-700">

 <!-- شريط الصفحة العلوي (Header) -->
 <app-page-header [title]="'FINANCES.WITHDRAWALS.TITLE' | translate" [subtitle]="'FINANCES.WITHDRAWALS.SUBTITLE' | translate">
 <div actions class="flex items-center gap-3">
 <div class="rounded-xl border border-slate-200 bg-white px-4 py-2 flex items-center justify-center gap-2 shadow-sm">
 <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
 <span class="text-[12px] font-bold text-slate-600 tabular-nums">{{ 'FINANCES.WITHDRAWALS.ACTIVE_COUNT' | translate: { count: totalCount } }}</span>
 </div>
 </div>
 </app-page-header>

 <!-- شريط الفلاتر (Status Filter) -->
 <div class="flex flex-wrap items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 w-fit">
 <button
 *ngFor="let option of statusOptions"
 type="button"
 (click)="setStatus(option.value)"
 class="rounded-xl px-4 py-2 text-[12px] font-bold transition-all duration-200"
 [ngClass]="status === option.value
 ? 'bg-white text-zadna-primary shadow-sm border border-slate-200'
 : 'text-slate-500 hover:text-slate-800'">
 {{ option.labelKey | translate }}
 </button>
 </div>

 <!-- قائمة الطلبات (Cards Grid) -->
 <app-card variant="default" rounded="2xl" padding="none" customClass="bg-white border-slate-200 shadow-sm overflow-hidden">
 <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
 <div class="flex items-center gap-3">
 <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
 <span class="material-symbols-outlined text-[18px]">payments</span>
 </div>
 <div>
 <h3 class="text-[15px] font-black text-slate-900 tracking-tight">{{ 'FINANCES.WITHDRAWALS.TABLE.TITLE' | translate }}</h3>
 <p class="text-[11px] font-bold text-slate-500 mt-0.5">{{ 'FINANCES.WITHDRAWALS.TABLE.DESC' | translate }}</p>
 </div>
 </div>
 </div>

 <div *ngIf="isLoading" class="grid gap-0 divide-y divide-slate-100">
 <div *ngFor="let _ of [1,2,3,4]" class="h-28 animate-pulse bg-slate-50 m-4 rounded-xl border border-slate-100"></div>
 </div>

 <div *ngIf="!isLoading && withdrawals.length" class="grid gap-0 divide-y divide-slate-100">
 <div *ngFor="let req of withdrawals" class="p-6 transition-all duration-200 hover:bg-slate-50/50 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
 
 <div class="grid grid-cols-1 md:grid-cols-4 gap-6 w-full xl:w-auto flex-1 items-center">
 <!-- Driver Info -->
 <div class="flex items-center gap-3">
 <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
 <span class="material-symbols-outlined text-slate-500 text-[20px]">person</span>
 </div>
 <div>
 <p class="text-[14px] font-black text-slate-900">{{ req.driverName }}</p>
 <p class="text-[11px] font-bold text-slate-500 font-mono mt-0.5" dir="ltr">{{ req.driverPhone || ('FINANCES.WITHDRAWALS.TABLE.NO_PHONE' | translate) }}</p>
 </div>
 </div>

 <!-- Date -->
 <div>
 <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{{ 'FINANCES.WITHDRAWALS.TABLE.REQUEST_TIME' | translate }}</p>
 <p class="text-[13px] font-bold text-slate-800 tabular-nums">{{ formatDate(req.createdAtUtc) }}</p>
 <p class="text-[10px] font-bold text-slate-500 tabular-nums">{{ formatTime(req.createdAtUtc) }}</p>
 </div>

 <!-- Payout Method -->
 <div>
 <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{{ 'FINANCES.WITHDRAWALS.TABLE.PAYOUT_ACCOUNT' | translate }}</p>
 <ng-container *ngIf="req.payoutMethod; else noMethod">
 <p class="text-[13px] font-bold text-slate-800 line-clamp-1">{{ req.payoutMethod.providerName || req.payoutMethod.methodType }}</p>
 <p class="text-[10px] font-bold text-slate-500 truncate" [title]="req.payoutMethod.accountHolderName">{{ req.payoutMethod.accountHolderName }}</p>
 <p class="text-[11px] font-black text-slate-600 font-mono mt-0.5">{{ req.payoutMethod.maskedLabel }}</p>
 </ng-container>
 <ng-template #noMethod>
 <span class="inline-flex px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold">{{ 'FINANCES.WITHDRAWALS.TABLE.NO_METHOD' | translate }}</span>
 </ng-template>
 </div>

 <!-- Status -->
 <div>
 <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{{ 'FINANCES.WITHDRAWALS.TABLE.STATUS' | translate }}</p>
 <span class="inline-flex px-2 py-1 rounded-md text-[10px] font-black tracking-widest border" [ngClass]="getStatusBadgeClass(req.status)">
 {{ getTranslatedStatus(req.status) | translate }}
 </span>
 <p *ngIf="req.transferReference" class="mt-1.5 text-[11px] font-bold text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded w-fit">
 {{ 'FINANCES.WITHDRAWALS.TABLE.REF' | translate }}: {{ req.transferReference }}
 </p>
 <p *ngIf="req.failureReason" class="mt-1.5 text-[11px] font-bold text-red-500 line-clamp-2" [title]="req.failureReason">
 {{ 'FINANCES.WITHDRAWALS.TABLE.FAILURE_REASON' | translate }}: {{ req.failureReason }}
 </p>
 </div>
 </div>

 <div class="flex flex-col items-start xl:items-end gap-4 shrink-0 min-w-[200px] border-t xl:border-t-0 border-slate-100 pt-4 xl:pt-0 w-full xl:w-auto">
 <div class="text-right w-full xl:w-auto rtl:text-left text-left">
 <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{{ 'FINANCES.WITHDRAWALS.TABLE.AMOUNT_REQUESTED' | translate }}</p>
 <p class="text-xl font-black text-amber-700 tabular-nums leading-none tracking-tight">{{ formatNumber(req.amount) }} <span class="text-[12px] font-bold">{{ 'FINANCES.CURRENCY' | translate }}</span></p>
 </div>

 <div class="flex flex-wrap gap-2 w-full xl:w-auto xl:justify-end" *ngIf="req.status === 'Pending' || req.status === 'Processing'">
 <button
 *ngIf="req.status === 'Pending' || !req.payoutId"
 type="button"
 (click)="openProcessModal(req, true)"
 class="inline-flex h-9 flex-1 xl:flex-none items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-[12px] font-black text-white transition hover:bg-emerald-700">
 <span class="material-symbols-outlined text-[16px]">check_circle</span>
 {{ 'FINANCES.WITHDRAWALS.TABLE.APPROVE' | translate }}
 </button>
 <button
 *ngIf="canManageManualTransfer(req)"
 type="button"
 (click)="openManualWorkflow(req)"
 class="inline-flex h-9 flex-1 xl:flex-none items-center justify-center gap-1.5 rounded-xl bg-violet-700 px-4 text-[12px] font-black text-white transition hover:bg-violet-800">
 <span class="material-symbols-outlined text-[16px]">account_balance</span>
 {{ 'FINANCES.WITHDRAWALS.TABLE.MANAGE_MANUAL_TRANSFER' | translate }}
 </button>
 <button
 type="button"
 (click)="openProcessModal(req, false)"
 class="inline-flex h-9 flex-1 xl:flex-none items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 text-[12px] font-black text-rose-600 transition hover:bg-rose-50">
 <span class="material-symbols-outlined text-[16px]">cancel</span>
 {{ 'FINANCES.WITHDRAWALS.TABLE.REJECT' | translate }}
 </button>
 </div>
 <div class="flex gap-2 w-full xl:w-auto xl:justify-end" *ngIf="req.status === 'Paid' && req.payoutId">
 <button
 type="button"
 (click)="openReturnWorkflow(req)"
 class="inline-flex h-9 w-full xl:w-auto items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 text-[12px] font-black text-amber-800 transition hover:bg-amber-100">
 <span class="material-symbols-outlined text-[16px]">keyboard_return</span>
 {{ 'FINANCES.WITHDRAWALS.TABLE.RECORD_BANK_RETURN' | translate }}
 </button>
 </div>
 </div>

 </div>
 </div>

 <div *ngIf="!isLoading && withdrawals.length === 0" class="flex flex-col items-center justify-center py-24 text-center bg-white">
 <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
 <span class="material-symbols-outlined text-4xl text-slate-300">account_balance_wallet</span>
 </div>
 <h3 class="text-[15px] font-black text-slate-800">{{ 'FINANCES.WITHDRAWALS.NO_DATA_TITLE' | translate }}</h3>
 <p class="text-[12px] font-medium text-slate-500 mt-1 max-w-sm">{{ 'FINANCES.WITHDRAWALS.NO_DATA_DESC' | translate }}</p>
 </div>
 </app-card>

 <!-- الترقيم (Pagination) -->
 <div *ngIf="withdrawals.length > 0" class="flex justify-center pt-2 pb-8">
 <app-pagination
 [currentPage]="page"
 [pageSize]="pageSize"
 [totalItems]="totalCount"
 (pageChange)="changePage($event)">
 </app-pagination>
 </div>
 </div>

 <!-- نافذة معالجة الطلب (Process Modal) — نفس نمط مودالات المالية -->
 <div *ngIf="isProcessModalOpen && selectedRequest" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <div class="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" (click)="closeProcessModal()"></div>
 <section class="relative flex w-full max-w-lg max-h-[90vh] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
 <header
 class="border-b px-6 py-5"
 [ngClass]="isApproving ? 'border-emerald-100 bg-emerald-50' : 'border-rose-100 bg-rose-50'">
 <div class="flex items-start justify-between gap-4">
 <div class="flex gap-3">
 <span
 class="material-symbols-outlined mt-0.5 text-[24px]"
 [ngClass]="isApproving ? 'text-emerald-700' : 'text-rose-700'">
 {{ isApproving ? 'check_circle' : 'cancel' }}
 </span>
 <div>
 <h2 class="text-[16px] font-black text-slate-950">
 {{ (isApproving ? 'FINANCES.WITHDRAWALS.MODAL.TITLE_APPROVE' : 'FINANCES.WITHDRAWALS.MODAL.TITLE_REJECT') | translate }}
 </h2>
 <p class="mt-1 text-[12px] font-medium leading-relaxed text-slate-600">
 {{ selectedRequest.driverName }} · {{ formatNumber(selectedRequest.amount) }} {{ 'FINANCES.CURRENCY' | translate }}
 </p>
 </div>
 </div>
 <button
 type="button"
 (click)="closeProcessModal()"
 [disabled]="isSubmitting"
 class="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-slate-900 disabled:opacity-50"
 [attr.aria-label]="'FINANCES.WITHDRAWALS.MODAL.CANCEL' | translate">
 <span class="material-symbols-outlined text-[18px]">close</span>
 </button>
 </div>
 </header>

 <div class="space-y-5 overflow-y-auto p-6">
 <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-start gap-3">
 <span class="material-symbols-outlined text-slate-400 mt-0.5 text-[20px]">account_balance</span>
 <div class="min-w-0">
 <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">{{ 'FINANCES.WITHDRAWALS.MODAL.PAYOUT_METHOD' | translate }}</p>
 <p class="mt-1 text-[13px] font-black text-slate-900">{{ selectedRequest.payoutMethod?.providerName || selectedRequest.payoutMethod?.methodType || ('FINANCES.WITHDRAWALS.MODAL.NOT_AVAILABLE' | translate) }}</p>
 <p class="mt-0.5 font-mono text-[12px] font-bold text-slate-600" dir="ltr">{{ selectedRequest.payoutMethod?.maskedLabel || ('FINANCES.WITHDRAWALS.MODAL.NOT_AVAILABLE' | translate) }}</p>
 </div>
 </div>

 <p *ngIf="isApproving" class="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-[12px] font-medium leading-5 text-emerald-900">
 {{ 'FINANCES.WITHDRAWALS.MODAL.PREPARE_HINT' | translate }}
 </p>

 <label *ngIf="!isApproving" class="block">
 <span class="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-500">{{ 'FINANCES.WITHDRAWALS.MODAL.REJECT_REASON' | translate }}</span>
 <textarea
 [(ngModel)]="processForm.failureReason"
 rows="3"
 class="h-auto w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-[13px] font-bold text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
 [placeholder]="'FINANCES.WITHDRAWALS.MODAL.REJECT_REASON_PLACEHOLDER' | translate"></textarea>
 </label>

 <p *ngIf="processError" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-bold text-rose-700">
 {{ processError | translate }}
 </p>
 </div>

 <footer class="flex gap-3 border-t border-slate-100 px-6 py-4">
 <button
 type="button"
 (click)="closeProcessModal()"
 [disabled]="isSubmitting"
 class="h-10 flex-1 rounded-xl border border-slate-200 text-[12px] font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
 {{ 'FINANCES.WITHDRAWALS.MODAL.CANCEL' | translate }}
 </button>
 <button
 type="button"
 (click)="submitProcess()"
 [disabled]="isSubmitting || (!isApproving && !processForm.failureReason.trim())"
 class="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-[12px] font-black text-white transition disabled:opacity-50"
 [ngClass]="isApproving ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'">
 <span class="material-symbols-outlined text-[17px]">{{ isSubmitting ? 'hourglass_empty' : (isApproving ? 'verified' : 'block') }}</span>
 {{ isSubmitting ? ('FINANCES.WITHDRAWALS.MODAL.PROCESSING' | translate) : ('FINANCES.WITHDRAWALS.MODAL.CONFIRM' | translate) }}
 </button>
 </footer>
 </section>
 </div>

 <!-- Manual / return bank workflow — نفس نمط مودال التسوية اليدوية -->
 <div *ngIf="isManualWorkflowModalOpen && manualWorkflowRequest" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
 <div class="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" (click)="closeManualWorkflow()"></div>
 <section class="relative flex w-full max-w-lg max-h-[90vh] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
 <header
 class="border-b px-6 py-5"
 [ngClass]="isReturnWorkflow ? 'border-amber-100 bg-amber-50' : 'border-violet-100 bg-violet-50'">
 <div class="flex items-start justify-between gap-4">
 <div class="flex gap-3">
 <span
 class="material-symbols-outlined mt-0.5 text-[24px]"
 [ngClass]="isReturnWorkflow ? 'text-amber-700' : 'text-violet-700'">
 {{ isReturnWorkflow ? 'keyboard_return' : 'receipt_long' }}
 </span>
 <div>
 <h2 class="text-[16px] font-black text-slate-950">
 {{ (isReturnWorkflow ? 'FINANCES.WITHDRAWALS.RETURN_WORKFLOW.TITLE' : 'FINANCES.WITHDRAWALS.WORKFLOW.TITLE') | translate }}
 </h2>
 <p class="mt-1 text-[12px] font-medium leading-relaxed text-slate-600">
 {{ manualWorkflowRequest.driverName }} · {{ formatNumber(manualWorkflowRequest.amount) }} {{ 'FINANCES.CURRENCY' | translate }}
 </p>
 </div>
 </div>
 <button
 type="button"
 (click)="closeManualWorkflow()"
 [disabled]="isManualWorkflowSubmitting"
 class="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-slate-900 disabled:opacity-50"
 [attr.aria-label]="'FINANCES.WITHDRAWALS.WORKFLOW.CLOSE' | translate">
 <span class="material-symbols-outlined text-[18px]">close</span>
 </button>
 </div>
 </header>

 <div class="flex-1 space-y-5 overflow-y-auto p-6">
 <div *ngIf="isManualWorkflowLoading" class="flex items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-12 text-sm font-bold text-slate-500">
 <span class="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600"></span>
 {{ 'FINANCES.WITHDRAWALS.WORKFLOW.LOADING' | translate }}
 </div>

 <p *ngIf="manualWorkflowError" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-bold text-rose-700">
 {{ manualWorkflowError | translate }}
 </p>

 <ng-container *ngIf="!isManualWorkflowLoading && manualPayout as payout">
 <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
 <div class="flex flex-wrap items-center justify-between gap-2">
 <div class="min-w-0">
 <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.PAYOUT_ID' | translate }}</p>
 <p class="mt-1 break-all font-mono text-[11px] font-bold text-slate-700" dir="ltr">{{ payout.id }}</p>
 </div>
 <span
 class="rounded-full border px-2.5 py-1 text-[10px] font-black"
 [ngClass]="isReturnWorkflow ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-violet-200 bg-violet-50 text-violet-700'">
 {{ getTranslatedPayoutStatus(payout.status) | translate }}
 </span>
 </div>
 </div>

 <ng-container *ngIf="isReturnWorkflow">
 <div>
 <h4 class="text-[13px] font-black text-slate-900">{{ 'FINANCES.WITHDRAWALS.RETURN_WORKFLOW.SECTION_TITLE' | translate }}</h4>
 <p class="mt-1 text-[12px] font-medium leading-5 text-slate-600">{{ 'FINANCES.WITHDRAWALS.RETURN_WORKFLOW.DESC' | translate }}</p>
 </div>

 <label class="block">
 <span class="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-500">{{ 'FINANCES.WITHDRAWALS.RETURN_WORKFLOW.REFERENCE' | translate }}</span>
 <input
 type="text"
 [(ngModel)]="returnReference"
 dir="ltr"
 class="h-11 w-full rounded-xl border border-slate-200 px-3 text-[13px] font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
 [placeholder]="'FINANCES.WITHDRAWALS.RETURN_WORKFLOW.REFERENCE_PLACEHOLDER' | translate">
 </label>

 <label class="block">
 <span class="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-500">{{ 'FINANCES.WITHDRAWALS.RETURN_WORKFLOW.REASON' | translate }}</span>
 <textarea
 [(ngModel)]="returnReason"
 rows="2"
 class="h-auto w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-[13px] font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
 [placeholder]="'FINANCES.WITHDRAWALS.RETURN_WORKFLOW.REASON_PLACEHOLDER' | translate"></textarea>
 </label>

 <label class="block">
 <span class="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-500">{{ 'FINANCES.WITHDRAWALS.RETURN_WORKFLOW.PROOF_FILE' | translate }}</span>
 <input
 type="file"
 accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
 (change)="onReturnProofFileSelected($event)"
 class="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-[12px] font-bold text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-[11px] file:font-black file:text-amber-900 rtl:file:ml-3 rtl:file:mr-0">
 <p *ngIf="returnProofFile" class="mt-2 text-[11px] font-bold text-emerald-700">{{ returnProofFile.name }}</p>
 </label>

 <p *ngIf="manualPayout.status === 'Reversed'" class="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[12px] font-black text-emerald-700">
 {{ 'FINANCES.WITHDRAWALS.RETURN_WORKFLOW.COMPLETED' | translate }}
 </p>
 </ng-container>

 <ng-container *ngIf="!isReturnWorkflow">
 <div class="grid grid-cols-3 gap-2 text-center text-[10px] font-black">
 <span [class.text-violet-700]="canClaimManualPayout() || manualPayout.executionReservation?.status === 'Claimed' || manualPayout.executionReservation?.status === 'Submitted' || isManualPayoutCompleted()" [class.text-slate-400]="!(canClaimManualPayout() || manualPayout.executionReservation?.status === 'Claimed' || manualPayout.executionReservation?.status === 'Submitted' || isManualPayoutCompleted())">1. {{ 'FINANCES.WITHDRAWALS.WORKFLOW.CLAIM_TITLE' | translate }}</span>
 <span [class.text-violet-700]="canRecordManualBankSubmission() || manualPayout.executionReservation?.status === 'Submitted' || isManualPayoutCompleted()" [class.text-slate-400]="!(canRecordManualBankSubmission() || manualPayout.executionReservation?.status === 'Submitted' || isManualPayoutCompleted())">2. {{ 'FINANCES.WITHDRAWALS.WORKFLOW.SUBMISSION_TITLE' | translate }}</span>
 <span [class.text-violet-700]="canConfirmManualPayout() || isManualPayoutCompleted()" [class.text-slate-400]="!(canConfirmManualPayout() || isManualPayoutCompleted())">3. {{ 'FINANCES.WITHDRAWALS.WORKFLOW.CONFIRM_TITLE' | translate }}</span>
 </div>

 <ng-container *ngIf="canClaimManualPayout() || manualPayout.executionReservation?.status === 'Claimed' || (!manualPayout.executionReservation && !isManualPayoutCompleted())">
 <p class="rounded-xl border border-violet-100 bg-violet-50 px-3 py-3 text-[12px] font-medium leading-5 text-violet-900">
 {{ 'FINANCES.WITHDRAWALS.WORKFLOW.CLAIM_DESC' | translate }}
 </p>
 <p *ngIf="manualPayout.executionReservation?.status === 'Claimed'" class="text-[11px] font-black text-violet-700">
 {{ 'FINANCES.WITHDRAWALS.WORKFLOW.CLAIMED' | translate }}
 </p>
 </ng-container>

 <ng-container *ngIf="canRecordManualBankSubmission() || manualPayout.executionReservation?.status === 'Submitted'">
 <p class="rounded-xl border border-amber-100 bg-amber-50 px-3 py-3 text-[12px] font-medium leading-5 text-amber-900">
 {{ 'FINANCES.WITHDRAWALS.WORKFLOW.SUBMISSION_DESC' | translate }}
 </p>
 <p *ngIf="manualPayout.executionReservation?.status === 'Submitted'" class="break-all text-[11px] font-black text-amber-700">
 {{ 'FINANCES.WITHDRAWALS.WORKFLOW.SUBMITTED' | translate }}: {{ manualPayout.executionReservation?.submissionReference }}
 </p>
 <label *ngIf="canRecordManualBankSubmission()" class="block">
 <span class="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-500">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.SUBMISSION_REFERENCE' | translate }}</span>
 <input
 type="text"
 [(ngModel)]="manualBankSubmissionReference"
 dir="ltr"
 class="h-11 w-full rounded-xl border border-slate-200 px-3 text-[13px] font-bold text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
 [placeholder]="'FINANCES.WITHDRAWALS.WORKFLOW.SUBMISSION_REFERENCE_PLACEHOLDER' | translate">
 </label>
 </ng-container>

 <ng-container *ngIf="canConfirmManualPayout() || isManualPayoutCompleted()">
 <p class="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-[12px] font-medium leading-5 text-emerald-900">
 {{ 'FINANCES.WITHDRAWALS.WORKFLOW.CONFIRM_DESC' | translate }}
 </p>
 <label *ngIf="canConfirmManualPayout()" class="block">
 <span class="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-500">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.TRANSFER_REFERENCE' | translate }}</span>
 <input
 type="text"
 [(ngModel)]="manualTransferReference"
 dir="ltr"
 class="h-11 w-full rounded-xl border border-slate-200 px-3 text-[13px] font-bold text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
 [placeholder]="'FINANCES.WITHDRAWALS.WORKFLOW.TRANSFER_REFERENCE_PLACEHOLDER' | translate">
 </label>
 <label *ngIf="canConfirmManualPayout()" class="block">
 <span class="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-500">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.PROOF_FILE' | translate }}</span>
 <input
 type="file"
 accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
 (change)="onManualProofFileSelected($event)"
 class="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-[12px] font-bold text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-100 file:px-3 file:py-2 file:text-[11px] file:font-black file:text-violet-800 rtl:file:ml-3 rtl:file:mr-0">
 <p *ngIf="manualProofFile" class="mt-2 text-[11px] font-bold text-emerald-700">{{ manualProofFile.name }}</p>
 </label>
 <p *ngIf="isManualPayoutCompleted()" class="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[12px] font-black text-emerald-700">
 {{ 'FINANCES.WITHDRAWALS.WORKFLOW.COMPLETED' | translate }}
 </p>
 </ng-container>
 </ng-container>
 </ng-container>
 </div>

 <footer class="flex gap-3 border-t border-slate-100 px-6 py-4">
 <button
 type="button"
 (click)="closeManualWorkflow()"
 [disabled]="isManualWorkflowSubmitting"
 class="h-10 flex-1 rounded-xl border border-slate-200 text-[12px] font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
 {{ 'FINANCES.WITHDRAWALS.WORKFLOW.CLOSE' | translate }}
 </button>

 <button
 *ngIf="isReturnWorkflow && manualPayout?.status !== 'Reversed'"
 type="button"
 (click)="confirmPayoutReturn()"
 [disabled]="isManualWorkflowSubmitting || isManualWorkflowLoading || !returnReference.trim() || !returnProofFile"
 class="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-600 text-[12px] font-black text-white transition hover:bg-amber-700 disabled:opacity-50">
 <span class="material-symbols-outlined text-[17px]">{{ isManualWorkflowSubmitting ? 'hourglass_empty' : 'keyboard_return' }}</span>
 {{ isManualWorkflowSubmitting ? ('FINANCES.WITHDRAWALS.WORKFLOW.WORKING' | translate) : ('FINANCES.WITHDRAWALS.RETURN_WORKFLOW.CONFIRM_ACTION' | translate) }}
 </button>

 <button
 *ngIf="!isReturnWorkflow && canClaimManualPayout()"
 type="button"
 (click)="claimManualPayout()"
 [disabled]="isManualWorkflowSubmitting"
 class="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-700 text-[12px] font-black text-white transition hover:bg-violet-800 disabled:opacity-50">
 <span class="material-symbols-outlined text-[17px]">lock</span>
 {{ isManualWorkflowSubmitting ? ('FINANCES.WITHDRAWALS.WORKFLOW.WORKING' | translate) : ('FINANCES.WITHDRAWALS.WORKFLOW.CLAIM_ACTION' | translate) }}
 </button>

 <button
 *ngIf="!isReturnWorkflow && canRecordManualBankSubmission()"
 type="button"
 (click)="recordManualBankSubmission()"
 [disabled]="isManualWorkflowSubmitting || !manualBankSubmissionReference.trim()"
 class="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-700 text-[12px] font-black text-white transition hover:bg-violet-800 disabled:opacity-50">
 <span class="material-symbols-outlined text-[17px]">account_balance</span>
 {{ isManualWorkflowSubmitting ? ('FINANCES.WITHDRAWALS.WORKFLOW.WORKING' | translate) : ('FINANCES.WITHDRAWALS.WORKFLOW.SUBMISSION_ACTION' | translate) }}
 </button>

 <button
 *ngIf="!isReturnWorkflow && canConfirmManualPayout()"
 type="button"
 (click)="confirmManualPayout()"
 [disabled]="isManualWorkflowSubmitting || !manualTransferReference.trim() || !manualProofFile"
 class="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-700 text-[12px] font-black text-white transition hover:bg-violet-800 disabled:opacity-50">
 <span class="material-symbols-outlined text-[17px]">{{ isManualWorkflowSubmitting ? 'hourglass_empty' : 'verified' }}</span>
 {{ isManualWorkflowSubmitting ? ('FINANCES.WITHDRAWALS.WORKFLOW.WORKING' | translate) : ('FINANCES.WITHDRAWALS.WORKFLOW.CONFIRM_ACTION' | translate) }}
 </button>
 </footer>
 </section>
 </div>
 `
})
export class WithdrawalsQueueComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
 private readonly walletsService = inject(WalletsService);
 private readonly translate = inject(TranslateService);
 private readonly route = inject(ActivatedRoute);
 private readonly router = inject(Router);
 private readonly destroyRef = inject(DestroyRef);

 withdrawals: AdminDriverWithdrawalRequestDto[] = [];
 isLoading = false;
 page = 1;
 pageSize = 20;
 totalCount = 0;
 status: string | null = null;
 isProcessModalOpen = false;
 isApproving = false;
 isSubmitting = false;
 selectedRequest: AdminDriverWithdrawalRequestDto | null = null;
 isManualProcessingMode = false;

 isManualWorkflowModalOpen = false;
 isManualWorkflowLoading = false;
 isManualWorkflowSubmitting = false;
 manualWorkflowError: string | null = null;
 processError: string | null = null;
 manualWorkflowRequest: AdminDriverWithdrawalRequestDto | null = null;
 manualPayout: AdminPayoutDto | null = null;
 manualBankSubmissionReference = '';
 manualTransferReference = '';
 manualProofFile: File | null = null;
 isReturnWorkflow = false;
 returnReference = '';
 returnReason = '';
 returnProofFile: File | null = null;

 readonly statusOptions: Array<{ labelKey: string; value: string | null }> = [
 { labelKey: 'FINANCES.WITHDRAWALS.TABS.ALL', value: null },
 { labelKey: 'FINANCES.WITHDRAWALS.TABS.PENDING', value: 'Pending' },
 { labelKey: 'FINANCES.WITHDRAWALS.TABS.PROCESSING', value: 'Processing' },
 { labelKey: 'FINANCES.WITHDRAWALS.TABS.PAID', value: 'Paid' },
 { labelKey: 'FINANCES.WITHDRAWALS.TABS.FAILED', value: 'Failed' },
 { labelKey: 'FINANCES.WITHDRAWALS.TABS.RETURNED', value: 'Returned' },
 { labelKey: 'FINANCES.WITHDRAWALS.TABS.CANCELLED', value: 'Cancelled' }
 ];

 processForm = { failureReason: '' };
 private pendingFocusWithdrawalId: string | null = null;
 private pendingFocusPayoutId: string | null = null;

 ngOnInit(): void {
 this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
 this.pendingFocusWithdrawalId = params.get('focus');
 this.pendingFocusPayoutId = params.get('payoutId');
 if (this.pendingFocusWithdrawalId || this.pendingFocusPayoutId) {
 this.loadData(true);
 }
 });

 this.loadData();
 this.loadProcessingMode();
 }

 private loadProcessingMode(): void {
 this.walletsService.getSettlementProcessingSettings().pipe(take(1)).subscribe({
 next: (settings) => {
 this.isManualProcessingMode = settings.settlementProcessingMode === 'Manual';
 this.cdr.markForCheck();
 },
 error: () => {
 this.isManualProcessingMode = false;
 this.cdr.markForCheck();
 }
 });
 }

 loadData(forFocus = false): void {
 this.isLoading = true;
 const shouldLoadAllForFocus = forFocus || !!this.pendingFocusWithdrawalId || !!this.pendingFocusPayoutId;
 this.walletsService.getWithdrawals(
 shouldLoadAllForFocus ? undefined : (this.status ?? undefined),
 shouldLoadAllForFocus ? 1 : this.page,
 shouldLoadAllForFocus ? 100 : this.pageSize
 ).pipe(take(1)).subscribe({
 next: (data) => {
 this.cdr.markForCheck();
 this.withdrawals = data.items;
 this.totalCount = data.totalCount;
 this.isLoading = false;
 this.tryOpenFocusedRequest();
 },
 error: () => {
 this.cdr.markForCheck();
 this.withdrawals = [];
 this.totalCount = 0;
 this.isLoading = false;
 }
 });
 }

 setStatus(value: string | null): void {
 this.status = value;
 this.page = 1;
 this.loadData();
 }

 changePage(page: number): void {
 this.page = page;
 this.loadData();
 }

 openProcessModal(req: AdminDriverWithdrawalRequestDto, isApproving: boolean): void {
 this.selectedRequest = req;
 this.isApproving = isApproving;
 this.processForm = { failureReason: '' };
 this.processError = null;
 this.isProcessModalOpen = true;
 }

 closeProcessModal(): void {
 if (this.isSubmitting) return;
 this.isProcessModalOpen = false;
 }

 submitProcess(): void {
 const selectedRequest = this.selectedRequest;
 if (!selectedRequest) return;

 const failureReason = this.processForm.failureReason.trim();

 if (!this.isApproving &&!failureReason) return;

 this.isSubmitting = true;
 this.processError = null;
 this.walletsService.processWithdrawal(selectedRequest.id, {
 isApproved: this.isApproving,
 failureReason:!this.isApproving ? failureReason : undefined
 }).subscribe({
 next: (result) => {
 this.cdr.markForCheck();
 this.isSubmitting = false;
 this.isProcessModalOpen = false;

 if (this.isApproving && result.manualWorkflowRequired && result.payoutId) {
 const preparedRequest: AdminDriverWithdrawalRequestDto = {
 ...selectedRequest,
 status: result.withdrawalStatus,
 payoutId: result.payoutId
 };
 this.openManualWorkflow(preparedRequest);
 return;
 }

 this.loadData();
 },
 error: (error) => {
 this.cdr.markForCheck();
 this.isSubmitting = false;
 this.processError = this.describeWorkflowError(error);
 }
 });
 }

 openManualWorkflow(req: AdminDriverWithdrawalRequestDto): void {
 if (!req.payoutId) return;

 this.isReturnWorkflow = false;
 this.manualWorkflowRequest = req;
 this.manualPayout = null;
 this.manualWorkflowError = null;
 this.manualBankSubmissionReference = '';
 this.manualTransferReference = '';
 this.manualProofFile = null;
 this.isManualWorkflowModalOpen = true;
 this.loadManualPayout(req.payoutId);
 }

 openReturnWorkflow(req: AdminDriverWithdrawalRequestDto): void {
 if (!req.payoutId || req.status !== 'Paid') return;

 this.isReturnWorkflow = true;
 this.manualWorkflowRequest = req;
 this.manualPayout = null;
 this.manualWorkflowError = null;
 this.returnReference = '';
 this.returnReason = '';
 this.returnProofFile = null;
 this.isManualWorkflowModalOpen = true;
 this.loadManualPayout(req.payoutId);
 }

 closeManualWorkflow(): void {
 if (this.isManualWorkflowSubmitting) return;

 this.isManualWorkflowModalOpen = false;
 this.manualWorkflowError = null;
 this.manualWorkflowRequest = null;
 this.manualPayout = null;
 this.isReturnWorkflow = false;
 this.returnReference = '';
 this.returnReason = '';
 this.returnProofFile = null;
 }

 private loadManualPayout(payoutId: string): void {
 this.isManualWorkflowLoading = true;
 this.manualWorkflowError = null;
 this.walletsService.getPayoutDetail(payoutId).pipe(take(1)).subscribe({
 next: (detail) => {
 this.manualPayout = detail.payout;
 this.isManualWorkflowLoading = false;
 this.cdr.markForCheck();
 },
 error: () => {
 this.isManualWorkflowLoading = false;
 this.manualWorkflowError = 'FINANCES.WITHDRAWALS.WORKFLOW.LOAD_ERROR';
 this.cdr.markForCheck();
 }
 });
 }

 claimManualPayout(): void {
 if (!this.manualPayout) return;

 this.isManualWorkflowSubmitting = true;
 this.manualWorkflowError = null;
 this.walletsService.claimManualPayout(this.manualPayout.id).pipe(take(1)).subscribe({
 next: (payout) => this.completeManualWorkflowOperation(payout),
 error: (error) => this.failManualWorkflowOperation(error)
 });
 }

 recordManualBankSubmission(): void {
 if (!this.manualPayout || !this.manualBankSubmissionReference.trim()) return;

 this.isManualWorkflowSubmitting = true;
 this.manualWorkflowError = null;
 this.walletsService.recordManualBankSubmission(
 this.manualPayout.id,
 this.manualBankSubmissionReference.trim()
 ).pipe(take(1)).subscribe({
 next: (payout) => this.completeManualWorkflowOperation(payout),
 error: (error) => this.failManualWorkflowOperation(error)
 });
 }

 onManualProofFileSelected(event: Event): void {
 const input = event.target as HTMLInputElement;
 this.manualProofFile = input.files?.item(0) ?? null;
 this.cdr.markForCheck();
 }

 onReturnProofFileSelected(event: Event): void {
 const input = event.target as HTMLInputElement;
 this.returnProofFile = input.files?.item(0) ?? null;
 this.cdr.markForCheck();
 }

 confirmManualPayout(): void {
 if (!this.manualPayout || !this.manualProofFile || !this.manualTransferReference.trim()) return;

 this.isManualWorkflowSubmitting = true;
 this.manualWorkflowError = null;
  this.walletsService.uploadManualPayoutProof(this.manualPayout.id, this.manualProofFile).pipe(
  take(1),
  switchMap((proof) => this.walletsService.confirmManualPayout(
  this.manualPayout!.id,
  this.manualTransferReference.trim(),
  proof.id
  ))
 ).subscribe({
 next: (payout) => {
 this.manualProofFile = null;
 this.completeManualWorkflowOperation(payout);
 },
 error: (error) => this.failManualWorkflowOperation(error)
 });
 }

 confirmPayoutReturn(): void {
 if (!this.manualPayout || !this.returnProofFile || !this.returnReference.trim()) return;

 this.isManualWorkflowSubmitting = true;
 this.manualWorkflowError = null;
 this.walletsService.uploadReturnedPayoutProof(this.manualPayout.id, this.returnProofFile).pipe(
 take(1),
 switchMap((proof) => this.walletsService.recordPayoutReturn(
 this.manualPayout!.id,
 this.returnReference.trim(),
 proof.id,
 this.returnReason
 ))
 ).subscribe({
 next: (payout) => {
 this.returnProofFile = null;
 this.completeManualWorkflowOperation(payout);
 },
 error: (error) => this.failManualWorkflowOperation(error)
 });
 }

 canClaimManualPayout(): boolean {
 const reservation = this.manualPayout?.executionReservation;
 return this.manualPayout?.status !== 'Paid' &&
 (!reservation || reservation.status === 'Released');
 }

 canManageManualTransfer(request: AdminDriverWithdrawalRequestDto): boolean {
 return request.status === 'Processing' &&
 !!request.payoutId &&
 (this.isManualProcessingMode || request.providerName === 'Manual');
 }

 canRecordManualBankSubmission(): boolean {
 const reservation = this.manualPayout?.executionReservation;
 return reservation?.mode === 'Manual' && reservation.status === 'Claimed';
 }

 canConfirmManualPayout(): boolean {
 const reservation = this.manualPayout?.executionReservation;
 return reservation?.mode === 'Manual' && reservation.status === 'Submitted';
 }

 isManualPayoutCompleted(): boolean {
 return this.manualPayout?.status === 'Paid' ||
 this.manualPayout?.executionReservation?.status === 'Confirmed';
 }

 private completeManualWorkflowOperation(payout: AdminPayoutDto): void {
 this.manualPayout = payout;
 this.isManualWorkflowSubmitting = false;
 this.loadData();
 this.cdr.markForCheck();
 }

 private failManualWorkflowOperation(error: unknown): void {
 this.isManualWorkflowSubmitting = false;
 this.manualWorkflowError = this.describeWorkflowError(error);
 this.cdr.markForCheck();
 }

 private describeWorkflowError(error: unknown): string {
 const payload = error instanceof HttpErrorResponse ? error.error : null;
 const rawCode = typeof payload === 'string'
 ? payload
 : payload?.errorCode ?? payload?.error ?? payload?.code ?? payload?.title;
 const code = typeof rawCode === 'string' ? rawCode.trim().toUpperCase() : '';
 const translatedCodes = new Set([
 'DRIVER_WITHDRAWAL_NOT_DUE',
 'PAYOUT_DAY_DISABLED',
 'DRIVER_BANK_ACCOUNT_REQUIRED',
 'DRIVER_BANK_IBAN_INVALID',
 'INSUFFICIENT_WITHDRAWABLE_BALANCE',
 'WITHDRAWAL_PROCESSING_CONFLICT',
 'PAYOUT_ALREADY_RESERVED',
 'PAYOUT_CLAIM_OWNERSHIP_REQUIRED',
 'PAYOUT_ALREADY_SUBMITTED',
 'PAYOUT_DUAL_CONTROL_REQUIRED',
 'PAYOUT_NOT_DUE_TODAY',
 'PAYOUT_CONFIRMATION_DAY_INVALID',
 'PAYOUT_PROOF_MANUAL_SUBMISSION_REQUIRED',
 'PAYOUT_PROOF_ALREADY_FINALIZED',
 'PAYOUT_PROOF_RETURN_INVALID_STATUS',
 'PAYOUT_INVALID_STATUS',
 'PAYOUT_REVERSAL_INVALID_STATUS',
 'PAYOUT_REVERSAL_RECONCILIATION_REQUIRED',
 'PAYOUT_CONCURRENTLY_UPDATED',
 'FILE_TOO_LARGE',
 'INVALID_FILE_CONTENT_TYPE',
 'INVALID_FILE_EXTENSION',
 'INVALID_FILE_SIGNATURE',
 'SETTLEMENT_PROCESSING_NOT_MANUAL',
 'BANK_SUBMISSION_REFERENCE_REQUIRED',
 'RETURN_REFERENCE_REQUIRED'
 ]);

 return translatedCodes.has(code)
 ? `FINANCES.WITHDRAWALS.ERRORS.${code}`
 : 'FINANCES.WITHDRAWALS.WORKFLOW.ACTION_ERROR';
 }

 private tryOpenFocusedRequest(): void {
 const withdrawalId = this.pendingFocusWithdrawalId;
 const payoutId = this.pendingFocusPayoutId;
 if (!withdrawalId && !payoutId) {
 return;
 }

 const request = withdrawalId
 ? this.withdrawals.find((item) => item.id === withdrawalId)
 : this.withdrawals.find((item) => item.payoutId === payoutId);
 if (!request) {
 return;
 }

 this.pendingFocusWithdrawalId = null;
 this.pendingFocusPayoutId = null;
 this.clearFinanceFocusQueryParams();
 this.openNotificationTarget(request);
 }

 private openNotificationTarget(request: AdminDriverWithdrawalRequestDto): void {
 if (request.payoutId && ['Processing', 'Paid', 'Failed', 'Returned'].includes(request.status)) {
 this.openManualWorkflow(request);
 return;
 }

 if (request.status === 'Pending') {
 this.openProcessModal(request, true);
 }
 }

 private clearFinanceFocusQueryParams(): void {
 void this.router.navigate([], {
 relativeTo: this.route,
 queryParams: { focus: null, payoutId: null },
 queryParamsHandling: 'merge',
 replaceUrl: true
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

 getTranslatedStatus(status: string): string {
 return `FINANCES.WITHDRAWALS.STATUS_LABELS.${(status || '').toUpperCase()}`;
 }

 getTranslatedPayoutStatus(status: string): string {
 return `FINANCES.WITHDRAWALS.PAYOUT_STATUS.${(status || '').toUpperCase()}`;
 }

 getStatusBadgeClass(status: string): string {
 const map: Record<string, string> = {
 Pending: 'bg-amber-50 text-amber-700 border-amber-200',
 Processing: 'bg-blue-50 text-blue-700 border-blue-200',
 Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
 Failed: 'bg-red-50 text-red-700 border-red-200',
 Returned: 'bg-violet-50 text-violet-700 border-violet-200',
 Cancelled: 'bg-slate-100 text-slate-600 border-slate-200'
 };
 return map[status] ?? 'bg-slate-100 text-slate-600 border-slate-200';
 }
}
