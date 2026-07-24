import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, forkJoin, take } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FinanceService } from '../../services/finance.service';
import { Settlement, EntityType, SettlementPayout } from '../../models/finance.models';
import { FinanceStatusBadgeComponent } from '../../components/finance-status-badge/finance-status-badge.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { KeyValueGridComponent, KeyValueGridItem } from '../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { getFinanceLocale } from '../../utils/finance-i18n.utils';
import { buildFinanceScopedProfileNavigation } from '../../utils/finance-profile-navigation.utils';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { VendorService } from '@vendors/public-api';
import {
 CreateSettlementModalComponent,
 SettlementConfig
} from '../../../vendors/components/workflows/create-settlement-modal/create-settlement-modal.component';

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-settlements',
 standalone: true,
 imports: [
 CommonModule,
 FormsModule,
 TranslateModule, 
 FinanceStatusBadgeComponent, 
 AppCardComponent, 
 AppButtonComponent, 
 InlineBannerComponent, 
 KeyValueGridComponent,
 AppPageHeaderComponent,
 AppPaginationComponent,
 CreateSettlementModalComponent
 ],
 template: `
 <app-create-settlement-modal
 [isOpen]="showCreateSettlementModal"
 [vendorId]="createVendorId"
 [vendorName]="createVendorName"
 [currentBalance]="createPendingBalance"
 [availableBalance]="createAvailableBalance"
 [totalSales]="createTotalSales"
 [returns]="0"
 [additionalFees]="createAdditionalFees"
 [financialAdjustments]="0"
 [bankName]="createBankName"
 [bankIban]="createBankIban"
 [bankVerified]="createBankVerified"
 (close)="closeCreateSettlementModal()"
 (createSettlement)="onSettlementCreated($event)">
 </app-create-settlement-modal>

 <div *ngIf="showVendorPicker" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
 <div class="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" (click)="closeVendorPicker()"></div>
 <section class="relative flex w-full max-w-lg max-h-[90vh] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
 <header class="border-b border-cyan-100 bg-cyan-50 px-6 py-5">
 <div class="flex items-start justify-between gap-4">
 <div class="flex gap-3">
 <span class="material-symbols-outlined mt-0.5 text-[24px] text-cyan-700">storefront</span>
 <div>
 <h2 class="text-[16px] font-black text-slate-950">{{ 'FINANCES.SETTLEMENTS.VENDOR_PICKER.TITLE' | translate }}</h2>
 <p class="mt-1 text-[12px] font-medium leading-relaxed text-slate-600">{{ 'FINANCES.SETTLEMENTS.VENDOR_PICKER.DESC' | translate }}</p>
 </div>
 </div>
 <button type="button" (click)="closeVendorPicker()" class="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-slate-900">
 <span class="material-symbols-outlined text-[18px]">close</span>
 </button>
 </div>
 </header>
 <div class="flex min-h-0 flex-1 flex-col">
 <div class="space-y-3 border-b border-slate-100 px-6 py-4">
 <div class="flex gap-2">
 <input
 [(ngModel)]="vendorSearch"
 name="vendorSearch"
 type="search"
 (keydown.enter)="$event.preventDefault(); searchVendors(true)"
 class="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-[13px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
 [placeholder]="'FINANCES.SETTLEMENTS.VENDOR_PICKER.SEARCH_PLACEHOLDER' | translate" />
 <button
 type="button"
 (click)="searchVendors(true)"
 [disabled]="isSearchingVendors"
 class="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-zadna-primary px-4 text-[12px] font-black text-white transition hover:opacity-90 disabled:opacity-50">
 <span class="material-symbols-outlined text-[18px]">{{ isSearchingVendors ? 'hourglass_empty' : 'search' }}</span>
 {{ 'FINANCES.SETTLEMENTS.VENDOR_PICKER.SEARCH' | translate }}
 </button>
 </div>
 </div>
 <div class="min-h-0 flex-1 space-y-2 overflow-y-auto px-6 py-4">
 <div *ngIf="isSearchingVendors" class="space-y-2">
 <div *ngFor="let _ of [1,2,3]" class="h-12 animate-pulse rounded-xl bg-slate-100"></div>
 </div>
 <ng-container *ngIf="!isSearchingVendors">
 <div *ngIf="vendorPickerOptions.length === 0" class="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-[12px] font-bold text-slate-500">
 {{ 'FINANCES.SETTLEMENTS.VENDOR_PICKER.NO_VENDORS' | translate }}
 </div>
 <button
 *ngFor="let vendor of vendorPickerOptions"
 type="button"
 (click)="selectVendorForSettlement(vendor.id, vendor.name)"
 class="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-start transition hover:border-cyan-200 hover:bg-cyan-50">
 <span class="grid h-9 w-9 place-items-center rounded-lg bg-cyan-100 text-cyan-700">
 <span class="material-symbols-outlined text-[18px]">storefront</span>
 </span>
 <span class="min-w-0 flex-1">
 <span class="block truncate text-[13px] font-black text-slate-900">{{ vendor.name }}</span>
 <span class="mt-0.5 block truncate font-mono text-[10px] font-bold text-slate-400" dir="ltr">{{ vendor.id }}</span>
 </span>
 </button>
 </ng-container>
 </div>
 <div *ngIf="!isSearchingVendors && vendorPickerTotalCount > vendorPickerPageSize" class="border-t border-slate-100 px-4 py-3">
 <app-pagination
 [currentPage]="vendorPickerPage"
 [pageSize]="vendorPickerPageSize"
 [totalItems]="vendorPickerTotalCount"
 (pageChange)="changeVendorPickerPage($event)">
 </app-pagination>
 </div>
 </div>
 </section>
 </div>

 <div *ngIf="manualPayout" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
 <div class="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" (click)="closeManualConfirmation()"></div>
 <section class="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
 <header class="border-b border-violet-100 bg-violet-50 px-6 py-5">
 <div class="flex items-start justify-between gap-4">
 <div class="flex gap-3">
 <span class="material-symbols-outlined mt-0.5 text-[24px] text-violet-700">receipt_long</span>
 <div>
 <h2 class="text-[16px] font-black text-slate-950">{{ 'FINANCES.SETTLEMENTS.MANUAL_CONFIRM.TITLE' | translate }}</h2>
 <p class="mt-1 text-[12px] font-medium leading-relaxed text-slate-600">{{ 'FINANCES.SETTLEMENTS.MANUAL_CONFIRM.DESCRIPTION' | translate }}</p>
 </div>
 </div>
 <button type="button" (click)="closeManualConfirmation()" [disabled]="isConfirmingManualPayout" class="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-slate-900 disabled:opacity-50">
 <span class="material-symbols-outlined text-[18px]">close</span>
 </button>
 </div>
 </header>
  <div class="space-y-5 p-6">
  <div class="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
  <p class="text-[10px] font-black uppercase tracking-wider text-emerald-700">{{ 'FINANCES.SETTLEMENTS.NET_DUE' | translate }}</p>
  <p class="mt-1 text-xl font-black text-emerald-800">{{ formatNumber(manualPayout.amount) }} {{ 'FINANCES.CURRENCY' | translate }}</p>
  <p *ngIf="manualPayout.destinationMaskedLabel" class="mt-1 text-[11px] font-bold text-emerald-700">{{ manualPayout.destinationMaskedLabel }}</p>
  </div>
  <div class="grid grid-cols-3 gap-2 text-center text-[10px] font-black">
  <span [class.text-violet-700]="manualWorkflowStage === 'claim'" [class.text-slate-400]="manualWorkflowStage !== 'claim'">1. {{ 'FINANCES.WITHDRAWALS.WORKFLOW.CLAIM_TITLE' | translate }}</span>
  <span [class.text-violet-700]="manualWorkflowStage === 'submission'" [class.text-slate-400]="manualWorkflowStage !== 'submission'">2. {{ 'FINANCES.WITHDRAWALS.WORKFLOW.SUBMISSION_TITLE' | translate }}</span>
  <span [class.text-violet-700]="manualWorkflowStage === 'confirmation'" [class.text-slate-400]="manualWorkflowStage !== 'confirmation'">3. {{ 'FINANCES.WITHDRAWALS.WORKFLOW.CONFIRM_TITLE' | translate }}</span>
  </div>
  <ng-container *ngIf="manualWorkflowStage === 'claim'">
  <p class="rounded-xl border border-violet-100 bg-violet-50 px-3 py-3 text-[12px] font-medium leading-5 text-violet-900">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.CLAIM_DESC' | translate }}</p>
  </ng-container>
  <ng-container *ngIf="manualWorkflowStage === 'submission'">
  <label class="block">
  <span class="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-500">{{ 'FINANCES.WITHDRAWALS.WORKFLOW.SUBMISSION_REFERENCE' | translate }}</span>
  <input [(ngModel)]="manualBankSubmissionReference" name="manualBankSubmissionReference" type="text" dir="ltr" class="h-11 w-full rounded-xl border border-slate-200 px-3 text-[13px] font-bold text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" [placeholder]="'FINANCES.WITHDRAWALS.WORKFLOW.SUBMISSION_REFERENCE_PLACEHOLDER' | translate" />
  </label>
  </ng-container>
  <ng-container *ngIf="manualWorkflowStage === 'confirmation'">
  <label class="block">
  <span class="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-500">{{ 'FINANCES.SETTLEMENTS.MANUAL_CONFIRM.REFERENCE' | translate }}</span>
  <input [(ngModel)]="manualTransferReference" name="manualTransferReference" type="text" dir="ltr" class="h-11 w-full rounded-xl border border-slate-200 px-3 text-[13px] font-bold text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" [placeholder]="'FINANCES.SETTLEMENTS.MANUAL_CONFIRM.REFERENCE_PLACEHOLDER' | translate" />
  </label>
  <label class="block">
 <span class="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-500">{{ 'FINANCES.SETTLEMENTS.MANUAL_CONFIRM.PROOF' | translate }}</span>
 <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf" (change)="onProofSelected($event)" class="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-[12px] font-bold text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-100 file:px-3 file:py-2 file:text-[11px] file:font-black file:text-violet-800" />
  <p *ngIf="manualProofFile" class="mt-2 text-[11px] font-bold text-emerald-700">{{ manualProofFile.name }}</p>
  </label>
  </ng-container>
  <p *ngIf="manualConfirmationError" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-bold text-rose-700">{{ manualConfirmationError }}</p>
 </div>
 <footer class="flex gap-3 border-t border-slate-100 px-6 py-4">
 <button type="button" (click)="closeManualConfirmation()" [disabled]="isConfirmingManualPayout" class="h-10 flex-1 rounded-xl border border-slate-200 text-[12px] font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">{{ 'COMMON.CANCEL' | translate }}</button>
  <button *ngIf="manualWorkflowStage === 'claim'" type="button" (click)="claimManualPayout()" [disabled]="isConfirmingManualPayout" class="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-700 text-[12px] font-black text-white transition hover:bg-violet-800 disabled:opacity-50">
  <span class="material-symbols-outlined text-[17px]">lock</span>
  {{ 'FINANCES.WITHDRAWALS.WORKFLOW.CLAIM_ACTION' | translate }}
  </button>
  <button *ngIf="manualWorkflowStage === 'submission'" type="button" (click)="recordManualBankSubmission()" [disabled]="isConfirmingManualPayout || !manualBankSubmissionReference.trim()" class="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-700 text-[12px] font-black text-white transition hover:bg-violet-800 disabled:opacity-50">
  <span class="material-symbols-outlined text-[17px]">account_balance</span>
  {{ 'FINANCES.WITHDRAWALS.WORKFLOW.SUBMISSION_ACTION' | translate }}
  </button>
  <button *ngIf="manualWorkflowStage === 'confirmation'" type="button" (click)="confirmManualPayout()" [disabled]="isConfirmingManualPayout || !manualProofFile || !manualTransferReference.trim()" class="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-700 text-[12px] font-black text-white transition hover:bg-violet-800 disabled:opacity-50">
 <span class="material-symbols-outlined text-[17px]">{{ isConfirmingManualPayout ? 'hourglass_empty' : 'verified' }}</span>
 {{ (isConfirmingManualPayout ? 'FINANCES.SETTLEMENTS.MANUAL_CONFIRM.CONFIRMING' : 'FINANCES.SETTLEMENTS.MANUAL_CONFIRM.CONFIRM') | translate }}
 </button>
 </footer>
 </section>
 </div>

 <!-- نافذة تفاصيل التسوية (Settlement Detail Modal) -->
 <div *ngIf="selectedSettlement" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" (click)="selectedSettlement = null"></div>
 <div class="relative flex w-full max-w-lg max-h-[90vh] flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
 <header class="flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-6 py-5">
 <div class="min-w-0">
 <p class="text-[10px] font-black uppercase tracking-[0.18em] text-zadna-primary">{{ 'FINANCES.SETTLEMENTS.DETAIL_BADGE' | translate }}</p>
 <h3 class="mt-1 text-[16px] font-black text-slate-900">{{ 'FINANCES.SETTLEMENTS.DETAIL_TITLE' | translate }}</h3>
 <p class="mt-1 font-mono text-[11px] font-bold text-slate-500">{{ selectedSettlement.settlementCode }}</p>
 </div>
 <button type="button" class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800" (click)="selectedSettlement = null">
 <span class="material-symbols-outlined text-[20px]">close</span>
 </button>
 </header>

 <div class="flex-1 space-y-5 overflow-y-auto p-6">
 <div class="flex items-center gap-3">
 <div class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border"
 [ngClass]="selectedSettlement.entityType === 'vendor' ? 'bg-cyan-50 border-cyan-100 text-cyan-600' : 'bg-amber-50 border-amber-100 text-amber-600'">
 <span class="material-symbols-outlined text-[24px]">
 {{ selectedSettlement.entityType === 'vendor' ? 'storefront' : 'local_shipping' }}
 </span>
 </div>
 <div class="min-w-0">
 <p class="truncate text-[15px] font-black leading-tight text-slate-900">{{ selectedSettlement.entityName }}</p>
 <span class="mt-1 inline-flex rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
 [ngClass]="selectedSettlement.entityType === 'vendor' ? 'bg-cyan-50 text-cyan-700 border-cyan-100' : 'bg-amber-50 text-amber-700 border-amber-100'">
 {{ (selectedSettlement.entityType === 'vendor' ? 'FINANCES.ENTITIES.VENDOR' : 'FINANCES.ENTITIES.DRIVER') | translate }}
 </span>
 </div>
 </div>

 <div class="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 text-center">
 <p class="mb-2 text-[11px] font-black uppercase tracking-widest text-emerald-600">{{ 'FINANCES.SETTLEMENTS.NET_DUE' | translate }}</p>
 <p class="text-3xl font-black tracking-tight text-emerald-700 tabular-nums sm:text-4xl">
 {{ formatNumber(selectedSettlement.netAmount) }}
 <span class="text-[14px] font-bold">{{ 'FINANCES.CURRENCY' | translate }}</span>
 </p>
 <div class="mt-3 flex justify-center">
 <app-finance-status-badge [status]="selectedSettlement.status"></app-finance-status-badge>
 </div>
 </div>

 <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60">
 <div class="flex items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-3">
 <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.SETTLEMENTS.GROSS_REVENUE' | translate }}</span>
 <span class="text-[13px] font-black text-slate-900 tabular-nums" dir="ltr">{{ formatNumber(selectedSettlement.grossAmount) }} {{ 'FINANCES.CURRENCY' | translate }}</span>
 </div>
 <div class="flex items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-3">
 <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.SETTLEMENTS.DEDUCTIONS' | translate }}</span>
 <span class="text-[13px] font-black text-red-600 tabular-nums" dir="ltr">-{{ formatNumber(selectedSettlement.deductions) }} {{ 'FINANCES.CURRENCY' | translate }}</span>
 </div>
 <div class="flex items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-3">
 <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.SETTLEMENTS.ORDERS_COUNT' | translate }}</span>
 <span class="text-[13px] font-black text-slate-800 tabular-nums">{{ 'FINANCES.SETTLEMENTS.ORDERS_COUNT_VAL' | translate: { count: selectedSettlement.ordersCount } }}</span>
 </div>
 <div class="flex items-center justify-between gap-3 px-4 py-3">
 <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.SETTLEMENTS.FINANCIAL_PERIOD' | translate }}</span>
 <span class="text-[12px] font-bold text-slate-700" dir="ltr">{{ formatDate(selectedSettlement.periodFrom) }} - {{ formatDate(selectedSettlement.periodTo) }}</span>
 </div>
 </div>

 <section class="rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
 <div class="mb-3 flex items-center gap-2">
 <span class="grid h-8 w-8 place-items-center rounded-xl bg-violet-100 text-violet-700">
 <span class="material-symbols-outlined text-[18px]">verified</span>
 </span>
 <div>
 <h4 class="text-[13px] font-black text-slate-900">{{ 'FINANCES.SETTLEMENTS.PROOF_SECTION.TITLE' | translate }}</h4>
 <p class="text-[10px] font-bold text-slate-500">{{ 'FINANCES.SETTLEMENTS.PROOF_SECTION.SUBTITLE' | translate }}</p>
 </div>
 </div>

 <ng-container *ngIf="getConfirmedManualPayout(selectedSettlement) as confirmedPayout; else noProofYet">
 <div class="space-y-3 rounded-xl border border-white bg-white p-3 shadow-sm">
 <div *ngIf="confirmedPayout.manualConfirmation?.transferReference || confirmedPayout.transferReference" class="flex items-start justify-between gap-3">
 <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.SETTLEMENTS.PROOF_SECTION.TRANSFER_REF' | translate }}</span>
 <span class="max-w-[60%] break-all text-end font-mono text-[12px] font-black text-slate-800" dir="ltr">
 {{ confirmedPayout.manualConfirmation?.transferReference || confirmedPayout.transferReference }}
 </span>
 </div>
 <div *ngIf="confirmedPayout.destinationMaskedLabel" class="flex items-start justify-between gap-3">
 <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.SETTLEMENTS.PROOF_SECTION.BANK' | translate }}</span>
 <span class="max-w-[60%] text-end text-[12px] font-bold text-slate-700">{{ confirmedPayout.destinationMaskedLabel }}</span>
 </div>
 <div *ngIf="confirmedPayout.manualConfirmation?.confirmedAtUtc as confirmedAt" class="flex items-start justify-between gap-3">
 <span class="text-[11px] font-bold text-slate-500">{{ 'FINANCES.SETTLEMENTS.PROOF_SECTION.CONFIRMED_AT' | translate }}</span>
 <span class="text-[12px] font-bold text-slate-700" dir="ltr">{{ formatDateTime(confirmedAt) }}</span>
 </div>
 <button
 *ngIf="confirmedPayout.manualConfirmation?.proofAttachmentId"
 type="button"
 (click)="viewSettlementProof(confirmedPayout)"
 class="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-3 py-2.5 text-[12px] font-black text-white transition hover:bg-violet-800">
 <span class="material-symbols-outlined text-[18px]">attach_file</span>
 {{ 'FINANCES.SETTLEMENTS.PROOF_SECTION.VIEW' | translate }}
 </button>
 <p *ngIf="!confirmedPayout.manualConfirmation?.proofAttachmentId && confirmedPayout.manualConfirmation?.hasLegacyProof" class="rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800">
 {{ 'FINANCES.SETTLEMENTS.PROOF_SECTION.LEGACY' | translate }}
 </p>
 </div>
 </ng-container>
 <ng-template #noProofYet>
 <div class="rounded-xl border border-dashed border-violet-200 bg-white/70 px-4 py-5 text-center">
 <span class="material-symbols-outlined mb-2 text-[28px] text-violet-300">image_not_supported</span>
 <p class="text-[12px] font-bold text-slate-600">{{ 'FINANCES.SETTLEMENTS.PROOF_SECTION.EMPTY' | translate }}</p>
 </div>
 </ng-template>
 </section>
 </div>

 <footer *ngIf="selectedSettlement.status === 'pending' || canResumeManualPayout(selectedSettlement)" class="flex gap-3 border-t border-slate-100 bg-white px-6 py-4">
 <app-button *ngIf="selectedSettlement.status === 'pending'"
 variant="primary"
 size="md"
 customClass="!flex-1 !rounded-xl shadow-md shadow-zadna-primary/20"
 (btnClick)="processSettlement(selectedSettlement)">
 <span class="material-symbols-outlined text-[18px] rtl:ml-1 ltr:mr-1">payments</span>
 {{ 'FINANCES.SETTLEMENTS.PROCESS_PAYMENT' | translate }}
 </app-button>
 <app-button *ngIf="canResumeManualPayout(selectedSettlement)"
 variant="primary"
 size="md"
 customClass="!flex-1 !rounded-xl shadow-md shadow-violet-500/20 !bg-violet-700 hover:!bg-violet-800"
 (btnClick)="resumeManualPayout(selectedSettlement)">
 <span class="material-symbols-outlined text-[18px] rtl:ml-1 ltr:mr-1">account_balance</span>
 {{ 'FINANCES.SETTLEMENTS.MANAGE_MANUAL_PAYOUT' | translate }}
 </app-button>
 </footer>
 </div>
 </div>

 <div class="flex flex-col gap-6 animate-in fade-in duration-700">

 <!-- شريط الصفحة العلوي (Header) -->
 <app-page-header [title]="'FINANCES.SETTLEMENTS.TITLE' | translate" [subtitle]="'FINANCES.SETTLEMENTS.SUBTITLE' | translate">
 <div actions class="flex items-center gap-3">
 <!-- مبدل الكيانات (Tabs) -->
 <div class="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200">
 <button (click)="setActiveTab('vendor')"
 class="px-5 py-2 text-[12px] font-bold rounded-lg transition-all duration-200 flex items-center gap-2"
 [ngClass]="activeTab === 'vendor' ? 'bg-white text-zadna-primary shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'">
 <span class="material-symbols-outlined text-[16px]">storefront</span>
 {{ 'FINANCES.SETTLEMENTS.TABS.VENDORS' | translate }}
 </button>
 <button (click)="setActiveTab('driver')"
 class="px-5 py-2 text-[12px] font-bold rounded-lg transition-all duration-200 flex items-center gap-2"
 [ngClass]="activeTab === 'driver' ? 'bg-white text-zadna-primary shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'">
 <span class="material-symbols-outlined text-[16px]">local_shipping</span>
 {{ 'FINANCES.SETTLEMENTS.TABS.DRIVERS' | translate }}
 </button>
 </div>
 </div>
 </app-page-header>

 <app-inline-banner
 *ngIf="loadError"
 title="FINANCES.DASHBOARD.LOAD_ERROR_TITLE"
 message="FINANCES.DASHBOARD.LOAD_ERROR_MESSAGE"
 icon="error"
 variant="error">
 <div actions>
 <app-button variant="outline" size="sm" customClass="!rounded-xl !bg-white" (btnClick)="loadSettlements()">
 {{ 'FINANCES.DASHBOARD.RETRY' | translate }}
 </app-button>
 </div>
 </app-inline-banner>

 <!-- بانر الإشعار للفلترة -->
 <app-inline-banner
 *ngIf="hasScope && scopedSettlement"
 [title]="(scopedSettlement.entityType === 'vendor' ? 'FINANCES.SETTLEMENTS.SCOPED.VENDOR' : 'FINANCES.SETTLEMENTS.SCOPED.DRIVER') | translate"
 [message]="scopedSettlement.entityName"
 [shouldTranslate]="false"
 [icon]="scopedSettlement.entityType === 'vendor' ? 'storefront' : 'local_shipping'"
 variant="info">
 <div actions class="flex items-center gap-2">
 <app-button variant="outline" size="sm" customClass="!rounded-xl!bg-white" (btnClick)="openScopedProfile()">
 {{ 'FINANCES.LEDGER.VIEW_PROFILE' | translate }}
 </app-button>
 <app-button variant="ghost" size="sm" customClass="!rounded-xl!bg-slate-900!text-white hover:!bg-slate-800" (btnClick)="clearScope()">
 {{ 'FINANCES.LEDGER.CLEAR_SCOPE' | translate }}
 </app-button>
 </div>
 </app-inline-banner>

 <!-- ملخص الأرقام (Summary Stats) -->
 <app-card variant="default" rounded="2xl" padding="none" customClass="border-slate-200 shadow-sm overflow-hidden bg-white">
 <div class="grid grid-cols-2 lg:grid-cols-4 divide-x rtl:divide-x-reverse divide-slate-100">
 <div *ngFor="let stat of activeStats" class="px-6 py-5">
 <p class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{{ stat.labelKey | translate }}</p>
 <p class="text-2xl font-black tabular-nums tracking-tight" [ngClass]="stat.color">{{ stat.value }}</p>
 </div>
 </div>
 </app-card>

 <!-- جدول التسويات -->
 <app-card variant="default" rounded="2xl" padding="none" customClass="border-slate-200 shadow-sm overflow-hidden bg-white">
 <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
 <div class="flex items-center gap-3">
 <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
 [ngClass]="activeTab === 'vendor' ? 'bg-cyan-100 text-cyan-600' : 'bg-amber-100 text-amber-600'">
 <span class="material-symbols-outlined text-[18px]">{{ activeTab === 'vendor' ? 'storefront' : 'local_shipping' }}</span>
 </div>
 <div>
 <h3 class="text-[15px] font-black text-slate-900 tracking-tight">{{ 'FINANCES.SETTLEMENTS.TABLE.TITLE' | translate }}</h3>
 <p class="text-[11px] font-bold text-slate-500 mt-0.5">{{ 'FINANCES.SETTLEMENTS.TABLE.DESC' | translate }}</p>
 </div>
 </div>
 <app-button *ngIf="activeTab === 'vendor'" variant="outline" size="sm" customClass="!rounded-xl" (btnClick)="onCreateExtra()">
 <span class="material-symbols-outlined text-[16px] rtl:ml-1 ltr:mr-1">add</span>
 {{ 'FINANCES.SETTLEMENTS.TABLE.CREATE_EXTRA' | translate }}
 </app-button>
 </div>

 <div class="overflow-x-auto">
 <table class="w-full whitespace-nowrap text-right text-[13px]">
 <thead>
 <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
 <th class="px-6 py-4 rtl:text-right ltr:text-left">{{ 'FINANCES.SETTLEMENTS.TABLE.CODE' | translate }}</th>
 <th class="px-6 py-4 rtl:text-right ltr:text-left">{{ 'FINANCES.SETTLEMENTS.TABLE.ENTITY' | translate }}</th>
 <th class="px-6 py-4 rtl:text-right ltr:text-left">{{ 'FINANCES.SETTLEMENTS.TABLE.PERIOD' | translate }}</th>
 <th class="px-6 py-4 text-center">{{ 'FINANCES.SETTLEMENTS.TABLE.ORDERS' | translate }}</th>
 <th class="px-6 py-4 rtl:text-left ltr:text-right">{{ 'FINANCES.SETTLEMENTS.TABLE.REVENUE' | translate }}</th>
 <th class="px-6 py-4 rtl:text-left ltr:text-right">{{ 'FINANCES.SETTLEMENTS.TABLE.DEDUCTION' | translate }}</th>
 <th class="px-6 py-4 rtl:text-left ltr:text-right">{{ 'FINANCES.SETTLEMENTS.TABLE.NET_PAY' | translate }}</th>
 <th class="px-6 py-4 text-center">{{ 'FINANCES.SETTLEMENTS.TABLE.STATUS' | translate }}</th>
 <th class="px-6 py-4 text-center">{{ 'FINANCES.SETTLEMENTS.TABLE.ACTIONS' | translate }}</th>
 </tr>
 </thead>
 <tbody class="divide-y divide-slate-100">
 <tr *ngFor="let s of activeSettlements; trackBy: trackById"
 class="group hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer"
 (click)="openDetail(s)">

 <td class="px-6 py-4 align-middle">
 <span class="text-[12px] font-black text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded-md">{{ s.settlementCode }}</span>
 </td>

 <td class="px-6 py-4 align-middle">
 <div class="flex items-center gap-3">
 <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
 [ngClass]="s.entityType === 'vendor' ? 'bg-cyan-50 border-cyan-100 text-cyan-600' : 'bg-amber-50 border-amber-100 text-amber-600'">
 <span class="material-symbols-outlined text-[16px]">
 {{ s.entityType === 'vendor' ? 'storefront' : 'local_shipping' }}
 </span>
 </div>
 <div>
 <p class="text-[13px] font-black text-slate-800 leading-tight">{{ s.entityName }}</p>
 </div>
 </div>
 </td>

 <td class="px-6 py-4 align-middle">
 <div class="flex flex-col gap-0.5">
 <span class="text-[12px] font-bold text-slate-700">{{ resolvePeriodTypeLabel(s) }}</span>
 <span class="text-[10px] font-bold text-slate-400" dir="ltr">{{ formatPeriodRange(s) }}</span>
 </div>
 </td>

 <td class="px-6 py-4 align-middle text-center">
 <span class="text-[13px] font-black text-slate-600 tabular-nums">{{ formatNumber(s.ordersCount) }}</span>
 </td>

 <td class="px-6 py-4 align-middle text-left" dir="ltr">
 <span class="text-[13px] font-bold text-slate-600 tabular-nums">{{ formatNumber(s.grossAmount) }} {{ 'FINANCES.CURRENCY' | translate }}</span>
 </td>

 <td class="px-6 py-4 align-middle text-left" dir="ltr">
 <span class="text-[13px] font-bold text-red-500 tabular-nums">-{{ formatNumber(s.deductions) }} {{ 'FINANCES.CURRENCY' | translate }}</span>
 </td>

 <td class="px-6 py-4 align-middle text-left" dir="ltr">
 <span class="text-[14px] font-black text-emerald-700 tabular-nums bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">{{ formatNumber(s.netAmount) }} {{ 'FINANCES.CURRENCY' | translate }}</span>
 </td>

 <td class="px-6 py-4 align-middle">
 <div class="flex justify-center">
 <app-finance-status-badge [status]="s.status"></app-finance-status-badge>
 </div>
 </td>

 <td class="px-6 py-4 align-middle">
 <div class="flex items-center justify-center gap-2" (click)="$event.stopPropagation()">
 <app-button *ngIf="s.status === 'pending'"
 variant="primary"
 size="xs"
 customClass="!rounded-lg shadow-sm"
 (btnClick)="processSettlement(s)">
 {{ 'FINANCES.SETTLEMENTS.TABLE.PAY_NOW' | translate }}
 </app-button>
 <button class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors" (click)="openDetail(s)">
 <span class="material-symbols-outlined text-[16px]">visibility</span>
 </button>
 </div>
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 
 <div *ngIf="activeSettlements.length === 0"
 class="flex flex-col items-center justify-center py-24 text-center bg-white">
 <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
 <span class="material-symbols-outlined text-4xl text-slate-300">account_balance</span>
 </div>
 <h3 class="text-[15px] font-black text-slate-800">{{ 'FINANCES.SETTLEMENTS.NO_DATA_TITLE' | translate }}</h3>
 <p class="text-[12px] font-medium text-slate-500 mt-1 max-w-sm">{{ 'FINANCES.SETTLEMENTS.NO_DATA_DESC' | translate }}</p>
 </div>
 </app-card>

 <div *ngIf="totalCount > 0" class="flex justify-center pt-2 pb-8">
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
export class SettlementsComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
 private financeService = inject(FinanceService);
 private vendorService = inject(VendorService);
 private translate = inject(TranslateService);
 private route = inject(ActivatedRoute);
 private router = inject(Router);
 private destroyRef = inject(DestroyRef);
 private readonly toastService = inject(ToastService);

 allSettlements: Settlement[] = [];
 selectedSettlement: Settlement | null = null;
 activeTab: EntityType = 'vendor';
 scopedEntityId: string | null = null;
 loadError = false;
 page = 1;
 pageSize = 20;
 totalCount = 0;
 showCreateSettlementModal = false;
 showVendorPicker = false;
 isSearchingVendors = false;
 isCreatingSettlement = false;
 vendorSearch = '';
 vendorPickerPage = 1;
 vendorPickerPageSize = 8;
 vendorPickerTotalCount = 0;
 vendorPickerOptions: Array<{ id: string; name: string }> = [];
 createVendorId = '';
 createVendorName = '';
 createPendingBalance = 0;
 createAvailableBalance = 0;
 createTotalSales = 0;
 createAdditionalFees = 0;
 createBankName = '';
 createBankIban = '';
 createBankVerified = false;
 manualPayout: SettlementPayout | null = null;
 manualProofFile: File | null = null;
  manualTransferReference = '';
  manualBankSubmissionReference = '';
  manualWorkflowStage: 'claim' | 'submission' | 'confirmation' = 'claim';
 manualConfirmationError = '';
 isConfirmingManualPayout = false;
 private pendingFocusSettlementId: string | null = null;
 private pendingFocusPayoutId: string | null = null;

 get activeSettlements(): Settlement[] {
 return this.allSettlements;
 }
 get scopedSettlement(): Settlement | null {
 return this.scopedEntityId ? (this.allSettlements.find(s => s.entityId === this.scopedEntityId) ?? null) : null;
 }
 get hasScope(): boolean { return!!this.scopedEntityId; }

 get activeStats() {
 const data = this.activeSettlements;
 const paid = data.filter(s => s.status === 'paid');
 const pending = data.filter(s => s.status === 'pending');
 const totalNet = data.reduce((sum, item) => sum + item.netAmount, 0);
 const paidNet = paid.reduce((sum, item) => sum + item.netAmount, 0);

 return [
 { labelKey: 'FINANCES.SETTLEMENTS.STATS.TOTAL', value: this.formatNumber(this.totalCount), color: 'text-slate-900' },
 { labelKey: 'FINANCES.SETTLEMENTS.STATS.PAID', value: `${this.formatNumber(paid.length)} / ${this.formatNumber(paidNet)} ${this.translate.instant('FINANCES.CURRENCY')}`, color: 'text-emerald-600' },
 { labelKey: 'FINANCES.SETTLEMENTS.STATS.PENDING', value: this.formatNumber(pending.length), color: 'text-amber-600' },
 { labelKey: 'FINANCES.SETTLEMENTS.STATS.TOTAL_AMOUNT', value: `${this.formatNumber(totalNet)} ${this.translate.instant('FINANCES.CURRENCY')}`, color: 'text-zadna-primary' }
 ];
 }

 ngOnInit(): void {
 this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
 this.cdr.markForCheck();
 const entityType = params.get('entityType');
 const nextScopedId = params.get('entityId');
 const scopeChanged = nextScopedId !== this.scopedEntityId;
 this.scopedEntityId = nextScopedId;
 if (entityType === 'vendor' || entityType === 'driver') {
 if (this.activeTab !== entityType) {
 this.activeTab = entityType;
 this.page = 1;
 }
 }

 this.pendingFocusSettlementId = params.get('focus');
 this.pendingFocusPayoutId = params.get('payoutId');
 if (this.pendingFocusSettlementId) {
 this.loadSettlements(true);
 } else if (scopeChanged) {
 this.page = 1;
 this.loadSettlements();
 }
 });

 this.loadSettlements();
 }

 loadSettlements(forFocus = false): void {
 this.loadError = false;
 this.financeService.getSettlements({
 entityType: forFocus || this.pendingFocusSettlementId ? undefined : this.activeTab,
 entityId: forFocus || this.pendingFocusSettlementId ? undefined : (this.scopedEntityId ?? undefined),
 page: forFocus || this.pendingFocusSettlementId ? 1 : this.page,
 pageSize: forFocus || this.pendingFocusSettlementId ? 200 : this.pageSize
 }).pipe(take(1)).subscribe({
 next: (data) => {
 this.cdr.markForCheck();
 this.allSettlements = data.items;
 this.totalCount = data.totalCount;
 if (!forFocus && !this.pendingFocusSettlementId) {
 this.page = data.page;
 }
 this.tryOpenFocusedSettlement();
 },
 error: () => {
 this.cdr.markForCheck();
 this.loadError = true;
 this.allSettlements = [];
 this.totalCount = 0;
 }
 });
 }

 changePage(nextPage: number): void {
 if (nextPage === this.page) {
 return;
 }
 this.page = nextPage;
 this.loadSettlements();
 }

 setActiveTab(tab: EntityType): void {
 if (this.activeTab === tab) {
 return;
 }
 this.activeTab = tab;
 this.page = 1;
 this.loadSettlements();
 }

 onCreateExtra(): void {
 if (this.activeTab !== 'vendor') {
 this.toastService.warning(this.translate.instant('FINANCES.SETTLEMENTS.VENDOR_PICKER.DRIVER_NOT_SUPPORTED'));
 return;
 }

 if (this.scopedEntityId) {
 const scopedName = this.scopedSettlement?.entityName || this.scopedEntityId;
 this.openCreateSettlementForVendor(this.scopedEntityId, scopedName);
 return;
 }

 this.showVendorPicker = true;
 this.vendorSearch = '';
 this.vendorPickerPage = 1;
 this.vendorPickerTotalCount = 0;
 this.vendorPickerOptions = [];
 this.searchVendors(true);
 }

 closeVendorPicker(): void {
 this.showVendorPicker = false;
 this.vendorPickerOptions = [];
 this.vendorSearch = '';
 this.vendorPickerPage = 1;
 this.vendorPickerTotalCount = 0;
 this.isSearchingVendors = false;
 }

 searchVendors(resetPage = true): void {
 if (resetPage) {
 this.vendorPickerPage = 1;
 }

 this.isSearchingVendors = true;
 this.cdr.markForCheck();

 const term = this.vendorSearch.trim();
 this.vendorService.getVendors(this.vendorPickerPage, this.vendorPickerPageSize, term || undefined).pipe(take(1)).subscribe({
 next: (page) => {
 this.cdr.markForCheck();
 this.vendorPickerOptions = page.items.map((vendor) => ({
 id: vendor.id,
 name: vendor.businessNameAr || vendor.businessNameEn || vendor.ownerName || vendor.id
 }));
 this.vendorPickerTotalCount = page.totalCount;
 this.vendorPickerPage = page.pageNumber || this.vendorPickerPage;
 this.isSearchingVendors = false;
 },
 error: () => {
 this.cdr.markForCheck();
 this.vendorPickerOptions = [];
 this.vendorPickerTotalCount = 0;
 this.isSearchingVendors = false;
 }
 });
 }

 changeVendorPickerPage(nextPage: number): void {
 if (nextPage === this.vendorPickerPage || this.isSearchingVendors) {
 return;
 }
 this.vendorPickerPage = nextPage;
 this.searchVendors(false);
 }

 selectVendorForSettlement(vendorId: string, vendorName: string): void {
 this.closeVendorPicker();
 this.openCreateSettlementForVendor(vendorId, vendorName);
 }

 openCreateSettlementForVendor(vendorId: string, vendorName: string): void {
 this.createVendorId = vendorId;
 this.createVendorName = vendorName;
 this.createPendingBalance = 0;
 this.createAvailableBalance = 0;
 this.createTotalSales = 0;
 this.createAdditionalFees = 0;
 this.createBankName = '';
 this.createBankIban = '';
 this.createBankVerified = false;

 forkJoin({
 vendor: this.vendorService.getVendorById(vendorId),
 profile: this.financeService.getVendorFinanceProfile(vendorId)
 }).pipe(take(1)).subscribe({
 next: ({ vendor, profile }) => {
 this.cdr.markForCheck();
 this.createVendorName = vendor.businessNameAr || vendor.businessNameEn || vendor.ownerName || vendorName;
 this.createPendingBalance = profile.pendingBalance;
 this.createAvailableBalance = profile.availableBalance;
 this.createTotalSales = profile.totalSales;
 this.createAdditionalFees = profile.totalCommissions;
 this.createBankName = vendor.primaryBankAccount?.bankName || '';
 this.createBankIban = vendor.primaryBankAccount?.iban || '';
 const bankStatus = (vendor.primaryBankAccount?.status || '').toLowerCase();
 this.createBankVerified = !!vendor.primaryBankAccount?.isPrimary &&
 (bankStatus === 'verified' || !!vendor.primaryBankAccount?.verifiedAtUtc);
 this.showCreateSettlementModal = true;
 },
 error: () => {
 this.cdr.markForCheck();
 this.toastService.error(this.translate.instant('FINANCES.SETTLEMENTS.VENDOR_PICKER.LOAD_ERROR'));
 }
 });
 }

 closeCreateSettlementModal(): void {
 if (this.isCreatingSettlement) {
 return;
 }
 this.showCreateSettlementModal = false;
 }

 onSettlementCreated(config: SettlementConfig): void {
 if (!config.vendorId || this.isCreatingSettlement) {
 return;
 }

 this.isCreatingSettlement = true;
 this.vendorService.createVendorSettlement(config.vendorId, {
 grossAmount: config.totalSales,
 commissionAmount: config.additionalFees,
 refundAmount: config.returns,
 adjustmentAmount: config.financialAdjustments,
 netAmount: config.netAmount,
 periodFrom: config.periodFrom ? new Date(`${config.periodFrom}T00:00:00`).toISOString() : undefined,
 periodTo: config.periodTo ? new Date(`${config.periodTo}T23:59:59`).toISOString() : undefined
 }).pipe(
 finalize(() => {
 this.isCreatingSettlement = false;
 this.cdr.markForCheck();
 }),
 take(1)
 ).subscribe({
 next: () => {
 this.showCreateSettlementModal = false;
 this.toastService.success(this.translate.instant('FINANCES.SETTLEMENTS.VENDOR_PICKER.SUCCESS'));
 this.page = 1;
 this.activeTab = 'vendor';
 this.loadSettlements();
 },
 error: (error) => {
 this.toastService.error(this.describeSettlementCreateError(error));
 }
 });
 }

 private describeSettlementCreateError(error: unknown): string {
 const payload = error instanceof HttpErrorResponse ? error.error : null;
 const rawCode = typeof payload === 'string'
 ? payload
 : payload?.errorCode ?? payload?.error ?? payload?.code ?? payload?.title ?? payload?.errors?.[0];
 const code = typeof rawCode === 'string' ? rawCode.trim().toUpperCase() : '';
 const known = new Set([
 'SETTLEMENT_GROSS_REQUIRED',
 'SETTLEMENT_NET_REQUIRED',
 'SETTLEMENT_NET_MISMATCH',
 'SETTLEMENT_DEDUCTIONS_EXCEED_GROSS',
 'SETTLEMENT_PERIOD_INVALID',
 'SETTLEMENT_PERIOD_TOO_LONG',
 'SETTLEMENT_PERIOD_IN_FUTURE',
 'SETTLEMENT_PERIOD_TOO_OLD',
 'SETTLEMENT_PERIOD_OVERLAP',
 'SETTLEMENT_AMOUNT_TOO_LARGE',
 'VENDOR_VERIFIED_BANK_ACCOUNT_REQUIRED',
 'VENDOR_BANK_IBAN_INVALID',
 'VENDOR_WALLET_REQUIRED',
 'INSUFFICIENT_VENDOR_BALANCE',
 'DRIVER_WITHDRAWAL_WORKFLOW_REQUIRED'
 ]);

 if (known.has(code) && this.translate.instant(`FINANCES.SETTLEMENTS.VENDOR_PICKER.ERRORS.${code}`) !== `FINANCES.SETTLEMENTS.VENDOR_PICKER.ERRORS.${code}`) {
 return this.translate.instant(`FINANCES.SETTLEMENTS.VENDOR_PICKER.ERRORS.${code}`);
 }

 return this.translate.instant('FINANCES.SETTLEMENTS.VENDOR_PICKER.ERROR');
 }

 openDetail(s: Settlement): void {
 this.selectedSettlement = s;
 this.financeService.getSettlement(s.id).pipe(take(1)).subscribe({
 next: (settlement) => {
 if (this.selectedSettlement?.id === s.id) {
 this.selectedSettlement = settlement;
 this.cdr.markForCheck();
 }
 },
 error: () => {
 // The list item is still sufficient for read-only details. Manual execution stays unavailable
 // until the current payout reservation has been loaded from the authoritative detail endpoint.
 this.cdr.markForCheck();
 }
 });
 }

 getConfirmedManualPayout(settlement: Settlement): SettlementPayout | null {
 return settlement.payouts?.find((payout) => !!payout.manualConfirmation) ?? null;
 }

 viewSettlementProof(payout: SettlementPayout): void {
 const attachmentId = payout.manualConfirmation?.proofAttachmentId;
 if (!attachmentId) {
 return;
 }

 this.financeService.downloadManualPayoutProof(payout.id, attachmentId).pipe(take(1)).subscribe({
 next: (file) => {
 const url = URL.createObjectURL(file);
 window.open(url, '_blank', 'noopener');
 window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
 },
 error: () => {
 this.toastService.error(this.translate.instant('FINANCES.SETTLEMENTS.PROOF_SECTION.VIEW_ERROR'));
 }
 });
 }

 processSettlement(s: Settlement): void {
  this.financeService.approveSettlement(s.id).pipe(take(1)).subscribe({
 next: (settlement) => {
 this.cdr.markForCheck();
 if (settlement.settlementProcessingMode === 'Manual') {
 const payout = settlement.payouts?.find((item) => !item.manualConfirmation) ?? null;
 if (payout) {
  this.openManualWorkflow(settlement, payout);
 return;
 }
 }

 this.selectedSettlement = null;
 this.loadSettlements();
 },
 error: () => {
 this.cdr.markForCheck();
 this.manualConfirmationError = this.translate.instant('FINANCES.SETTLEMENTS.MANUAL_CONFIRM.PREPARE_ERROR');
 }
 });
 }

 canResumeManualPayout(settlement: Settlement): boolean {
 return this.getResumableManualPayout(settlement)!== null;
 }

 resumeManualPayout(settlement: Settlement): void {
 const payout = this.getResumableManualPayout(settlement);
 if (!payout) {
 return;
 }

 this.openManualWorkflow(settlement, payout);
 }

 onProofSelected(event: Event): void {
 const input = event.target as HTMLInputElement;
 this.manualProofFile = input.files?.item(0) ?? null;
 this.manualConfirmationError = '';
 }

 closeManualConfirmation(force = false): void {
 if (this.isConfirmingManualPayout && !force) {
 return;
 }

 this.manualPayout = null;
  this.manualProofFile = null;
  this.manualTransferReference = '';
  this.manualBankSubmissionReference = '';
  this.manualWorkflowStage = 'claim';
  this.manualConfirmationError = '';
  }

  private openManualWorkflow(settlement: Settlement, payout: SettlementPayout): void {
  this.selectedSettlement = settlement;
  this.manualPayout = payout;
  this.manualProofFile = null;
  this.manualTransferReference = payout.transferReference || '';
  this.manualBankSubmissionReference = payout.executionReservation?.submissionReference || '';
  this.manualConfirmationError = '';

  const status = payout.executionReservation?.status;
  const isLegacyBackfill = this.manualBankSubmissionReference.trim() === 'Legacy manual payout awaiting confirmation';
  if (status === 'Submitted') {
  this.manualWorkflowStage = 'confirmation';
  if (!isLegacyBackfill) {
  this.manualTransferReference ||= this.manualBankSubmissionReference;
  } else {
  this.manualTransferReference = payout.transferReference || '';
  }
  return;
  }

  if (status === 'Claimed') {
  this.manualWorkflowStage = 'submission';
  return;
  }

  this.manualWorkflowStage = 'claim';
  this.claimManualPayout();
  }

  claimManualPayout(): void {
  if (!this.manualPayout || this.isConfirmingManualPayout) return;

  this.isConfirmingManualPayout = true;
  this.manualConfirmationError = '';
  this.financeService.claimManualPayout(this.manualPayout.id).pipe(
  finalize(() => {
  this.isConfirmingManualPayout = false;
  this.cdr.markForCheck();
  }),
  take(1)
  ).subscribe({
  next: (payout) => {
  this.updateManualPayoutWorkflow(payout.status, payout.executionReservation);
  this.manualWorkflowStage = 'submission';
  },
  error: () => {
  this.manualConfirmationError = this.translate.instant('FINANCES.SETTLEMENTS.MANUAL_CONFIRM.PREPARE_ERROR');
  }
  });
  }

  recordManualBankSubmission(): void {
  if (!this.manualPayout || !this.manualBankSubmissionReference.trim() || this.isConfirmingManualPayout) return;

  this.isConfirmingManualPayout = true;
  this.manualConfirmationError = '';
  this.financeService.recordManualBankSubmission(
  this.manualPayout.id,
  this.manualBankSubmissionReference.trim()
  ).pipe(
  finalize(() => {
  this.isConfirmingManualPayout = false;
  this.cdr.markForCheck();
  }),
  take(1)
  ).subscribe({
  next: (payout) => {
  this.updateManualPayoutWorkflow(payout.status, payout.executionReservation);
  this.manualWorkflowStage = 'confirmation';
  this.manualTransferReference ||= this.manualBankSubmissionReference.trim();
  },
  error: (error) => {
  this.manualConfirmationError = this.describeManualWorkflowError(error);
  }
  });
  }

 confirmManualPayout(): void {
 if (!this.manualPayout || !this.manualProofFile || !this.manualTransferReference.trim() || this.isConfirmingManualPayout) {
 return;
 }

 this.isConfirmingManualPayout = true;
 this.manualConfirmationError = '';
 const payoutId = this.manualPayout.id;
 const transferReference = this.manualTransferReference.trim();

  this.financeService.uploadManualPayoutProof(payoutId, this.manualProofFile).pipe(
  switchMap((proof) => this.financeService.confirmManualPayout(payoutId, { transferReference, proofAttachmentId: proof.id })),
 finalize(() => {
 this.cdr.markForCheck();
 this.isConfirmingManualPayout = false;
 }),
 take(1)
 ).subscribe({
 next: () => {
 this.closeManualConfirmation(true);
 this.selectedSettlement = null;
 this.loadSettlements();
 },
  error: (error) => {
  this.manualConfirmationError = this.describeManualWorkflowError(error);
  }
  });
  }

 private describeManualWorkflowError(error: unknown): string {
  const payload = error instanceof HttpErrorResponse ? error.error : null;
  const rawCode = typeof payload === 'string'
  ? payload
  : payload?.errorCode ?? payload?.error ?? payload?.code ?? payload?.title;
  const code = typeof rawCode === 'string' ? rawCode.trim().toUpperCase() : '';
  const translatedCodes = new Set([
  'PAYOUT_NOT_DUE_TODAY',
  'PAYOUT_CONFIRMATION_DAY_INVALID',
  'PAYOUT_DAY_DISABLED',
  'PAYOUT_DUAL_CONTROL_REQUIRED',
  'PAYOUT_MANUAL_CLAIM_REQUIRED',
  'PAYOUT_RESERVATION_NOT_SUBMITTED',
  'PAYOUT_PROOF_NOT_FOUND',
  'PAYOUT_PROOF_PAYOUT_MISMATCH',
  'PAYOUT_PROOF_KIND_MISMATCH',
  'PAYOUT_PROOF_ALREADY_FINALIZED',
  'PAYOUT_INVALID_STATUS',
  'PAYOUT_ALREADY_PAID',
  'SETTLEMENT_APPROVAL_REQUIRED',
  'TRANSFER_REFERENCE_REQUIRED',
  'PAYOUT_PROOF_REQUIRED'
  ]);

  return translatedCodes.has(code)
  ? this.translate.instant(`FINANCES.WITHDRAWALS.ERRORS.${code}`)
  : this.translate.instant('FINANCES.SETTLEMENTS.MANUAL_CONFIRM.CONFIRM_ERROR');
  }

  private tryOpenFocusedSettlement(): void {
  const settlementId = this.pendingFocusSettlementId;
  if (!settlementId) {
  return;
  }

  const payoutId = this.pendingFocusPayoutId;
  const settlement = this.allSettlements.find((item) => item.id === settlementId);
  if (!settlement) {
  this.financeService.getSettlement(settlementId).pipe(take(1)).subscribe({
  next: (loaded) => this.openSettlementFromNotification(loaded, payoutId),
  error: () => {
  this.pendingFocusSettlementId = null;
  this.pendingFocusPayoutId = null;
  this.clearFinanceFocusQueryParams();
  }
  });
  return;
  }

  this.openSettlementFromNotification(settlement, payoutId);
  }

  private openSettlementFromNotification(settlement: Settlement, payoutId: string | null): void {
  this.pendingFocusSettlementId = null;
  this.pendingFocusPayoutId = null;
  this.clearFinanceFocusQueryParams();

  if (settlement.entityType === 'vendor' || settlement.entityType === 'driver') {
  this.activeTab = settlement.entityType;
  }

  this.financeService.getSettlement(settlement.id).pipe(take(1)).subscribe({
  next: (loaded) => {
  this.cdr.markForCheck();
  const payout = payoutId
  ? loaded.payouts?.find((item) => item.id === payoutId) ?? null
  : this.getResumableManualPayout(loaded);
  if (payout) {
  this.openManualWorkflow(loaded, payout);
  return;
  }
  this.openDetail(loaded);
  },
  error: () => {
  this.openDetail(settlement);
  }
  });
  }

  private clearFinanceFocusQueryParams(): void {
  void this.router.navigate([], {
  relativeTo: this.route,
  queryParams: { focus: null, payoutId: null },
  queryParamsHandling: 'merge',
  replaceUrl: true
  });
  }

  private updateManualPayoutWorkflow(status: string, executionReservation: SettlementPayout['executionReservation']): void {
  if (!this.manualPayout) return;

  this.manualPayout = {
  ...this.manualPayout,
  status,
  executionReservation
  };
  }

 private getResumableManualPayout(settlement: Settlement): SettlementPayout | null {
 return settlement.payouts?.find((payout) => {
 const reservation = payout.executionReservation;
 const reservationStatus = reservation?.status?.toLowerCase();
 const payoutStatus = payout.status.toLowerCase();

 return reservation?.mode?.toLowerCase() === 'manual' &&
 !payout.manualConfirmation &&
 (reservationStatus === 'claimed' || reservationStatus === 'submitted') &&
 !['paid', 'reversed', 'cancelled'].includes(payoutStatus);
 }) ?? null;
 }
 
 trackById(_: number, s: Settlement): string { return s.id; }

 clearScope(): void {
 this.page = 1;
 this.router.navigate([], {
 relativeTo: this.route,
 queryParams: { entityType: null, entityId: null },
 queryParamsHandling: 'merge'
 });
 }

 openScopedProfile(): void {
 if (!this.scopedSettlement) return;
 if (this.scopedSettlement.entityType!== 'vendor' && this.scopedSettlement.entityType!== 'driver') {
 return;
 }

 const navigation = buildFinanceScopedProfileNavigation(
 this.scopedSettlement.entityType,
 this.scopedSettlement.entityId
 );

 this.router.navigate(navigation.commands, navigation.extras);
 }

 formatDate(d: string): string {
 return new Date(d).toLocaleDateString(getFinanceLocale(this.translate.currentLang), { timeZone: 'Asia/Riyadh', calendar: 'gregory' });
 }

 formatDateTime(d: string): string {
 return new Date(d).toLocaleString(getFinanceLocale(this.translate.currentLang), {
 timeZone: 'Asia/Riyadh',
 calendar: 'gregory',
 dateStyle: 'medium',
 timeStyle: 'short'
 });
 }

 formatNumber(value: number): string {
 return value.toLocaleString(getFinanceLocale(this.translate.currentLang), {
 minimumFractionDigits: 0,
 maximumFractionDigits: 2
 });
 }
 
 resolvePeriodTypeLabel(s: Settlement): string {
 const key = this.resolvePeriodTypeKey(s);
 const translated = this.translate.instant(key);
 return translated && translated!== key ? translated : this.formatPeriodRange(s);
 }

 resolvePeriodTypeKey(s: Settlement): string {
 const from = new Date(s.periodFrom).getTime();
 const to = new Date(s.periodTo).getTime();
 if (!Number.isFinite(from) ||!Number.isFinite(to) || to < from) {
 return 'FINANCES.SETTLEMENTS.PERIODS.CUSTOM';
 }

 const days = Math.max(1, Math.round((to - from) / 86_400_000));
 if (days <= 1) return 'FINANCES.SETTLEMENTS.PERIODS.DAILY';
 if (days <= 8) return 'FINANCES.SETTLEMENTS.PERIODS.WEEKLY';
 if (days <= 16) return 'FINANCES.SETTLEMENTS.PERIODS.BI_WEEKLY';
 return 'FINANCES.SETTLEMENTS.PERIODS.MONTHLY';
 }

 formatPeriodRange(s: Settlement): string {
 return `${this.formatDate(s.periodFrom)} - ${this.formatDate(s.periodTo)}`;
 }
}
