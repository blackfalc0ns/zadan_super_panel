import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';

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
 AppPageHeaderComponent,
 AppButtonComponent
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
 {{ getTranslatedStatus(req.status) }}
 </span>
 <p *ngIf="req.transferReference" class="mt-1.5 text-[11px] font-bold text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded w-fit">
 Ref: {{ req.transferReference }}
 </p>
 <p *ngIf="req.failureReason" class="mt-1.5 text-[11px] font-bold text-red-500 line-clamp-2" [title]="req.failureReason">
 {{ 'FINANCES.WITHDRAWALS.TABLE.FAILURE_REASON' | translate }}: {{ req.failureReason }}
 </p>
 </div>
 </div>

 <div class="flex flex-col items-start xl:items-end gap-4 shrink-0 min-w-[200px] border-t xl:border-t-0 border-slate-100 pt-4 xl:pt-0 w-full xl:w-auto">
 <div class="text-right w-full xl:w-auto rtl:text-left text-left">
 <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{{ 'FINANCES.WITHDRAWALS.TABLE.AMOUNT_REQUESTED' | translate }}</p>
 <p class="text-xl font-black text-amber-700 tabular-nums leading-none tracking-tight">{{ formatNumber(req.amount) }} <span class="text-[12px] font-bold">SAR</span></p>
 </div>

 <div class="flex gap-2 w-full xl:w-auto" *ngIf="req.status === 'Pending' || req.status === 'Processing'">
 <app-button *ngIf="req.status === 'Pending' || !req.payoutId" variant="primary" size="sm" customClass="!rounded-xl flex-1 xl:flex-none shadow-sm !bg-emerald-600 hover:!bg-emerald-700" (btnClick)="openProcessModal(req, true)">
 {{ 'FINANCES.WITHDRAWALS.TABLE.APPROVE' | translate }}
 </app-button>
 <app-button *ngIf="canManageManualTransfer(req)" variant="primary" size="sm" customClass="!rounded-xl flex-1 xl:flex-none shadow-sm !bg-indigo-600 hover:!bg-indigo-700" (btnClick)="openManualWorkflow(req)">
 {{ 'FINANCES.WITHDRAWALS.TABLE.MANAGE_MANUAL_TRANSFER' | translate }}
 </app-button>
 <app-button variant="outline" size="sm" customClass="!rounded-xl flex-1 xl:flex-none border-red-200 text-red-600 hover:bg-red-50" (btnClick)="openProcessModal(req, false)">
 {{ 'FINANCES.WITHDRAWALS.TABLE.REJECT' | translate }}
 </app-button>
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

 <!-- نافذة معالجة الطلب (Process Modal) -->
 <div *ngIf="isProcessModalOpen && selectedRequest" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" (click)="closeProcessModal()"></div>
 <div class="relative bg-white rounded-3xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
 
 <div class="px-6 py-6 text-white text-center"
 [ngClass]="isApproving ? 'bg-emerald-600' : 'bg-red-600'">
 <div class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
 <span class="material-symbols-outlined text-[28px]">{{ isApproving ? 'check_circle' : 'cancel' }}</span>
 </div>
 <h3 class="text-xl font-black mb-1">
 {{ (isApproving ? 'FINANCES.WITHDRAWALS.MODAL.TITLE_APPROVE' : 'FINANCES.WITHDRAWALS.MODAL.TITLE_REJECT') | translate }}
 </h3>
 <p class="text-sm font-medium text-white/90">
 {{ 'FINANCES.WITHDRAWALS.MODAL.DRIVER' | translate }}: {{ selectedRequest.driverName }} • {{ 'FINANCES.WITHDRAWALS.MODAL.AMOUNT' | translate }}: {{ formatNumber(selectedRequest.amount) }} {{ 'FINANCES.CURRENCY' | translate }}
 </p>
 </div>

 <div class="p-6 space-y-5">
 <!-- Payout Method Hint -->
 <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
 <span class="material-symbols-outlined text-slate-400 mt-0.5 text-[20px]">account_balance</span>
 <div>
 <p class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.WITHDRAWALS.MODAL.PAYOUT_METHOD' | translate }}</p>
 <p class="text-[13px] font-black text-slate-800 mt-0.5">{{ selectedRequest.payoutMethod?.providerName || selectedRequest.payoutMethod?.methodType || ('FINANCES.WITHDRAWALS.MODAL.NOT_AVAILABLE' | translate) }}</p>
 <p class="text-[12px] font-bold text-slate-600 font-mono mt-0.5" dir="ltr">{{ selectedRequest.payoutMethod?.maskedLabel || 'N/A' }}</p>
 </div>
 </div>

 <div *ngIf="isApproving" class="rounded-xl border border-emerald-100 bg-emerald-50 p-4 flex items-start gap-3">
 <span class="material-symbols-outlined text-emerald-600 text-[20px]">info</span>
 <p class="text-[12px] leading-6 font-bold text-emerald-800">{{ 'FINANCES.WITHDRAWALS.MODAL.PREPARE_HINT' | translate }}</p>
 </div>

 <div *ngIf="!isApproving" class="space-y-2">
 <label class="block text-[11px] font-bold text-slate-600">{{ 'FINANCES.WITHDRAWALS.MODAL.REJECT_REASON' | translate }}</label>
 <textarea [(ngModel)]="processForm.failureReason" rows="3"
 class="w-full bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 py-3 px-4 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder:font-medium resize-none"
 [placeholder]="'FINANCES.WITHDRAWALS.MODAL.REJECT_REASON_PLACEHOLDER' | translate"></textarea>
 </div>
 </div>

 <div class="flex gap-3 px-6 py-5 border-t border-slate-100 bg-slate-50/50">
 <app-button variant="ghost" size="md" customClass="!rounded-xl flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" (btnClick)="closeProcessModal()">
 {{ 'FINANCES.WITHDRAWALS.MODAL.CANCEL' | translate }}
 </app-button>
 <app-button variant="primary" size="md" customClass="!rounded-xl flex-1 shadow-md"
 [ngClass]="isApproving ? '!bg-emerald-600 hover:!bg-emerald-700 shadow-emerald-600/20' : '!bg-red-600 hover:!bg-red-700 shadow-red-600/20'"
 (btnClick)="submitProcess()"
 [disabled]="isSubmitting || (!isApproving &&!processForm.failureReason.trim())">
 {{ isSubmitting ? ('FINANCES.WITHDRAWALS.MODAL.PROCESSING' | translate) : ('FINANCES.WITHDRAWALS.MODAL.CONFIRM' | translate) }}
 </app-button>
 </div>
 </div>
 </div>

 <!-- Manual bank workflow: prepare -> claim -> bank submission -> proof/confirm -->
 <div *ngIf="isManualWorkflowModalOpen && manualWorkflowRequest" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
 <div class="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" (click)="closeManualWorkflow()"></div>
 <div class="relative w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
 <div class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
 <div class="flex items-start gap-3">
 <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
 <span class="material-symbols-outlined">account_balance</span>
 </div>
 <div>
 <h3 class="text-lg font-black text-slate-900">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.TITLE' | translate }}</h3>
 <p class="mt-1 text-[12px] font-bold text-slate-500">{{ manualWorkflowRequest.driverName }} · {{ formatNumber(manualWorkflowRequest.amount) }} {{ 'FINANCES.CURRENCY' | translate }}</p>
 </div>
 </div>
 <button type="button" class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" (click)="closeManualWorkflow()" [attr.aria-label]="'FINANCES.WITHDRAWALS.WORKFLOW.CLOSE' | translate">
 <span class="material-symbols-outlined">close</span>
 </button>
 </div>

 <div class="space-y-4 p-6">
 <div *ngIf="isManualWorkflowLoading" class="flex items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-12 text-sm font-bold text-slate-500">
 <span class="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"></span>
 {{ 'FINANCES.WITHDRAWALS.WORKFLOW.LOADING' | translate }}
 </div>

 <div *ngIf="manualWorkflowError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-bold text-red-700">
 {{ manualWorkflowError | translate }}
 </div>

 <ng-container *ngIf="!isManualWorkflowLoading && manualPayout as payout">
 <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
 <div class="flex flex-wrap items-center justify-between gap-2">
 <div>
 <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.PAYOUT_ID' | translate }}</p>
 <p class="mt-1 break-all font-mono text-[11px] font-bold text-slate-700">{{ payout.id }}</p>
 </div>
 <span class="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-black text-indigo-700">{{ payout.status }}</span>
 </div>
 </div>

 <div class="space-y-3">
 <section class="rounded-2xl border p-4" [ngClass]="canClaimManualPayout() ? 'border-indigo-200 bg-indigo-50/40' : 'border-slate-200 bg-white'">
 <div class="flex items-start gap-3">
 <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[12px] font-black text-white">1</div>
 <div class="min-w-0 flex-1">
 <h4 class="text-[13px] font-black text-slate-900">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.CLAIM_TITLE' | translate }}</h4>
 <p class="mt-1 text-[12px] leading-5 font-medium text-slate-600">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.CLAIM_DESC' | translate }}</p>
 <p *ngIf="manualPayout.executionReservation?.status === 'Claimed'" class="mt-2 text-[11px] font-black text-indigo-700">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.CLAIMED' | translate }}</p>
 <app-button *ngIf="canClaimManualPayout()" variant="primary" size="sm" customClass="mt-3 !rounded-xl !bg-indigo-600 hover:!bg-indigo-700" (btnClick)="claimManualPayout()" [disabled]="isManualWorkflowSubmitting">
 {{ isManualWorkflowSubmitting ? ('FINANCES.WITHDRAWALS.WORKFLOW.WORKING' | translate) : ('FINANCES.WITHDRAWALS.WORKFLOW.CLAIM_ACTION' | translate) }}
 </app-button>
 </div>
 </div>
 </section>

 <section class="rounded-2xl border p-4" [ngClass]="canRecordManualBankSubmission() ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200 bg-slate-50/50'">
 <div class="flex items-start gap-3">
 <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[12px] font-black text-white">2</div>
 <div class="min-w-0 flex-1">
 <h4 class="text-[13px] font-black text-slate-900">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.SUBMISSION_TITLE' | translate }}</h4>
 <p class="mt-1 text-[12px] leading-5 font-medium text-slate-600">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.SUBMISSION_DESC' | translate }}</p>
 <p *ngIf="manualPayout.executionReservation?.status === 'Submitted'" class="mt-2 break-all text-[11px] font-black text-amber-700">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.SUBMITTED' | translate }}: {{ manualPayout.executionReservation?.submissionReference }}</p>
 <div *ngIf="canRecordManualBankSubmission()" class="mt-3 space-y-2">
 <label class="block text-[11px] font-bold text-slate-600">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.SUBMISSION_REFERENCE' | translate }}</label>
 <input type="text" [(ngModel)]="manualBankSubmissionReference" class="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-[13px] font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" [placeholder]="'FINANCES.WITHDRAWALS.WORKFLOW.SUBMISSION_REFERENCE_PLACEHOLDER' | translate">
 <app-button variant="primary" size="sm" customClass="!rounded-xl !bg-amber-500 hover:!bg-amber-600" (btnClick)="recordManualBankSubmission()" [disabled]="isManualWorkflowSubmitting || !manualBankSubmissionReference.trim()">
 {{ 'FINANCES.WITHDRAWALS.WORKFLOW.SUBMISSION_ACTION' | translate }}
 </app-button>
 </div>
 </div>
 </div>
 </section>

 <section class="rounded-2xl border p-4" [ngClass]="canConfirmManualPayout() ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50/50'">
 <div class="flex items-start gap-3">
 <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[12px] font-black text-white">3</div>
 <div class="min-w-0 flex-1">
 <h4 class="text-[13px] font-black text-slate-900">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.CONFIRM_TITLE' | translate }}</h4>
 <p class="mt-1 text-[12px] leading-5 font-medium text-slate-600">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.CONFIRM_DESC' | translate }}</p>
 <div *ngIf="canConfirmManualPayout()" class="mt-3 space-y-3">
 <div class="space-y-2">
 <label class="block text-[11px] font-bold text-slate-600">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.TRANSFER_REFERENCE' | translate }}</label>
 <input type="text" [(ngModel)]="manualTransferReference" class="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-[13px] font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" [placeholder]="'FINANCES.WITHDRAWALS.WORKFLOW.TRANSFER_REFERENCE_PLACEHOLDER' | translate">
 </div>
 <label class="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-emerald-300 bg-white px-3 py-3 hover:bg-emerald-50">
 <span class="flex items-center gap-2 text-[12px] font-bold text-slate-700"><span class="material-symbols-outlined text-emerald-600">upload_file</span>{{ manualProofFile ? manualProofFile.name : ('FINANCES.WITHDRAWALS.WORKFLOW.PROOF_FILE' | translate) }}</span>
 <span class="text-[11px] font-black text-emerald-700">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.CHOOSE_FILE' | translate }}</span>
 <input type="file" class="hidden" accept="image/*,.pdf" (change)="onManualProofFileSelected($event)">
 </label>
 <app-button variant="primary" size="sm" customClass="!rounded-xl !bg-emerald-600 hover:!bg-emerald-700" (btnClick)="confirmManualPayout()" [disabled]="isManualWorkflowSubmitting || !manualTransferReference.trim() || !manualProofFile">
 {{ isManualWorkflowSubmitting ? ('FINANCES.WITHDRAWALS.WORKFLOW.WORKING' | translate) : ('FINANCES.WITHDRAWALS.WORKFLOW.CONFIRM_ACTION' | translate) }}
 </app-button>
 </div>
 <p *ngIf="isManualPayoutCompleted()" class="mt-2 text-[11px] font-black text-emerald-700">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.COMPLETED' | translate }}</p>
 </div>
 </div>
 </section>
 </div>
 </ng-container>
 </div>

 <div class="sticky bottom-0 border-t border-slate-100 bg-white px-6 py-4">
 <app-button variant="outline" size="sm" customClass="!rounded-xl" (btnClick)="closeManualWorkflow()" [disabled]="isManualWorkflowSubmitting">
 {{ 'FINANCES.WITHDRAWALS.WORKFLOW.CLOSE' | translate }}
 </app-button>
 </div>
 </div>
 </div>
 `
})
export class WithdrawalsQueueComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
 private readonly walletsService = inject(WalletsService);
 private readonly translate = inject(TranslateService);

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
 manualWorkflowRequest: AdminDriverWithdrawalRequestDto | null = null;
 manualPayout: AdminPayoutDto | null = null;
 manualBankSubmissionReference = '';
 manualTransferReference = '';
 manualProofFile: File | null = null;

 readonly statusOptions: Array<{ labelKey: string; value: string | null }> = [
 { labelKey: 'FINANCES.WITHDRAWALS.TABS.ALL', value: null },
 { labelKey: 'FINANCES.WITHDRAWALS.TABS.PENDING', value: 'Pending' },
 { labelKey: 'FINANCES.WITHDRAWALS.TABS.PROCESSING', value: 'Processing' },
 { labelKey: 'FINANCES.WITHDRAWALS.TABS.PAID', value: 'Paid' },
 { labelKey: 'FINANCES.WITHDRAWALS.TABS.FAILED', value: 'Failed' },
 { labelKey: 'FINANCES.WITHDRAWALS.TABS.CANCELLED', value: 'Cancelled' }
 ];

 processForm = { failureReason: '' };

 ngOnInit(): void {
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

 loadData(): void {
 this.isLoading = true;
 this.walletsService.getWithdrawals(this.status ?? undefined, this.page, this.pageSize).pipe(take(1)).subscribe({
 next: (data) => {
 this.cdr.markForCheck();
 this.withdrawals = data.items;
 this.totalCount = data.totalCount;
 this.isLoading = false;
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
 error: () => {
 this.cdr.markForCheck();
 this.isSubmitting = false;
 }
 });
 }

 openManualWorkflow(req: AdminDriverWithdrawalRequestDto): void {
 if (!req.payoutId) return;

 this.manualWorkflowRequest = req;
 this.manualPayout = null;
 this.manualWorkflowError = null;
 this.manualBankSubmissionReference = '';
 this.manualTransferReference = '';
 this.manualProofFile = null;
 this.isManualWorkflowModalOpen = true;
 this.loadManualPayout(req.payoutId);
 }

 closeManualWorkflow(): void {
 if (this.isManualWorkflowSubmitting) return;

 this.isManualWorkflowModalOpen = false;
 this.manualWorkflowError = null;
 this.manualWorkflowRequest = null;
 this.manualPayout = null;
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
 error: () => this.failManualWorkflowOperation()
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
 error: () => this.failManualWorkflowOperation()
 });
 }

 onManualProofFileSelected(event: Event): void {
 const input = event.target as HTMLInputElement;
 this.manualProofFile = input.files?.item(0) ?? null;
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
 error: () => this.failManualWorkflowOperation()
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

 private failManualWorkflowOperation(): void {
 this.isManualWorkflowSubmitting = false;
 this.manualWorkflowError = 'FINANCES.WITHDRAWALS.WORKFLOW.ACTION_ERROR';
 this.cdr.markForCheck();
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
 return `FINANCES.WITHDRAWALS.STATUS_LABELS.${status.toUpperCase()}`;
 }

 getStatusBadgeClass(status: string): string {
 const map: Record<string, string> = {
 Pending: 'bg-amber-50 text-amber-700 border-amber-200',
 Processing: 'bg-blue-50 text-blue-700 border-blue-200',
 Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
 Failed: 'bg-red-50 text-red-700 border-red-200',
 Cancelled: 'bg-slate-100 text-slate-600 border-slate-200'
 };
 return map[status] ?? 'bg-slate-100 text-slate-600 border-slate-200';
 }
}
