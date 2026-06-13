import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable } from 'rxjs';
import { describeApiError } from '@shared/utils/api-error.util';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { KpiCardsComponent, KPICard } from '../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { DataTableComponent, TableColumn } from '../../../../shared/components/ui/data-table/data-table.component';
import { AdvancedFilterPanelComponent, FilterField } from '../../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';
import { SupportCasesService } from '../../services/support-cases.api.service';
import {
  SupportCaseRow,
  SupportCaseModalKey,
  SupportCaseModalState,
  SupportCaseFormDrafts,
  SupportCaseQuickActionType,
  SupportCaseQuickActionModalConfig,
  SupportCaseQuickActionFormValue,
  RefundDecisionForm,
  RejectionDecisionForm,
  EscalationDecisionForm,
  RequestInfoForm,
  createEmptySupportCaseModalState,
  createEmptySupportCaseFormDrafts,
  createEmptySupportCaseQuickActionFormValue,
  AdminOrderCaseStatsResponse
} from '../../models/support-cases.models';
import { SupportCaseApprovalModalComponent } from '../../components/support-case-approval-modal/support-case-approval-modal.component';
import { SupportCaseRejectionModalComponent } from '../../components/support-case-rejection-modal/support-case-rejection-modal.component';
import { SupportCaseEscalationModalComponent } from '../../components/support-case-escalation-modal/support-case-escalation-modal.component';
import { SupportCaseRequestInfoModalComponent } from '../../components/support-case-request-info-modal/support-case-request-info-modal.component';
import { SupportCaseQuickActionModalComponent } from '../../components/support-case-quick-action-modal/support-case-quick-action-modal.component';
import {
  AdminSupportStatus,
  AdminVendorSupportTicket
} from '../../models/admin-support.models';
import { AdminVendorSupportService } from '../../services/admin-vendor-support.service';


type AdminSupportTab = 'vendor' | 'driver' | 'legacy';
type ToastTone = 'success' | 'info' | 'error';
type SupportFilterOption = { value: string; labelKey: string };
type DriverSupportCaseType = 'driver_account' | 'driver_report';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-admin-support-center',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    AppPageHeaderComponent,
    AppPaginationComponent,
    SupportCaseApprovalModalComponent,
    SupportCaseRejectionModalComponent,
    SupportCaseEscalationModalComponent,
    SupportCaseRequestInfoModalComponent,
    SupportCaseQuickActionModalComponent,
    KpiCardsComponent,
    DataTableComponent,
    AdvancedFilterPanelComponent
  ],
  styleUrl: './admin-support-center.component.scss',
  template: `
    <div class="h-full flex flex-col overflow-y-auto bg-slate-50/50 pb-10 font-sans" [dir]="isRtl ? 'rtl' : 'ltr'">
      <app-page-header
        [title]="'SUPPORT_ADMIN.TITLE'"
        [subtitle]="'SUPPORT_ADMIN.SUBTITLE'"
        [showToolbar]="true"
        [breadcrumbs]="[
          { label: 'SIDEBAR.HOME', url: '/dashboard' },
          { label: 'SIDEBAR.SUPPORT' }
        ]">
        <span title-prefix class="material-symbols-outlined text-[28px] text-zadna-primary">support_agent</span>

        <div actions class="flex flex-wrap items-center gap-3 animate-in slide-in-from-left-10 duration-700">
          <a
            routerLink="/disputes"
            class="inline-flex items-center gap-2 rounded-[1.2rem] border border-slate-200 bg-white px-5 py-3 text-[12px] font-black text-slate-600 shadow-sm transition hover:border-zadna-primary/25 hover:text-zadna-primary">
            <span class="material-symbols-outlined text-[19px]">gavel</span>
            {{ 'SUPPORT_ADMIN.ACTIONS.DISPUTES_QUEUE' | translate }}
          </a>
          <a
            routerLink="/notifications"
            [queryParams]="{ category: 'support' }"
            class="inline-flex items-center gap-2 rounded-[1.2rem] border border-slate-200 bg-white px-5 py-3 text-[12px] font-black text-slate-600 shadow-sm transition hover:border-zadna-primary/25 hover:text-zadna-primary">
            <span class="material-symbols-outlined text-[19px]">notifications_active</span>
            {{ 'SUPPORT_ADMIN.ACTIONS.SUPPORT_NOTIFICATIONS' | translate }}
          </a>
        </div>
      </app-page-header>

      <main class="mx-auto flex w-full max-w-[120rem] flex-1 flex-col gap-5 px-4 pt-3 md:gap-6 md:px-10 animate-in slide-in-from-bottom-10 duration-700">
        <div *ngIf="toastMessage"
          class="rounded-[1.25rem] border px-4 py-3 text-[12px] font-black shadow-sm"
          [ngClass]="toastTone === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : toastTone === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'">
          {{ toastMessage }}
        </div>

        <app-kpi-cards [cards]="kpiCards"></app-kpi-cards>

        <section class="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
          <div class="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/90 to-white px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
            <div class="min-w-0">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-zadna-primary">{{ 'SUPPORT_ADMIN.WORKSPACE_LABEL' | translate }}</p>
              <p class="mt-1 text-[13px] font-bold leading-relaxed text-slate-500">{{ activeTabHintKey | translate }}</p>
            </div>
            <div class="flex flex-wrap gap-2 rounded-[1.35rem] bg-slate-100/80 p-1.5">
              <button type="button" (click)="setActiveTab('vendor')"
                class="support-tab-btn inline-flex items-center gap-2 rounded-[1.15rem] px-4 py-2.5 text-[12px] font-black"
                [ngClass]="activeTab === 'vendor' ? 'support-tab-btn--active bg-zadna-primary text-white' : 'text-slate-600 hover:bg-white/80'">
                <span class="material-symbols-outlined text-[18px]">storefront</span>
                <span>{{ 'SUPPORT_ADMIN.TABS.VENDOR' | translate }}</span>
                <span class="rounded-full px-2 py-0.5 text-[10px] font-black"
                  [ngClass]="activeTab === 'vendor' ? 'bg-white/20 text-white' : 'bg-white text-slate-600'">{{ tabBadgeCount('vendor') }}</span>
              </button>
              <button type="button" (click)="setActiveTab('driver')"
                class="support-tab-btn inline-flex items-center gap-2 rounded-[1.15rem] px-4 py-2.5 text-[12px] font-black"
                [ngClass]="activeTab === 'driver' ? 'support-tab-btn--active bg-zadna-primary text-white' : 'text-slate-600 hover:bg-white/80'">
                <span class="material-symbols-outlined text-[18px]">delivery_dining</span>
                <span>{{ 'SUPPORT_ADMIN.TABS.DRIVER' | translate }}</span>
                <span class="rounded-full px-2 py-0.5 text-[10px] font-black"
                  [ngClass]="activeTab === 'driver' ? 'bg-white/20 text-white' : 'bg-white text-slate-600'">{{ tabBadgeCount('driver') }}</span>
              </button>
              <button type="button" (click)="setActiveTab('legacy')"
                class="support-tab-btn inline-flex items-center gap-2 rounded-[1.15rem] px-4 py-2.5 text-[12px] font-black"
                [ngClass]="activeTab === 'legacy' ? 'support-tab-btn--active bg-zadna-primary text-white' : 'text-slate-600 hover:bg-white/80'">
                <span class="material-symbols-outlined text-[18px]">support</span>
                <span>{{ 'SUPPORT_ADMIN.TABS.LEGACY' | translate }}</span>
                <span class="rounded-full px-2 py-0.5 text-[10px] font-black"
                  [ngClass]="activeTab === 'legacy' ? 'bg-white/20 text-white' : 'bg-white text-slate-600'">{{ tabBadgeCount('legacy') }}</span>
              </button>
            </div>
          </div>
        </section>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col lg:flex-row items-center justify-between gap-6 mb-1">
            <div class="w-full lg:w-[450px] group relative">
              <div class="absolute inset-y-0 flex items-center pointer-events-none"
                [ngClass]="isRtl ? 'right-5' : 'left-5'">
                <span
                  class="material-symbols-outlined text-[22px] text-zadna-primary group-focus-within:scale-110 transition-transform duration-500">search</span>
              </div>
              <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()"
                [placeholder]="'SUPPORT_ADMIN.FILTERS.SEARCH' | translate"
                class="w-full py-4 bg-white border border-slate-200/60 rounded-[1.5rem] text-[13px] font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-zadna-primary/50 focus:ring-4 focus:ring-zadna-primary/5 transition-all shadow-sm"
                [ngClass]="isRtl ? 'pr-14 pl-6' : 'pl-14 pr-6'">
            </div>

            <div class="flex items-center gap-4">
              <div
                class="flex items-center bg-white border border-slate-200/60 rounded-full h-[60px] shadow-sm px-2 transition-all hover:shadow-md overflow-hidden">
                <div
                  class="flex items-center gap-3 px-6 h-full cursor-pointer select-none hover:bg-slate-50 transition-colors group"
                  (click)="toggleFiltersPanel()" [class.bg-teal-50]="isFiltersExpanded">
                  <span class="material-symbols-outlined text-[24px] transition-transform duration-500 text-zadna-primary"
                    [class.rotate-180]="isFiltersExpanded">filter_list</span>
                  <div class="flex flex-col text-start">
                    <span class="text-[13px] font-black text-slate-800">{{ 'DISPUTES_DASHBOARD.FILTER_PANEL.TITLE' | translate }}</span>
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{{ 'DISPUTES_DASHBOARD.FILTER_PANEL.SUBTITLE' | translate }}</span>
                  </div>
                  <span
                    class="material-symbols-outlined text-[18px] text-slate-300 group-hover:translate-y-0.5 transition-transform"
                    [ngClass]="isRtl ? 'mr-2' : 'ml-2'" [class.rotate-180]="isFiltersExpanded">keyboard_arrow_down</span>
                </div>
              </div>

              <button *ngIf="hasActiveFilters" type="button" (click)="clearFilters()"
                class="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-all group">
                <span
                  class="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">close</span>
                <span class="text-[11px] font-black uppercase tracking-widest">{{ 'COMMON.RESET_FILTERS' | translate }}</span>
              </button>
            </div>
          </div>

          <div *ngIf="isFiltersExpanded"
            class="relative z-30 animate-in slide-in-from-top-3 duration-500 overflow-visible rounded-[1.5rem] border border-slate-200/60 shadow-xl mb-6 bg-white">
            <app-advanced-filter-panel
              [isExpanded]="true"
              [title]="'DISPUTES_DASHBOARD.FILTER_PANEL.TITLE'"
              [subtitle]="'DISPUTES_DASHBOARD.FILTER_PANEL.SUBTITLE'"
              [activeFiltersLabel]="'DISPUTES_DASHBOARD.FILTER_PANEL.ACTIVE_FILTERS'"
              [fields]="filterFields"
              [filters]="panelFilters"
              (filtersChange)="onPanelFiltersChange($event)"
              (reset)="clearFilters()">
            </app-advanced-filter-panel>
          </div>
        </div>

        <!-- Vendor Tickets Tab -->
        <section *ngIf="activeTab === 'vendor'" class="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.28)]">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-white via-slate-50/50 to-white px-5 py-4 md:px-6">
            <div class="flex items-center gap-3 min-w-0">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zadna-primary/10 text-zadna-primary">
                <span class="material-symbols-outlined text-[22px]">storefront</span>
              </span>
              <div class="min-w-0">
                <h2 class="text-[15px] font-black text-slate-900">{{ 'SUPPORT_ADMIN.VENDOR_TABLE.TITLE' | translate }}</h2>
                <p class="mt-0.5 text-[12px] font-bold text-slate-500">{{ vendorTotal }} {{ 'SUPPORT_ADMIN.RESULTS' | translate }}</p>
              </div>
            </div>
            <span *ngIf="isLoadingVendor" class="inline-flex items-center gap-2 rounded-full bg-zadna-primary/10 px-3 py-1.5 text-[11px] font-black text-zadna-primary">
              <span class="h-2 w-2 animate-pulse rounded-full bg-zadna-primary"></span>
              {{ 'COMMON.LOADING' | translate }}
            </span>
          </div>

          <app-data-table
            [data]="vendorTickets"
            [columns]="vendorColumns"
            [isLoading]="isLoadingVendor"
            [clickableRows]="true"
            [emptyStateTitle]="'SUPPORT_ADMIN.EMPTY.TITLE' | translate"
            [emptyStateMessage]="'SUPPORT_ADMIN.EMPTY.MESSAGE' | translate"
            [emptyStateIcon]="'support_agent'"
            (rowClick)="openTicket($event)">
            
            <ng-template #customColumn let-ticket let-column="column">
              <ng-container [ngSwitch]="column.key">
                <ng-container *ngSwitchCase="'reference'">
                  <button type="button" (click)="openTicket(ticket); $event.stopPropagation()" class="text-start text-[13px] font-black text-zadna-primary hover:text-teal-700" dir="ltr">
                    {{ ticket.reference }}
                  </button>
                  <p class="mt-1 text-[11px] font-bold text-slate-400">{{ categoryLabel(ticket.category) }}</p>
                </ng-container>

                <ng-container *ngSwitchCase="'subject'">
                  <p class="max-w-[260px] truncate text-[13px] font-black text-slate-900">{{ localized(ticket.subject) }}</p>
                  <p class="mt-1 max-w-[300px] truncate text-[11px] font-semibold text-slate-500">{{ localized(ticket.summary) }}</p>
                </ng-container>

                <ng-container *ngSwitchCase="'orderId'">
                  <a *ngIf="ticket.orderId; else noOrder" [routerLink]="['/orders', ticket.orderId]" (click)="$event.stopPropagation()" class="text-[12px] font-black text-slate-700 hover:text-zadna-primary">
                    #{{ ticket.orderNumber || ticket.orderId }}
                  </a>
                  <ng-template #noOrder>
                    <span class="text-[12px] font-bold text-slate-400">{{ 'SUPPORT_ADMIN.VENDOR_TABLE.GENERAL' | translate }}</span>
                  </ng-template>
                </ng-container>

                <ng-container *ngSwitchCase="'status'">
                  <span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black" [ngClass]="statusClass(ticket.status)">
                    {{ statusLabel(ticket.status) }}
                  </span>
                </ng-container>

                <ng-container *ngSwitchCase="'priority'">
                  <span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black" [ngClass]="priorityClass(ticket.priority)">
                    {{ priorityLabel(ticket.priority) }}
                  </span>
                </ng-container>

                <ng-container *ngSwitchCase="'updatedAt'">
                  <span class="text-[12px] font-bold text-slate-500">{{ formatDateTime(ticket.updatedAt) }}</span>
                </ng-container>

                <ng-container *ngSwitchCase="'actions'">
                  <button type="button" (click)="openTicket(ticket); $event.stopPropagation()" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 shadow-sm transition hover:border-zadna-primary/20 hover:bg-zadna-primary/5 hover:text-zadna-primary">
                    {{ 'SUPPORT_ADMIN.ACTIONS.OPEN' | translate }}
                  </button>
                </ng-container>
              </ng-container>
            </ng-template>

            <ng-template #mobileCard let-ticket>
              <div class="space-y-3 text-start">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-[13px] font-black text-zadna-primary" dir="ltr">{{ ticket.reference }}</p>
                    <p class="mt-1 text-[10px] font-bold text-slate-400">{{ categoryLabel(ticket.category) }}</p>
                  </div>
                  <span class="inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black" [ngClass]="priorityClass(ticket.priority)">
                    {{ priorityLabel(ticket.priority) }}
                  </span>
                </div>
                <p class="text-[12px] font-black text-slate-900 line-clamp-2">{{ localized(ticket.subject) }}</p>
                <div class="flex items-center justify-between gap-2">
                  <span class="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black" [ngClass]="statusClass(ticket.status)">
                    {{ statusLabel(ticket.status) }}
                  </span>
                  <span class="text-[10px] font-bold text-slate-400">{{ formatDateTime(ticket.updatedAt) }}</span>
                </div>
              </div>
            </ng-template>
          </app-data-table>

          <div *ngIf="vendorTotal > 0" class="border-t border-slate-100 px-5 md:px-6">
            <app-pagination
              [currentPage]="vendorPage"
              [pageSize]="pageSize"
              [totalItems]="vendorTotal"
              (pageChange)="onVendorPageChange($event)">
            </app-pagination>
          </div>
        </section>

        <!-- Driver Cases Tab -->
        <section *ngIf="activeTab === 'driver'" class="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.28)]">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-white via-indigo-50/40 to-white px-5 py-4 md:px-6">
            <div class="flex items-center gap-3 min-w-0">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600">
                <span class="material-symbols-outlined text-[22px]">delivery_dining</span>
              </span>
              <div class="min-w-0">
                <h2 class="text-[15px] font-black text-slate-900">{{ 'SUPPORT_ADMIN.DRIVER_TABLE.TITLE' | translate }}</h2>
                <p class="mt-0.5 text-[12px] font-bold text-slate-500">{{ driverTotal }} {{ 'SUPPORT_ADMIN.RESULTS' | translate }}</p>
              </div>
            </div>
            <span *ngIf="isLoadingDriver" class="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1.5 text-[11px] font-black text-indigo-600">
              <span class="h-2 w-2 animate-pulse rounded-full bg-indigo-500"></span>
              {{ 'COMMON.LOADING' | translate }}
            </span>
          </div>

          <app-data-table
            [data]="driverCases"
            [columns]="driverColumns"
            [isLoading]="isLoadingDriver"
            [clickableRows]="true"
            [emptyStateTitle]="'SUPPORT_ADMIN.EMPTY.DRIVER_TITLE' | translate"
            [emptyStateMessage]="'SUPPORT_ADMIN.EMPTY.DRIVER_MESSAGE' | translate"
            [emptyStateIcon]="'delivery_dining'"
            (rowClick)="openDriverCase($event)">

            <ng-template #customColumn let-driverCase let-column="column">
              <ng-container [ngSwitch]="column.key">
                <ng-container *ngSwitchCase="'case'">
                  <button type="button" (click)="openDriverCase(driverCase); $event.stopPropagation()" class="text-start text-[13px] font-black text-zadna-primary hover:text-teal-700">
                    {{ driverCasePrimaryLabel(driverCase) }}
                  </button>
                  <p class="mt-1 max-w-[320px] truncate text-[11px] font-bold text-slate-500">{{ driverCase.reason || driverCase.typeLabel }}</p>
                </ng-container>

                <ng-container *ngSwitchCase="'driver'">
                  <a *ngIf="driverCaseDriverId(driverCase); else driverCaseNoDriver" [routerLink]="['/drivers', driverCaseDriverId(driverCase)]" [queryParams]="{ tab: 'support' }" (click)="$event.stopPropagation()" class="text-[12px] font-black text-slate-700 hover:text-zadna-primary">
                    {{ driverCaseDriverLabel(driverCase) }}
                  </a>
                  <ng-template #driverCaseNoDriver>
                    <span class="text-[12px] font-bold text-slate-500">{{ driverCaseDriverLabel(driverCase) }}</span>
                  </ng-template>
                  <p class="mt-1 text-[11px] font-bold text-slate-400">{{ driverCase.queueLabel || driverCase.queue }}</p>
                </ng-container>

                <ng-container *ngSwitchCase="'status'">
                  <span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black" [ngClass]="legacyStatusClass(driverCase.caseStatus)">
                    {{ driverCase.caseStatusLabel || supportCaseStatusLabel(driverCase.caseStatus) }}
                  </span>
                </ng-container>

                <ng-container *ngSwitchCase="'priority'">
                  <span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black" [ngClass]="priorityClass(driverCase.priority)">
                    {{ driverCase.priorityLabel || priorityLabel(driverCase.priority) }}
                  </span>
                </ng-container>

                <ng-container *ngSwitchCase="'updatedAt'">
                  <span class="text-[12px] font-bold text-slate-500">{{ formatDateTime(driverCase.createdAt) }}</span>
                </ng-container>

                <ng-container *ngSwitchCase="'actions'">
                  <button type="button" (click)="openDriverCase(driverCase); $event.stopPropagation()" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 shadow-sm transition hover:border-zadna-primary/20 hover:bg-zadna-primary/5 hover:text-zadna-primary">
                    {{ 'SUPPORT_ADMIN.ACTIONS.OPEN' | translate }}
                  </button>
                </ng-container>
              </ng-container>
            </ng-template>

            <ng-template #mobileCard let-driverCase>
              <div class="space-y-3 text-start">
                <p class="text-[13px] font-black text-zadna-primary">{{ driverCasePrimaryLabel(driverCase) }}</p>
                <p class="text-[12px] font-black text-slate-800">{{ driverCaseDriverLabel(driverCase) }}</p>
                <p class="text-[11px] font-bold text-slate-500 line-clamp-2">{{ driverCase.reason || driverCase.typeLabel }}</p>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black" [ngClass]="legacyStatusClass(driverCase.caseStatus)">
                    {{ driverCase.caseStatusLabel || supportCaseStatusLabel(driverCase.caseStatus) }}
                  </span>
                  <span class="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black" [ngClass]="priorityClass(driverCase.priority)">
                    {{ driverCase.priorityLabel || priorityLabel(driverCase.priority) }}
                  </span>
                </div>
              </div>
            </ng-template>
          </app-data-table>

          <div *ngIf="driverTotal > 0" class="border-t border-slate-100 px-5 md:px-6">
            <app-pagination
              [currentPage]="driverPage"
              [pageSize]="pageSize"
              [totalItems]="driverTotal"
              (pageChange)="onDriverPageChange($event)">
            </app-pagination>
          </div>
        </section>

        <!-- Legacy Cases Tab -->
        <section *ngIf="activeTab === 'legacy'" class="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.28)]">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-white via-amber-50/35 to-white px-5 py-4 md:px-6">
            <div class="flex items-center gap-3 min-w-0">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                <span class="material-symbols-outlined text-[22px]">support</span>
              </span>
              <div class="min-w-0">
                <h2 class="text-[15px] font-black text-slate-900">{{ 'SUPPORT_ADMIN.LEGACY_TABLE.TITLE' | translate }}</h2>
                <p class="mt-0.5 text-[12px] font-bold text-slate-500">{{ legacyTotal }} {{ 'SUPPORT_ADMIN.RESULTS' | translate }}</p>
              </div>
            </div>
            <span *ngIf="isLoadingLegacy" class="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-[11px] font-black text-amber-700">
              <span class="h-2 w-2 animate-pulse rounded-full bg-amber-500"></span>
              {{ 'COMMON.LOADING' | translate }}
            </span>
          </div>

          <app-data-table
            [data]="legacyCases"
            [columns]="legacyColumns"
            [isLoading]="isLoadingLegacy"
            [clickableRows]="true"
            [emptyStateTitle]="'SUPPORT_ADMIN.EMPTY.LEGACY_TITLE' | translate"
            [emptyStateMessage]="'SUPPORT_ADMIN.EMPTY.LEGACY_MESSAGE' | translate"
            [emptyStateIcon]="'support'"
            (rowClick)="openLegacyCase($event)">

            <ng-template #customColumn let-legacyCase let-column="column">
              <ng-container [ngSwitch]="column.key">
                <ng-container *ngSwitchCase="'order'">
                  <a *ngIf="legacyCase.orderId; else noLegacyOrder" [routerLink]="['/orders', legacyCase.orderId]" (click)="$event.stopPropagation()" class="text-[13px] font-black text-zadna-primary hover:text-teal-700">
                    {{ legacyCasePrimaryLabel(legacyCase) }}
                  </a>
                  <ng-template #noLegacyOrder>
                    <span class="text-[13px] font-black text-slate-700">{{ legacyCasePrimaryLabel(legacyCase) }}</span>
                  </ng-template>
                  <p class="mt-1 text-[11px] font-bold text-slate-400">{{ legacyCase.reason }}</p>
                </ng-container>

                <ng-container *ngSwitchCase="'customer'">
                  <span class="text-[12px] font-bold text-slate-700">{{ legacyCase.customerName }}</span>
                </ng-container>

                <ng-container *ngSwitchCase="'vendor'">
                  <span class="text-[12px] font-bold text-slate-700">{{ legacyCase.merchantName }}</span>
                </ng-container>

                <ng-container *ngSwitchCase="'status'">
                  <span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black" [ngClass]="legacyStatusClass(legacyCase.caseStatus)">
                    {{ legacyCase.caseStatusLabel || legacyCase.caseStatus }}
                  </span>
                </ng-container>

                <ng-container *ngSwitchCase="'priority'">
                  <span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black" [ngClass]="priorityClass(legacyCase.priority)">
                    {{ legacyCase.priorityLabel || priorityLabel(legacyCase.priority) }}
                  </span>
                </ng-container>

                <ng-container *ngSwitchCase="'updatedAt'">
                  <span class="text-[12px] font-bold text-slate-500">{{ formatDateTime(legacyCase.createdAt) }}</span>
                </ng-container>

                <ng-container *ngSwitchCase="'actions'">
                  <button type="button" (click)="openLegacyCase(legacyCase); $event.stopPropagation()" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 shadow-sm transition hover:border-zadna-primary/20 hover:bg-zadna-primary/5 hover:text-zadna-primary">
                    {{ 'SUPPORT_ADMIN.ACTIONS.OPEN' | translate }}
                  </button>
                </ng-container>
              </ng-container>
            </ng-template>

            <ng-template #mobileCard let-legacyCase>
              <div class="space-y-3 text-start">
                <p class="text-[13px] font-black text-zadna-primary">{{ legacyCasePrimaryLabel(legacyCase) }}</p>
                <p class="text-[12px] font-black text-slate-800">{{ legacyCase.customerName }}</p>
                <p class="text-[11px] font-bold text-slate-500">{{ legacyCase.merchantName }}</p>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black" [ngClass]="legacyStatusClass(legacyCase.caseStatus)">
                    {{ legacyCase.caseStatusLabel || legacyCase.caseStatus }}
                  </span>
                  <span class="text-[10px] font-bold text-slate-400">{{ formatDateTime(legacyCase.createdAt) }}</span>
                </div>
              </div>
            </ng-template>
          </app-data-table>

          <div *ngIf="legacyTotal > 0" class="border-t border-slate-100 px-5 md:px-6">
            <app-pagination
              [currentPage]="legacyPage"
              [pageSize]="pageSize"
              [totalItems]="legacyTotal"
              (pageChange)="onLegacyPageChange($event)">
            </app-pagination>
          </div>
        </section>
      </main>

      <!-- Support Modals -->
      <app-support-case-approval-modal
        [isOpen]="isApprovalModalOpen"
        [dispute]="activeSupportCase"
        [draft]="formDrafts.approval"
        (close)="closeApprovalModal()"
        (saveDraft)="saveApprovalDraft($event)"
        (submitDecision)="submitApproval($event)">
      </app-support-case-approval-modal>

      <app-support-case-rejection-modal
        [isOpen]="isRejectionModalOpen"
        [isRtl]="isRtl"
        [dispute]="activeSupportCase"
        (close)="closeRejectionModal()"
        (saveDraft)="saveRejectionDraft($event)"
        (submitDecision)="submitRejection($event)">
      </app-support-case-rejection-modal>

      <app-support-case-escalation-modal
        [isOpen]="isEscalationModalOpen"
        [isRtl]="isRtl"
        [dispute]="activeSupportCase"
        [draft]="formDrafts.escalation"
        (close)="closeEscalationModal()"
        (saveDraft)="saveEscalationDraft($event)"
        (submitEscalation)="submitEscalation($event)">
      </app-support-case-escalation-modal>

      <app-support-case-request-info-modal
        [isOpen]="isRequestInfoModalOpen"
        [isRtl]="isRtl"
        [supportCase]="activeSupportCase"
        [draft]="formDrafts.requestInfo"
        (close)="closeRequestInfoModal()"
        (saveDraft)="saveRequestInfoDraft($event)"
        (submitRequest)="submitRequestInfo($event)">
      </app-support-case-request-info-modal>

      <app-support-case-quick-action-modal
        [isOpen]="isQuickActionModalOpen"
        [isRtl]="isRtl"
        [config]="quickActionConfig"
        [value]="quickActionValue"
        (close)="closeQuickActionModal()"
        (submitAction)="submitQuickAction($event)">
      </app-support-case-quick-action-modal>

      <aside *ngIf="selectedTicket"
        class="fixed inset-0 z-50 flex bg-slate-950/40 backdrop-blur-sm justify-end">
        <button type="button" class="absolute inset-0 cursor-default" (click)="closeDetails()" [attr.aria-label]="'COMMON.CLOSE' | translate"></button>
        <section class="support-drawer relative flex h-full w-full max-w-[44rem] flex-col overflow-hidden rounded-s-[2rem] bg-white shadow-2xl">
          <header class="border-b border-slate-100 px-6 py-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[11px] font-black uppercase tracking-[0.16em] text-zadna-primary" dir="ltr">{{ selectedTicket.reference }}</p>
                <h2 class="mt-2 text-[20px] font-black text-slate-950">{{ localized(selectedTicket.subject) }}</h2>
                <p class="mt-1 text-[12px] font-semibold leading-6 text-slate-500">{{ localized(selectedTicket.summary) }}</p>
              </div>
              <button type="button" (click)="closeDetails()" class="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50">
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </header>

          <div class="flex-1 overflow-y-auto px-6 py-5">
            <div class="grid gap-3 md:grid-cols-2">
              <div class="rounded-[1rem] border border-slate-100 bg-slate-50 p-4">
                <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'COMMON.STATUS' | translate }}</p>
                <p class="mt-2 text-[13px] font-black text-slate-900">{{ statusLabel(selectedTicket.status) }}</p>
              </div>
              <div class="rounded-[1rem] border border-slate-100 bg-slate-50 p-4">
                <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'SUPPORT_ADMIN.VENDOR_TABLE.ORDER' | translate }}</p>
                <p class="mt-2 text-[13px] font-black text-slate-900">{{ selectedTicket.orderNumber || selectedTicket.orderId || ('SUPPORT_ADMIN.VENDOR_TABLE.GENERAL' | translate) }}</p>
              </div>
            </div>

            <div class="mt-5 space-y-3">
              <div *ngFor="let message of selectedTicket.messages; trackBy: trackByMessageId" class="flex"
                [ngClass]="message.direction === 'support' ? 'justify-end' : 'justify-start'">
                <div class="max-w-[86%] rounded-[1.2rem] px-4 py-3"
                  [ngClass]="message.direction === 'support' ? 'rounded-tl-sm bg-zadna-primary text-white' : 'rounded-tr-sm bg-slate-100 text-slate-700'">
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <p class="text-[12px] font-black">{{ message.author }}</p>
                      <p class="text-[10px] font-bold opacity-70">{{ localized(message.role) }}</p>
                    </div>
                    <span class="text-[10px] font-black opacity-60" dir="ltr">{{ formatDateTime(message.createdAt) }}</span>
                  </div>
                  <p class="mt-3 text-[12px] font-bold leading-6">{{ localized(message.message) }}</p>
                </div>
              </div>
            </div>
          </div>

          <footer class="border-t border-slate-100 bg-slate-50 px-6 py-5">
            <div *ngIf="selectedTicket.status === 'resolved'" class="mb-3 rounded-[1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] font-black text-amber-700">
              {{ 'SUPPORT_ADMIN.DETAIL.CLOSED_BANNER_WARNING' | translate }}
            </div>

            <div class="grid gap-3 md:grid-cols-[1fr_auto]">
              <select [(ngModel)]="statusDraft" class="h-11 rounded-[1rem] border border-slate-200 bg-white px-4 text-[12px] font-black text-slate-700 outline-none">
                <option value="open">{{ 'SUPPORT_ADMIN.STATUS.OPEN' | translate }}</option>
                <option value="in_progress">{{ 'SUPPORT_ADMIN.STATUS.IN_PROGRESS' | translate }}</option>
                <option value="waiting_vendor">{{ 'SUPPORT_ADMIN.STATUS.WAITING_VENDOR' | translate }}</option>
                <option value="resolved">{{ 'SUPPORT_ADMIN.STATUS.RESOLVED' | translate }}</option>
              </select>
              <button type="button" (click)="updateSelectedTicketStatus()" class="h-11 rounded-[1rem] border border-slate-200 bg-white px-4 text-[12px] font-black text-slate-700 transition hover:border-zadna-primary/20 hover:text-zadna-primary">
                {{ 'SUPPORT_ADMIN.ACTIONS.UPDATE_STATUS' | translate }}
              </button>
            </div>

            <textarea [(ngModel)]="replyDraft" rows="3" [placeholder]="'SUPPORT_ADMIN.DETAIL.REPLY_PLACEHOLDER' | translate"
              [disabled]="selectedTicket.status === 'resolved' || isMutatingTicket"
              class="mt-3 w-full resize-none rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-[12px] font-bold text-slate-800 outline-none focus:border-zadna-primary/30 focus:ring-4 focus:ring-zadna-primary/5 disabled:cursor-not-allowed disabled:opacity-50"></textarea>

            <div class="mt-3 flex flex-wrap justify-between gap-3">
              <button type="button" (click)="assignSelectedTicket()" [disabled]="selectedTicket.status === 'resolved' || isMutatingTicket"
                class="rounded-[1rem] border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-black text-slate-700 transition hover:border-zadna-primary/20 hover:text-zadna-primary disabled:cursor-not-allowed disabled:opacity-50">
                {{ 'SUPPORT_ADMIN.ACTIONS.ASSIGN_TO_ME' | translate }}
              </button>
              <button type="button" (click)="sendSelectedTicketReply()" [disabled]="!replyDraft.trim() || isMutatingTicket || selectedTicket.status === 'resolved'"
                class="rounded-[1rem] bg-zadna-primary px-5 py-2.5 text-[12px] font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50">
                {{ 'SUPPORT_ADMIN.ACTIONS.SEND_REPLY' | translate }}
              </button>
            </div>
          </footer>
        </section>
      </aside>

      <aside *ngIf="selectedDriverCase"
        class="fixed inset-0 z-50 flex bg-slate-950/40 backdrop-blur-sm justify-end">
        <button type="button" class="absolute inset-0 cursor-default" (click)="closeDetails()" [attr.aria-label]="'COMMON.CLOSE' | translate"></button>
        <section class="support-drawer relative flex h-full w-full max-w-[42rem] flex-col overflow-hidden rounded-s-[2rem] bg-white shadow-2xl">
          <header class="border-b border-slate-100 px-6 py-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[11px] font-black uppercase tracking-[0.16em] text-zadna-primary">{{ 'SUPPORT_ADMIN.TABS.DRIVER' | translate }}</p>
                <h2 class="mt-2 text-[20px] font-black text-slate-950">{{ selectedDriverCase.reason || selectedDriverCase.typeLabel }}</h2>
                <p class="mt-1 text-[12px] font-semibold leading-6 text-slate-500">{{ driverCaseSummary(selectedDriverCase) }}</p>
              </div>
              <button type="button" (click)="closeDetails()" class="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50">
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </header>

          <div class="flex-1 overflow-y-auto px-6 py-5">
            <div class="grid gap-3 md:grid-cols-2">
              <div class="rounded-[1rem] border border-slate-100 bg-slate-50 p-4">
                <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'COMMON.STATUS' | translate }}</p>
                <p class="mt-2 text-[13px] font-black text-slate-900">{{ selectedDriverCase.caseStatusLabel || supportCaseStatusLabel(selectedDriverCase.caseStatus) }}</p>
              </div>
              <div class="rounded-[1rem] border border-slate-100 bg-slate-50 p-4">
                <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'SUPPORT_ADMIN.DRIVER_TABLE.DRIVER' | translate }}</p>
                <a *ngIf="driverCaseDriverId(selectedDriverCase); else selectedDriverNoLink" [routerLink]="['/drivers', driverCaseDriverId(selectedDriverCase)]" [queryParams]="{ tab: 'support' }" class="mt-2 block text-[13px] font-black text-zadna-primary hover:text-teal-700">
                  {{ driverCaseDriverLabel(selectedDriverCase) }}
                </a>
                <ng-template #selectedDriverNoLink>
                  <p class="mt-2 text-[13px] font-black text-slate-900">{{ driverCaseDriverLabel(selectedDriverCase) }}</p>
                </ng-template>
              </div>
            </div>

            <div class="mt-5 rounded-[1rem] border border-slate-100 bg-slate-50 p-4">
              <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'SUPPORT_ADMIN.DETAIL.SUMMARY' | translate }}</p>
              <p class="mt-2 text-[13px] font-bold leading-7 text-slate-700">{{ selectedDriverCase.note || selectedDriverCase.customerSummary || selectedDriverCase.driverResponse }}</p>
            </div>

            <div class="mt-5 space-y-3">
              <div *ngFor="let message of selectedDriverCase.messages ?? []" class="rounded-[1rem] border border-slate-100 bg-white p-4">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-[12px] font-black text-slate-800">{{ message.authorRoleLabel || message.authorRole }}</p>
                  <span class="text-[10px] font-bold text-slate-400" dir="ltr">{{ formatDateTime(message.createdAt) }}</span>
                </div>
                <p class="mt-2 text-[12px] font-semibold leading-6 text-slate-600">{{ message.body || message.title }}</p>
              </div>
            </div>
          </div>

          <footer class="border-t border-slate-100 bg-slate-50 px-6 py-5 overflow-y-auto max-h-[16rem]">
            <div class="grid grid-cols-2 gap-2.5">
              <button class="flex items-center justify-center gap-1.5 rounded-[1rem] bg-zadna-primary py-2.5 px-3 text-[11px] font-black text-white transition hover:bg-teal-700 normal-case" type="button" (click)="sendPublicMessageActiveCase()"
                *ngIf="canMessageActiveCase">
                <span class="material-symbols-outlined text-[16px]">send</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.SEND_MESSAGE' | translate }}
              </button>
              <button class="flex items-center justify-center gap-1.5 rounded-[1rem] border border-slate-200 bg-white py-2.5 px-3 text-[11px] font-black text-slate-700 transition hover:bg-slate-50 normal-case" type="button" (click)="assignActiveCase()"
                *ngIf="canAssignActiveCase">
                <span class="material-symbols-outlined text-[16px]">person_add</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.ASSIGN' | translate }}
              </button>
              <button class="flex items-center justify-center gap-1.5 rounded-[1rem] border border-slate-200 bg-white py-2.5 px-3 text-[11px] font-black text-slate-700 transition hover:bg-slate-50 normal-case" type="button" (click)="addNoteActiveCase()"
                *ngIf="canAddNoteToActiveCase">
                <span class="material-symbols-outlined text-[16px]">note_add</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.ADD_NOTE' | translate }}
              </button>
              <button class="flex items-center justify-center gap-1.5 rounded-[1rem] border border-slate-200 bg-white py-2.5 px-3 text-[11px] font-black text-slate-700 transition hover:bg-slate-50 normal-case" type="button" (click)="openEscalationModal()"
                *ngIf="canEscalateActiveCase">
                <span class="material-symbols-outlined text-[16px]">priority_high</span>
                {{ 'DISPUTES_DASHBOARD.BULK.ESCALATE' | translate }}
              </button>
              <button class="flex items-center justify-center gap-1.5 rounded-[1rem] bg-zadna-primary py-2.5 px-3 text-[11px] font-black text-white transition hover:bg-teal-700 normal-case" type="button" (click)="openApprovalModal()"
                *ngIf="canApproveActiveCase && activeSupportCase?.type === 'return_request'">
                <span class="material-symbols-outlined text-[16px]">check_circle</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.APPROVE_RETURN' | translate }}
              </button>
              <button class="flex items-center justify-center gap-1.5 rounded-[1rem] bg-zadna-primary py-2.5 px-3 text-[11px] font-black text-white transition hover:bg-teal-700 normal-case" type="button" (click)="approveComplaintActiveCase()"
                *ngIf="canApproveActiveCase && activeSupportCase?.type !== 'return_request'">
                <span class="material-symbols-outlined text-[16px]">check_circle</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.APPROVE_COMPLAINT' | translate }}
              </button>
              <button class="flex items-center justify-center gap-1.5 rounded-[1rem] border border-slate-200 bg-white py-2.5 px-3 text-[11px] font-black text-slate-700 transition hover:bg-slate-50 normal-case" type="button"
                (click)="openRequestInfoModal()" *ngIf="canRequestEvidenceForActiveCase">
                <span class="material-symbols-outlined text-[16px]">help_outline</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.REQUEST_INFO' | translate }}
              </button>
              <button class="flex items-center justify-center gap-1.5 rounded-[1rem] bg-red-600 py-2.5 px-3 text-[11px] font-black text-white transition hover:bg-red-700 normal-case" type="button" (click)="openRejectionModal()"
                *ngIf="canRejectActiveCase">
                <span class="material-symbols-outlined text-[16px]">cancel</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.REJECT' | translate }}
              </button>
              <button
                class="flex items-center justify-center gap-1.5 rounded-[1rem] border border-emerald-200 bg-emerald-50 py-2.5 px-3 text-[11px] font-black text-emerald-700 transition-all hover:bg-emerald-100 normal-case"
                type="button" (click)="resolveActiveCase()" *ngIf="canResolveActiveCase">
                <span class="material-symbols-outlined text-[16px]">done_all</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.RESOLVE' | translate }}
              </button>
              <button
                class="flex items-center justify-center gap-1.5 rounded-[1rem] border border-amber-200 bg-amber-50 py-2.5 px-3 text-[11px] font-black text-amber-700 transition-all hover:bg-amber-100 normal-case"
                type="button" (click)="reopenActiveCase()" *ngIf="canReopenActiveCase">
                <span class="material-symbols-outlined text-[16px]">restart_alt</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.REOPEN' | translate }}
              </button>
            </div>
          </footer>
        </section>
      </aside>

      <aside *ngIf="selectedLegacyCase"
        class="fixed inset-0 z-50 flex bg-slate-950/40 backdrop-blur-sm justify-end">
        <button type="button" class="absolute inset-0 cursor-default" (click)="closeDetails()" [attr.aria-label]="'COMMON.CLOSE' | translate"></button>
        <section class="support-drawer relative flex h-full w-full max-w-[42rem] flex-col overflow-hidden rounded-s-[2rem] bg-white shadow-2xl">
          <header class="border-b border-slate-100 px-6 py-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[11px] font-black uppercase tracking-[0.16em] text-zadna-primary">{{ 'SUPPORT_ADMIN.TABS.LEGACY' | translate }}</p>
                <h2 class="mt-2 text-[20px] font-black text-slate-950">{{ legacyCasePrimaryLabel(selectedLegacyCase) }}</h2>
                <p class="mt-1 text-[12px] font-semibold leading-6 text-slate-500">{{ selectedLegacyCase.customerSummary || selectedLegacyCase.note }}</p>
              </div>
              <button type="button" (click)="closeDetails()" class="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50">
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </header>

          <div class="flex-1 overflow-y-auto px-6 py-5">
            <div class="grid gap-3 md:grid-cols-2">
              <div class="rounded-[1rem] border border-slate-100 bg-slate-50 p-4">
                <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'SUPPORT_ADMIN.LEGACY_TABLE.CUSTOMER' | translate }}</p>
                <p class="mt-2 text-[13px] font-black text-slate-900">{{ selectedLegacyCase.customerName }}</p>
              </div>
              <div class="rounded-[1rem] border border-slate-100 bg-slate-50 p-4">
                <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'SUPPORT_ADMIN.LEGACY_TABLE.VENDOR' | translate }}</p>
                <p class="mt-2 text-[13px] font-black text-slate-900">{{ selectedLegacyCase.merchantName }}</p>
              </div>
            </div>

            <div class="mt-5 rounded-[1rem] border border-slate-100 bg-slate-50 p-4">
              <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'SUPPORT_ADMIN.DETAIL.SUMMARY' | translate }}</p>
              <p class="mt-2 text-[13px] font-bold leading-7 text-slate-700">{{ selectedLegacyCase.note || selectedLegacyCase.customerSummary }}</p>
            </div>

            <div class="mt-5 space-y-3">
              <div *ngFor="let message of selectedLegacyCase.messages ?? []" class="rounded-[1rem] border border-slate-100 bg-white p-4">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-[12px] font-black text-slate-800">{{ message.authorRoleLabel || message.authorRole }}</p>
                  <span class="text-[10px] font-bold text-slate-400" dir="ltr">{{ formatDateTime(message.createdAt) }}</span>
                </div>
                <p class="mt-2 text-[12px] font-semibold leading-6 text-slate-600">{{ message.body || message.title }}</p>
              </div>
            </div>
          </div>

          <footer class="border-t border-slate-100 bg-slate-50 px-6 py-5 overflow-y-auto max-h-[16rem]">
            <div class="grid grid-cols-2 gap-2.5">
              <button class="flex items-center justify-center gap-1.5 rounded-[1rem] bg-zadna-primary py-2.5 px-3 text-[11px] font-black text-white transition hover:bg-teal-700 normal-case" type="button" (click)="sendPublicMessageActiveCase()"
                *ngIf="canMessageActiveCase">
                <span class="material-symbols-outlined text-[16px]">send</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.SEND_MESSAGE' | translate }}
              </button>
              <button class="flex items-center justify-center gap-1.5 rounded-[1rem] border border-slate-200 bg-white py-2.5 px-3 text-[11px] font-black text-slate-700 transition hover:bg-slate-50 normal-case" type="button" (click)="assignActiveCase()"
                *ngIf="canAssignActiveCase">
                <span class="material-symbols-outlined text-[16px]">person_add</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.ASSIGN' | translate }}
              </button>
              <button class="flex items-center justify-center gap-1.5 rounded-[1rem] border border-slate-200 bg-white py-2.5 px-3 text-[11px] font-black text-slate-700 transition hover:bg-slate-50 normal-case" type="button" (click)="addNoteActiveCase()"
                *ngIf="canAddNoteToActiveCase">
                <span class="material-symbols-outlined text-[16px]">note_add</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.ADD_NOTE' | translate }}
              </button>
              <button class="flex items-center justify-center gap-1.5 rounded-[1rem] border border-slate-200 bg-white py-2.5 px-3 text-[11px] font-black text-slate-700 transition hover:bg-slate-50 normal-case" type="button" (click)="openEscalationModal()"
                *ngIf="canEscalateActiveCase">
                <span class="material-symbols-outlined text-[16px]">priority_high</span>
                {{ 'DISPUTES_DASHBOARD.BULK.ESCALATE' | translate }}
              </button>
              <button class="flex items-center justify-center gap-1.5 rounded-[1rem] bg-zadna-primary py-2.5 px-3 text-[11px] font-black text-white transition hover:bg-teal-700 normal-case" type="button" (click)="openApprovalModal()"
                *ngIf="canApproveActiveCase && activeSupportCase?.type === 'return_request'">
                <span class="material-symbols-outlined text-[16px]">check_circle</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.APPROVE_RETURN' | translate }}
              </button>
              <button class="flex items-center justify-center gap-1.5 rounded-[1rem] bg-zadna-primary py-2.5 px-3 text-[11px] font-black text-white transition hover:bg-teal-700 normal-case" type="button" (click)="approveComplaintActiveCase()"
                *ngIf="canApproveActiveCase && activeSupportCase?.type !== 'return_request'">
                <span class="material-symbols-outlined text-[16px]">check_circle</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.APPROVE_COMPLAINT' | translate }}
              </button>
              <button class="flex items-center justify-center gap-1.5 rounded-[1rem] border border-slate-200 bg-white py-2.5 px-3 text-[11px] font-black text-slate-700 transition hover:bg-slate-50 normal-case" type="button"
                (click)="openRequestInfoModal()" *ngIf="canRequestEvidenceForActiveCase">
                <span class="material-symbols-outlined text-[16px]">help_outline</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.REQUEST_INFO' | translate }}
              </button>
              <button class="flex items-center justify-center gap-1.5 rounded-[1rem] bg-red-600 py-2.5 px-3 text-[11px] font-black text-white transition hover:bg-red-700 normal-case" type="button" (click)="openRejectionModal()"
                *ngIf="canRejectActiveCase">
                <span class="material-symbols-outlined text-[16px]">cancel</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.REJECT' | translate }}
              </button>
              <button
                class="flex items-center justify-center gap-1.5 rounded-[1rem] border border-emerald-200 bg-emerald-50 py-2.5 px-3 text-[11px] font-black text-emerald-700 transition-all hover:bg-emerald-100 normal-case"
                type="button" (click)="resolveActiveCase()" *ngIf="canResolveActiveCase">
                <span class="material-symbols-outlined text-[16px]">done_all</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.RESOLVE' | translate }}
              </button>
              <button
                class="flex items-center justify-center gap-1.5 rounded-[1rem] border border-amber-200 bg-amber-50 py-2.5 px-3 text-[11px] font-black text-amber-700 transition-all hover:bg-amber-100 normal-case"
                type="button" (click)="reopenActiveCase()" *ngIf="canReopenActiveCase">
                <span class="material-symbols-outlined text-[16px]">restart_alt</span>
                {{ 'DISPUTES_DASHBOARD.DRAWER.REOPEN' | translate }}
              </button>
            </div>
          </footer>
        </section>
      </aside>

      <!-- Support Modals -->
      <app-support-case-approval-modal
        [isOpen]="isApprovalModalOpen"
        [dispute]="activeSupportCase"
        [draft]="formDrafts.approval"
        (close)="closeApprovalModal()"
        (saveDraft)="saveApprovalDraft($event)"
        (submitDecision)="submitApproval($event)">
      </app-support-case-approval-modal>

      <app-support-case-rejection-modal
        [isOpen]="isRejectionModalOpen"
        [isRtl]="isRtl"
        [dispute]="activeSupportCase"
        (close)="closeRejectionModal()"
        (saveDraft)="saveRejectionDraft($event)"
        (submitDecision)="submitRejection($event)">
      </app-support-case-rejection-modal>

      <app-support-case-escalation-modal
        [isOpen]="isEscalationModalOpen"
        [isRtl]="isRtl"
        [dispute]="activeSupportCase"
        [draft]="formDrafts.escalation"
        (close)="closeEscalationModal()"
        (saveDraft)="saveEscalationDraft($event)"
        (submitEscalation)="submitEscalation($event)">
      </app-support-case-escalation-modal>

      <app-support-case-request-info-modal
        [isOpen]="isRequestInfoModalOpen"
        [isRtl]="isRtl"
        [supportCase]="activeSupportCase"
        [draft]="formDrafts.requestInfo"
        (close)="closeRequestInfoModal()"
        (saveDraft)="saveRequestInfoDraft($event)"
        (submitRequest)="submitRequestInfo($event)">
      </app-support-case-request-info-modal>

      <app-support-case-quick-action-modal
        [isOpen]="isQuickActionModalOpen"
        [isRtl]="isRtl"
        [config]="quickActionConfig"
        [value]="quickActionValue"
        (close)="closeQuickActionModal()"
        (submitAction)="submitQuickAction($event)">
      </app-support-case-quick-action-modal>
    </div>
  `
})
export class AdminSupportCenterComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly driverSupportCaseTypes: DriverSupportCaseType[] = ['driver_account', 'driver_report'];

  private readonly destroyRef = inject(DestroyRef);

  activeTab: AdminSupportTab = 'vendor';

  readonly vendorColumns: TableColumn[] = [
    { key: 'reference', title: 'SUPPORT_ADMIN.VENDOR_TABLE.REFERENCE', type: 'custom', align: 'left' },
    { key: 'subject', title: 'SUPPORT_ADMIN.VENDOR_TABLE.SUBJECT', type: 'custom', align: 'left' },
    { key: 'orderId', title: 'SUPPORT_ADMIN.VENDOR_TABLE.ORDER', type: 'custom', align: 'left' },
    { key: 'status', title: 'COMMON.STATUS', type: 'custom', align: 'center' },
    { key: 'priority', title: 'SUPPORT_ADMIN.VENDOR_TABLE.PRIORITY', type: 'custom', align: 'center' },
    { key: 'updatedAt', title: 'SUPPORT_ADMIN.VENDOR_TABLE.UPDATED', type: 'custom', align: 'left' },
    { key: 'actions', title: 'COMMON.ACTIONS', type: 'custom', align: 'center' }
  ];

  readonly driverColumns: TableColumn[] = [
    { key: 'case', title: 'SUPPORT_ADMIN.DRIVER_TABLE.CASE', type: 'custom', align: 'left' },
    { key: 'driver', title: 'SUPPORT_ADMIN.DRIVER_TABLE.DRIVER', type: 'custom', align: 'left' },
    { key: 'status', title: 'COMMON.STATUS', type: 'custom', align: 'center' },
    { key: 'priority', title: 'SUPPORT_ADMIN.VENDOR_TABLE.PRIORITY', type: 'custom', align: 'center' },
    { key: 'updatedAt', title: 'SUPPORT_ADMIN.VENDOR_TABLE.UPDATED', type: 'custom', align: 'left' },
    { key: 'actions', title: 'COMMON.ACTIONS', type: 'custom', align: 'center' }
  ];

  readonly legacyColumns: TableColumn[] = [
    { key: 'order', title: 'SUPPORT_ADMIN.LEGACY_TABLE.ORDER', type: 'custom', align: 'left' },
    { key: 'customer', title: 'SUPPORT_ADMIN.LEGACY_TABLE.CUSTOMER', type: 'custom', align: 'left' },
    { key: 'vendor', title: 'SUPPORT_ADMIN.LEGACY_TABLE.VENDOR', type: 'custom', align: 'left' },
    { key: 'status', title: 'COMMON.STATUS', type: 'custom', align: 'center' },
    { key: 'priority', title: 'SUPPORT_ADMIN.VENDOR_TABLE.PRIORITY', type: 'custom', align: 'center' },
    { key: 'updatedAt', title: 'SUPPORT_ADMIN.VENDOR_TABLE.UPDATED', type: 'custom', align: 'left' },
    { key: 'actions', title: 'COMMON.ACTIONS', type: 'custom', align: 'center' }
  ];

  panelFilters: Record<string, any> = {};
  isFiltersExpanded = false;

  get filterFields(): FilterField[] {
    const fields: FilterField[] = [
      {
        key: 'status',
        label: 'COMMON.STATUS',
        type: 'select',
        color: '#127c8c',
        placeholder: 'SUPPORT_ADMIN.FILTERS.ALL_STATUSES',
        options: this.statusOptions.map(opt => ({ value: opt.value, label: opt.labelKey }))
      },
      {
        key: 'priority',
        label: 'SUPPORT_ADMIN.VENDOR_TABLE.PRIORITY',
        type: 'select',
        color: '#f97316',
        placeholder: 'SUPPORT_ADMIN.FILTERS.ALL_PRIORITIES',
        options: this.priorityOptions.map(opt => ({ value: opt.value, label: opt.labelKey }))
      }
    ];

    if (this.activeTab === 'vendor') {
      fields.push({
        key: 'category',
        label: 'CATALOG.CATEGORY',
        type: 'select',
        color: '#8b5cf6',
        placeholder: 'SUPPORT_ADMIN.FILTERS.ALL_CATEGORIES',
        options: this.categoryOptions.map(cat => ({ value: cat, label: 'SUPPORT_ADMIN.CATEGORY.' + cat.toUpperCase() }))
      });
    }

    return fields;
  }

  toggleFiltersPanel(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  get hasActiveFilters(): boolean {
    return this.statusFilter !== 'all'
      || this.priorityFilter !== 'all'
      || this.categoryFilter !== 'all'
      || this.searchTerm.trim().length > 0;
  }

  onPanelFiltersChange(filters: Record<string, any>): void {
    this.statusFilter = filters['status'] || 'all';
    this.priorityFilter = filters['priority'] || 'all';
    this.categoryFilter = filters['category'] || 'all';
    this.syncPanelFilters();
    this.resetAndReload();
  }

  syncPanelFilters(): void {
    this.panelFilters = {
      status: this.statusFilter !== 'all' ? this.statusFilter : null,
      priority: this.priorityFilter !== 'all' ? this.priorityFilter : null,
      category: this.categoryFilter !== 'all' ? this.categoryFilter : null
    };
  }

  onSearchChange(): void {
    this.resetAndReload();
  }

  get kpiCards(): KPICard[] {
    return [
      {
        id: 'open-tickets',
        title: 'SUPPORT_ADMIN.KPIS.OPEN',
        value: this.totalOpenCount,
        icon: 'storefront',
        color: '#127c8c'
      },
      {
        id: 'waiting-vendor',
        title: 'SUPPORT_ADMIN.KPIS.WAITING_VENDOR',
        value: this.waitingVendorCount,
        icon: 'pending_actions',
        color: '#f59e0b'
      },
      {
        id: 'sla-breached',
        title: 'SUPPORT_ADMIN.KPIS.SLA_BREACHED',
        value: this.stats?.slaBreachedCount ?? 0,
        icon: 'priority_high',
        color: '#ef4444'
      },
      {
        id: 'avg-resolution',
        title: 'SUPPORT_ADMIN.KPIS.AVG_RESOLUTION',
        value: (this.stats?.avgResolutionHours ?? 0).toFixed(1),
        icon: 'hourglass_empty',
        color: '#6366f1',
        trend: {
          value: 0,
          isPositive: true,
          label: this.translate.instant('SUPPORT_ADMIN.KPIS.HOURS')
        }
      },
      {
        id: 'resolved-tickets',
        title: 'SUPPORT_ADMIN.KPIS.RESOLVED',
        value: this.resolvedCount,
        icon: 'check_circle',
        color: '#10b981'
      }
    ];
  }

  vendorTickets: AdminVendorSupportTicket[] = [];
  driverCases: SupportCaseRow[] = [];
  legacyCases: SupportCaseRow[] = [];
  selectedTicket: AdminVendorSupportTicket | null = null;
  selectedDriverCase: SupportCaseRow | null = null;
  selectedLegacyCase: SupportCaseRow | null = null;
  stats: AdminOrderCaseStatsResponse | null = null;

  isLoadingVendor = false;
  isLoadingDriver = false;
  isLoadingLegacy = false;
  isMutatingTicket = false;
  toastMessage = '';
  toastTone: ToastTone = 'success';

  searchTerm = '';
  statusFilter = 'all';
  priorityFilter = 'all';
  categoryFilter = 'all';
  vendorPage = 1;
  driverPage = 1;
  legacyPage = 1;
  pageSize = 12;
  vendorTotal = 0;
  driverTotal = 0;
  legacyTotal = 0;
  replyDraft = '';
  statusDraft: AdminSupportStatus = 'open';

  readonly categoryOptions = ['orders', 'products', 'finance', 'offers', 'staff', 'profile', 'technical', 'general'];
  readonly vendorStatusOptions: SupportFilterOption[] = [
    { value: 'open', labelKey: 'SUPPORT_ADMIN.STATUS.OPEN' },
    { value: 'in_progress', labelKey: 'SUPPORT_ADMIN.STATUS.IN_PROGRESS' },
    { value: 'waiting_vendor', labelKey: 'SUPPORT_ADMIN.STATUS.WAITING_VENDOR' },
    { value: 'resolved', labelKey: 'SUPPORT_ADMIN.STATUS.RESOLVED' }
  ];
  readonly caseStatusOptions: SupportFilterOption[] = [
    { value: 'open', labelKey: 'SUPPORT_ADMIN.STATUS.OPEN' },
    { value: 'review', labelKey: 'SUPPORT_ADMIN.CASE_STATUS.REVIEW' },
    { value: 'merchant', labelKey: 'SUPPORT_ADMIN.CASE_STATUS.WAITING_RESPONSE' },
    { value: 'resolved', labelKey: 'SUPPORT_ADMIN.STATUS.RESOLVED' }
  ];
  readonly vendorPriorityOptions: SupportFilterOption[] = [
    { value: 'urgent', labelKey: 'SUPPORT_ADMIN.PRIORITY.URGENT' },
    { value: 'high', labelKey: 'SUPPORT_ADMIN.PRIORITY.HIGH' },
    { value: 'medium', labelKey: 'SUPPORT_ADMIN.PRIORITY.MEDIUM' },
    { value: 'low', labelKey: 'SUPPORT_ADMIN.PRIORITY.LOW' }
  ];
  readonly casePriorityOptions: SupportFilterOption[] = [
    { value: 'critical', labelKey: 'SUPPORT_ADMIN.PRIORITY.CRITICAL' },
    { value: 'high', labelKey: 'SUPPORT_ADMIN.PRIORITY.HIGH' },
    { value: 'medium', labelKey: 'SUPPORT_ADMIN.PRIORITY.MEDIUM' },
    { value: 'low', labelKey: 'SUPPORT_ADMIN.PRIORITY.LOW' }
  ];

  modalState = createEmptySupportCaseModalState();
  formDrafts = createEmptySupportCaseFormDrafts();
  quickActionConfig: SupportCaseQuickActionModalConfig | null = null;
  quickActionValue: SupportCaseQuickActionFormValue = createEmptySupportCaseQuickActionFormValue();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly supportService: AdminVendorSupportService,
    private readonly supportCasesService: SupportCasesService,
    public readonly translate: TranslateService
  ) {}

  get activeSupportCase(): SupportCaseRow | null {
    return this.selectedDriverCase || this.selectedLegacyCase || null;
  }

  get canAssignActiveCase(): boolean {
    return this.activeSupportCase?.allowedActions?.includes('assign') ?? false;
  }

  get canAddNoteToActiveCase(): boolean {
    return this.activeSupportCase?.allowedActions?.includes('note') ?? false;
  }

  get canMessageActiveCase(): boolean {
    return this.activeSupportCase?.allowedActions?.includes('message') ?? false;
  }

  get canRequestEvidenceForActiveCase(): boolean {
    return this.activeSupportCase?.allowedActions?.includes('request_evidence') ?? false;
  }

  get canEscalateActiveCase(): boolean {
    return this.activeSupportCase?.allowedActions?.includes('escalate') ?? false;
  }

  get canApproveActiveCase(): boolean {
    return this.activeSupportCase?.allowedActions?.includes('approve') ?? false;
  }

  get canRejectActiveCase(): boolean {
    return this.activeSupportCase?.allowedActions?.includes('reject') ?? false;
  }

  get canResolveActiveCase(): boolean {
    return this.activeSupportCase?.allowedActions?.includes('resolve') ?? false;
  }

  get canReopenActiveCase(): boolean {
    return this.activeSupportCase?.allowedActions?.includes('reopen') ?? false;
  }

  get isApprovalModalOpen(): boolean {
    return this.modalState.activeModal === 'approval';
  }

  get isEscalationModalOpen(): boolean {
    return this.modalState.activeModal === 'escalation';
  }

  get isRejectionModalOpen(): boolean {
    return this.modalState.activeModal === 'rejection';
  }

  get isRequestInfoModalOpen(): boolean {
    return this.modalState.activeModal === 'request_info';
  }

  get isQuickActionModalOpen(): boolean {
    return this.quickActionConfig !== null;
  }

  openModal(key: SupportCaseModalKey): void {
    this.modalState.activeModal = key;
  }

  closeModal(key: SupportCaseModalKey): void {
    if (this.modalState.activeModal === key) {
      this.modalState.activeModal = null;
    }
  }

  openApprovalModal(): void {
    this.openModal('approval');
  }

  closeApprovalModal(): void {
    this.closeModal('approval');
  }

  saveApprovalDraft(form: RefundDecisionForm): void {
    this.formDrafts.approval = { ...form };
    this.closeApprovalModal();
  }

  submitApproval(form: RefundDecisionForm): void {
    const activeCase = this.activeSupportCase;
    if (!activeCase) return;
    this.isMutatingTicket = true;
    this.supportCasesService.approveReturnRequest(activeCase.id, form)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          this.formDrafts.approval = null;
          this.closeApprovalModal();
          this.applySupportCaseUpdate(updated);
          this.showCustomToast(this.isRtl ? 'تم اعتماد الاسترجاع بنجاح.' : 'Return request approved successfully.');
        },
        error: (err) => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          console.error(err);
          this.showCustomToast(this.describeSupportError(err, this.isRtl ? 'فشل اعتماد الاسترجاع.' : 'Failed to approve return request.'), 'error');
        }
      });
  }

  openEscalationModal(): void {
    this.openModal('escalation');
  }

  closeEscalationModal(): void {
    this.closeModal('escalation');
  }

  saveEscalationDraft(form: EscalationDecisionForm): void {
    this.formDrafts.escalation = { ...form };
    this.closeEscalationModal();
  }

  submitEscalation(form: EscalationDecisionForm): void {
    const activeCase = this.activeSupportCase;
    if (!activeCase) return;
    this.isMutatingTicket = true;
    this.supportCasesService.escalateCase(activeCase.id, form)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          this.formDrafts.escalation = null;
          this.closeEscalationModal();
          this.applySupportCaseUpdate(updated);
          this.showCustomToast(this.isRtl ? 'تم تصعيد الحالة بنجاح.' : 'Support case escalated successfully.');
        },
        error: (err) => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          console.error(err);
          this.showCustomToast(this.describeSupportError(err, this.isRtl ? 'فشل تصعيد الحالة.' : 'Failed to escalate support case.'), 'error');
        }
      });
  }

  openRejectionModal(): void {
    this.openModal('rejection');
  }

  closeRejectionModal(): void {
    this.closeModal('rejection');
  }

  saveRejectionDraft(form: RejectionDecisionForm): void {
    this.formDrafts.rejection = { ...form };
    this.closeRejectionModal();
  }

  submitRejection(form: RejectionDecisionForm): void {
    const activeCase = this.activeSupportCase;
    if (!activeCase) return;
    this.isMutatingTicket = true;
    this.supportCasesService.rejectCase(activeCase.id, form)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          this.formDrafts.rejection = null;
          this.closeRejectionModal();
          this.applySupportCaseUpdate(updated);
          this.showCustomToast(this.isRtl ? 'تم رفض الحالة بنجاح.' : 'Support case rejected successfully.');
        },
        error: (err) => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          console.error(err);
          this.showCustomToast(this.describeSupportError(err, this.isRtl ? 'فشل رفض الحالة.' : 'Failed to reject support case.'), 'error');
        }
      });
  }

  openRequestInfoModal(): void {
    this.openModal('request_info');
  }

  closeRequestInfoModal(): void {
    this.closeModal('request_info');
  }

  saveRequestInfoDraft(form: RequestInfoForm): void {
    this.formDrafts.requestInfo = { ...form };
    this.closeRequestInfoModal();
  }

  submitRequestInfo(form: RequestInfoForm): void {
    const activeCase = this.activeSupportCase;
    if (!activeCase) return;
    this.isMutatingTicket = true;
    this.supportCasesService.requestEvidence(activeCase.id, form)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          this.formDrafts.requestInfo = null;
          this.closeRequestInfoModal();
          this.applySupportCaseUpdate(updated);
          this.showCustomToast(this.isRtl ? 'تم إرسال طلب المعلومات الإضافية بنجاح.' : 'Additional information request sent successfully.');
        },
        error: (err) => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          console.error(err);
          this.showCustomToast(this.describeSupportError(err, this.isRtl ? 'فشل إرسال طلب المعلومات.' : 'Failed to request additional information.'), 'error');
        }
      });
  }

  closeQuickActionModal(): void {
    this.quickActionConfig = null;
    this.quickActionValue = createEmptySupportCaseQuickActionFormValue();
  }

  submitQuickAction(value: SupportCaseQuickActionFormValue): void {
    const activeCase = this.activeSupportCase;
    if (!activeCase || !this.quickActionConfig) return;
    const actionType = this.quickActionConfig.type;
    this.isMutatingTicket = true;

    let obs$: Observable<SupportCaseRow>;
    let successMessage = '';
    let errorMessage = '';

    if (actionType === 'approve_complaint') {
      obs$ = this.supportCasesService.approveComplaint(activeCase.id, value.primaryValue, value.secondaryValue);
      successMessage = this.isRtl ? 'تم اعتماد الشكوى بنجاح.' : 'Complaint approved successfully.';
      errorMessage = this.isRtl ? 'فشل اعتماد الشكوى.' : 'Failed to approve complaint.';
    } else if (actionType === 'resolve') {
      obs$ = this.supportCasesService.resolveCase(activeCase.id, value.primaryValue);
      successMessage = this.isRtl ? 'تم حل الحالة بنجاح.' : 'Support case resolved successfully.';
      errorMessage = this.isRtl ? 'فشل حل الحالة.' : 'Failed to resolve support case.';
    } else if (actionType === 'reopen') {
      obs$ = this.supportCasesService.reopenCase(activeCase.id, value.primaryValue);
      successMessage = this.isRtl ? 'تمت إعادة فتح الحالة بنجاح.' : 'Support case reopened successfully.';
      errorMessage = this.isRtl ? 'فشل إعادة فتح الحالة.' : 'Failed to reopen support case.';
    } else if (actionType === 'add_note') {
      obs$ = this.supportCasesService.addNote(activeCase.id, value.primaryValue);
      successMessage = this.isRtl ? 'تمت إضافة الملاحظة بنجاح.' : 'Case note added successfully.';
      errorMessage = this.isRtl ? 'فشل إضافة الملاحظة.' : 'Failed to add case note.';
    } else {
      const role = this.activeTab === 'driver' ? 'driver' : 'customer';
      obs$ = this.supportCasesService.addPublicMessage(activeCase.id, value.primaryValue, role);
      successMessage = this.isRtl ? 'تم إرسال الرسالة بنجاح.' : 'Message sent successfully.';
      errorMessage = this.isRtl ? 'فشل إرسال الرسالة.' : 'Failed to send message.';
    }

    this.closeQuickActionModal();

    obs$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          this.applySupportCaseUpdate(updated);
          this.showCustomToast(successMessage);
        },
        error: (err) => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          console.error(err);
          this.showCustomToast(this.describeSupportError(err, errorMessage), 'error');
        }
      });
  }

  assignActiveCase(): void {
    const activeCase = this.activeSupportCase;
    if (!activeCase || !this.canAssignActiveCase) return;
    this.isMutatingTicket = true;
    this.supportCasesService.assignCase(activeCase.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          this.applySupportCaseUpdate(updated);
          this.showCustomToast(this.isRtl ? 'تم إسناد الحالة بنجاح.' : 'Support case assigned successfully.');
        },
        error: (err) => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          console.error(err);
          this.showCustomToast(this.describeSupportError(err, this.isRtl ? 'فشل إسناد الحالة.' : 'Failed to assign support case.'), 'error');
        }
      });
  }

  approveComplaintActiveCase(): void {
    this.openQuickActionModal('approve_complaint');
  }

  resolveActiveCase(): void {
    this.openQuickActionModal('resolve');
  }

  reopenActiveCase(): void {
    this.openQuickActionModal('reopen');
  }

  addNoteActiveCase(): void {
    this.openQuickActionModal('add_note');
  }

  sendPublicMessageActiveCase(): void {
    this.openQuickActionModal('send_message');
  }

  private openQuickActionModal(type: SupportCaseQuickActionType): void {
    this.quickActionConfig = this.buildQuickActionConfig(type);
    this.quickActionValue = this.createQuickActionDefaults(type);
  }

  private createQuickActionDefaults(type: SupportCaseQuickActionType): SupportCaseQuickActionFormValue {
    return createEmptySupportCaseQuickActionFormValue();
  }

  private buildQuickActionConfig(type: SupportCaseQuickActionType): SupportCaseQuickActionModalConfig {
    switch (type) {
      case 'approve_complaint':
        return {
          type,
          title: this.isRtl ? 'اعتماد الشكوى' : 'Approve complaint',
          subtitle: this.isRtl ? 'أدخل ملاحظات الموافقة الداخلية والرسالة الاختيارية للعميل.' : 'Add the internal approval note and optional customer message.',
          icon: 'check_circle',
          confirmLabel: this.isRtl ? 'اعتماد الشكوى' : 'Approve complaint',
          confirmClass: 'bg-emerald-600 hover:bg-emerald-700',
          primaryLabel: this.isRtl ? 'ملاحظات الموافقة الداخلية' : 'Internal approval notes',
          primaryPlaceholder: this.isRtl ? 'اكتب سبب اعتماد الشكوى...' : 'Write the internal reason for approval...',
          primaryRequired: true,
          secondaryLabel: this.isRtl ? 'رسالة العميل (اختياري)' : 'Customer message (optional)',
          secondaryPlaceholder: this.isRtl ? 'رسالة تظهر للعميل إذا لزم الأمر...' : 'Message shown to the customer if needed...'
        };
      case 'resolve':
        return {
          type,
          title: this.isRtl ? 'حل الحالة' : 'Resolve case',
          subtitle: this.isRtl ? 'يمكنك إضافة ملاحظة ختامية اختيارية قبل حل الحالة.' : 'You can add an optional closing note before resolving the case.',
          icon: 'done_all',
          confirmLabel: this.isRtl ? 'حل الحالة' : 'Resolve case',
          confirmClass: 'bg-emerald-600 hover:bg-emerald-700',
          primaryLabel: this.isRtl ? 'ملاحظة ختامية (اختياري)' : 'Closing note (optional)',
          primaryPlaceholder: this.isRtl ? 'اكتب أي ملاحظة ختامية...' : 'Write any closing note...'
        };
      case 'reopen':
        return {
          type,
          title: this.isRtl ? 'إعادة فتح الحالة' : 'Reopen case',
          subtitle: this.isRtl ? 'أضف سببا أو ملاحظة لإعادة فتح الحالة.' : 'Add a reason or note for reopening the case.',
          icon: 'restart_alt',
          confirmLabel: this.isRtl ? 'إعادة الفتح' : 'Reopen',
          confirmClass: 'bg-amber-600 hover:bg-amber-700',
          primaryLabel: this.isRtl ? 'ملاحظة إعادة الفتح' : 'Reopen note',
          primaryPlaceholder: this.isRtl ? 'اكتب سبب إعادة فتح الحالة...' : 'Write the reason for reopening the case...'
        };
      case 'add_note':
        return {
          type,
          title: this.isRtl ? 'إضافة ملاحظة' : 'Add note',
          subtitle: this.isRtl ? 'هذه الملاحظة داخلية ويتم حفظها داخل مسار الحالة.' : 'This note is internal and saved to the case timeline.',
          icon: 'note_add',
          confirmLabel: this.isRtl ? 'حفظ الملاحظة' : 'Save note',
          confirmClass: 'bg-slate-900 hover:bg-slate-800',
          primaryLabel: this.isRtl ? 'ملاحظة الحالة' : 'Case note',
          primaryPlaceholder: this.isRtl ? 'اكتب ملاحظة الحالة...' : 'Write the case note...',
          primaryRequired: true
        };
      case 'send_message':
      default:
        return {
          type: 'send_message',
          title: this.isRtl ? 'إرسال رسالة' : 'Send message',
          subtitle: this.isRtl ? 'اكتب الرسالة التي تريد إرسالها إلى الأطراف المعنية.' : 'Write the message you want to send to the relevant parties.',
          icon: 'send',
          confirmLabel: this.isRtl ? 'إرسال الرسالة' : 'Send message',
          confirmClass: 'bg-zadna-primary hover:bg-zadna-primaryDark',
          primaryLabel: this.isRtl ? 'نص الرسالة' : 'Message',
          primaryPlaceholder: this.isRtl ? 'اكتب الرسالة هنا...' : 'Write the message here...',
          primaryRequired: true
        };
    }
  }

  showCustomToast(message: string, tone: ToastTone = 'success'): void {
    this.toastTone = tone;
    this.toastMessage = message;
    setTimeout(() => {
      if (this.toastMessage === message) {
        this.toastMessage = '';
      }
    }, 2800);
  }

  private describeSupportError(error: unknown, fallbackMessage: string): string {
    const message = describeApiError(error, this.translate, { fallbackKey: 'COMMON.API_ERRORS.UNKNOWN' }).trim();
    return message && message !== this.translate.instant('COMMON.API_ERRORS.UNKNOWN')
      ? message
      : fallbackMessage;
  }

  private applySupportCaseUpdate(updated: SupportCaseRow): void {
    if (this.activeTab === 'driver') {
      this.selectedDriverCase = updated;
      this.loadDriverCases();
    } else if (this.activeTab === 'legacy') {
      this.selectedLegacyCase = updated;
      this.loadLegacyCases();
    }
    this.loadStats();
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
      this.cdr.markForCheck();
        const tab = params.get('tab');
        this.activeTab = tab === 'legacy' || tab === 'driver' ? tab : 'vendor';
        this.searchTerm = params.get('search') ?? this.searchTerm;
        this.syncPanelFilters();

        const ticketId = params.get('ticketId');
        const driverCaseId = params.get('driverCaseId');
        const legacyCaseId = params.get('legacyCaseId');

        this.loadVendorTickets();
        this.loadStats();
        this.loadDriverCases(() => {
          if (driverCaseId) {
            const match = this.driverCases.find((item) => item.id === driverCaseId);
            if (match) {
              this.openDriverCase(match, false);
            }
          }
        });
        this.loadLegacyCases(() => {
          if (legacyCaseId) {
            const match = this.legacyCases.find((item) => item.id === legacyCaseId);
            if (match) {
              this.openLegacyCase(match, false);
            }
          }
        });

        if (ticketId) {
          this.supportService.getTicket(ticketId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((ticket) => {
      this.cdr.markForCheck();
              if (ticket) {
                this.setSelectedTicket(ticket, false);
              }
            });
        }
      });
  }

  get isRtl(): boolean {
    return (this.translate.currentLang || 'ar').startsWith('ar');
  }

  get statusOptions(): SupportFilterOption[] {
    return this.activeTab === 'vendor' ? this.vendorStatusOptions : this.caseStatusOptions;
  }

  get priorityOptions(): SupportFilterOption[] {
    return this.activeTab === 'vendor' ? this.vendorPriorityOptions : this.casePriorityOptions;
  }

  get vendorTotalPages(): number {
    return Math.max(1, Math.ceil(this.vendorTotal / this.pageSize));
  }

  get driverTotalPages(): number {
    return Math.max(1, Math.ceil(this.driverTotal / this.pageSize));
  }

  get legacyTotalPages(): number {
    return Math.max(1, Math.ceil(this.legacyTotal / this.pageSize));
  }

  get openTicketCount(): number {
    return this.vendorTickets.filter((ticket) => ticket.status !== 'resolved').length;
  }

  get totalOpenCount(): number {
    return this.stats ? this.stats.totalOpen : this.openTicketCount;
  }

  get waitingVendorCount(): number {
    return this.vendorTickets.filter((ticket) => ticket.status === 'waiting_vendor').length;
  }

  get resolvedTicketCount(): number {
    return this.vendorTickets.filter((ticket) => ticket.status === 'resolved').length;
  }

  get resolvedCount(): number {
    if (this.stats) {
      const match = this.stats.byStatus.find((s) => s.label.toLowerCase() === 'resolved');
      return match ? match.count : 0;
    }
    return this.resolvedTicketCount;
  }

  setActiveTab(tab: AdminSupportTab): void {
    if (this.activeTab === tab) {
      return;
    }

    this.activeTab = tab;
    this.statusFilter = 'all';
    this.priorityFilter = 'all';
    this.categoryFilter = 'all';
    this.syncPanelFilters();
    this.selectedTicket = null;
    this.selectedDriverCase = null;
    this.selectedLegacyCase = null;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab, ticketId: null, driverCaseId: null, legacyCaseId: null },
      queryParamsHandling: 'merge'
    });
  }

  resetAndReload(): void {
    this.vendorPage = 1;
    this.driverPage = 1;
    this.legacyPage = 1;
    this.reloadActiveTab();
  }

  loadStats(): void {
    this.supportCasesService.getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats) => {
        this.cdr.markForCheck();
          this.stats = stats;
        },
        error: (err) => {
        this.cdr.markForCheck();
          console.error('Failed to load support case stats', err);
        }
      });
  }

  reloadActiveTab(): void {
    this.syncQueryParams();
    if (this.activeTab === 'vendor') {
      this.loadVendorTickets();
    } else if (this.activeTab === 'driver') {
      this.loadDriverCases();
    } else {
      this.loadLegacyCases();
    }
    this.loadStats();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.priorityFilter = 'all';
    this.categoryFilter = 'all';
    this.syncPanelFilters();
    this.resetAndReload();
  }

  onVendorPageChange(page: number): void {
    this.vendorPage = page;
    this.loadVendorTickets();
  }

  onDriverPageChange(page: number): void {
    this.driverPage = page;
    this.loadDriverCases();
  }

  onLegacyPageChange(page: number): void {
    this.legacyPage = page;
    this.loadLegacyCases();
  }

  openTicket(ticket: AdminVendorSupportTicket): void {
    this.setSelectedTicket(ticket, true);
    this.supportService.getTicket(ticket.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((detail) => {
      this.cdr.markForCheck();
        if (detail) {
          this.setSelectedTicket(detail, true);
        }
      });
  }

  openLegacyCase(legacyCase: SupportCaseRow, updateQuery = true): void {
    this.selectedLegacyCase = legacyCase;
    this.selectedTicket = null;
    this.selectedDriverCase = null;
    this.replyDraft = '';

    if (updateQuery) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: 'legacy', legacyCaseId: legacyCase.id, driverCaseId: null, ticketId: null },
        queryParamsHandling: 'merge'
      });
    }
  }

  openDriverCase(driverCase: SupportCaseRow, updateQuery = true): void {
    this.selectedDriverCase = driverCase;
    this.selectedTicket = null;
    this.selectedLegacyCase = null;
    this.replyDraft = '';

    if (updateQuery) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: 'driver', driverCaseId: driverCase.id, legacyCaseId: null, ticketId: null },
        queryParamsHandling: 'merge'
      });
    }
  }

  closeDetails(): void {
    this.selectedTicket = null;
    this.selectedDriverCase = null;
    this.selectedLegacyCase = null;
    this.replyDraft = '';
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ticketId: null, driverCaseId: null, legacyCaseId: null },
      queryParamsHandling: 'merge'
    });
  }

  assignSelectedTicket(): void {
    if (!this.selectedTicket || this.isMutatingTicket) {
      return;
    }

    this.isMutatingTicket = true;
    this.supportService.assignToMe(this.selectedTicket.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ticket) => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          this.setSelectedTicket(ticket, false);
          this.loadVendorTickets();
          this.loadStats();
          this.showToast('SUPPORT_ADMIN.FEEDBACK.ASSIGNED', 'success');
        },
        error: () => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          this.showToast('SUPPORT_ADMIN.FEEDBACK.ACTION_FAILED', 'error');
        }
      });
  }

  sendSelectedTicketReply(): void {
    const message = this.replyDraft.trim();
    if (!this.selectedTicket || !message || this.isMutatingTicket) {
      return;
    }

    this.isMutatingTicket = true;
    this.supportService.sendMessage(this.selectedTicket.id, message)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ticket) => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          this.replyDraft = '';
          this.setSelectedTicket(ticket, false);
          this.loadVendorTickets();
          this.loadStats();
          this.showToast('SUPPORT_ADMIN.FEEDBACK.REPLY_SENT', 'success');
        },
        error: () => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          this.showToast('SUPPORT_ADMIN.FEEDBACK.ACTION_FAILED', 'error');
        }
      });
  }

  sendSelectedDriverReply(): void {
    const message = this.replyDraft.trim();
    if (!this.selectedDriverCase || !message || this.isMutatingTicket) {
      return;
    }

    this.isMutatingTicket = true;
    this.supportCasesService.addPublicMessage(this.selectedDriverCase.id, message, 'driver')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (driverCase) => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          this.replyDraft = '';
          this.selectedDriverCase = driverCase;
          this.loadDriverCases();
          this.loadStats();
          this.showToast('SUPPORT_ADMIN.FEEDBACK.REPLY_SENT', 'success');
        },
        error: () => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          this.showToast('SUPPORT_ADMIN.FEEDBACK.ACTION_FAILED', 'error');
        }
      });
  }

  updateSelectedTicketStatus(): void {
    if (!this.selectedTicket || this.isMutatingTicket) {
      return;
    }

    this.isMutatingTicket = true;
    this.supportService.updateStatus(this.selectedTicket.id, this.statusDraft)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ticket) => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          this.setSelectedTicket(ticket, false);
          this.loadVendorTickets();
          this.loadStats();
          this.showToast('SUPPORT_ADMIN.FEEDBACK.STATUS_UPDATED', 'success');
        },
        error: () => {
        this.cdr.markForCheck();
          this.isMutatingTicket = false;
          this.showToast('SUPPORT_ADMIN.FEEDBACK.ACTION_FAILED', 'error');
        }
      });
  }

  localized(value?: { ar: string; en: string } | null): string {
    if (!value) {
      return '';
    }

    return this.isRtl ? (value.ar || value.en) : (value.en || value.ar);
  }

  statusLabel(status: string): string {
    const key = status === 'in_progress'
      ? 'SUPPORT_ADMIN.STATUS.IN_PROGRESS'
      : status === 'waiting_vendor'
        ? 'SUPPORT_ADMIN.STATUS.WAITING_VENDOR'
        : status === 'resolved'
          ? 'SUPPORT_ADMIN.STATUS.RESOLVED'
          : 'SUPPORT_ADMIN.STATUS.OPEN';
    return this.translate.instant(key);
  }

  priorityLabel(priority: string): string {
    const key = priority === 'urgent'
      ? 'SUPPORT_ADMIN.PRIORITY.URGENT'
      : priority === 'critical'
        ? 'SUPPORT_ADMIN.PRIORITY.CRITICAL'
        : priority === 'high'
          ? 'SUPPORT_ADMIN.PRIORITY.HIGH'
          : priority === 'low'
            ? 'SUPPORT_ADMIN.PRIORITY.LOW'
            : 'SUPPORT_ADMIN.PRIORITY.MEDIUM';
    return this.translate.instant(key);
  }

  categoryLabel(category: string): string {
    const normalized = (category || 'general').toUpperCase();
    const key = `SUPPORT_ADMIN.CATEGORY.${normalized}`;
    const translated = this.translate.instant(key);
    return translated === key ? category : translated;
  }

  statusClass(status: string): string {
    switch (status) {
      case 'resolved':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'waiting_vendor':
        return 'border-amber-200 bg-amber-50 text-amber-700';
      case 'in_progress':
        return 'border-sky-200 bg-sky-50 text-sky-700';
      default:
        return 'border-rose-200 bg-rose-50 text-rose-700';
    }
  }

  legacyStatusClass(status: string): string {
    return status === 'resolved' || status === 'approved'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : status === 'rejected'
        ? 'border-slate-200 bg-slate-100 text-slate-600'
        : status === 'awaiting_customer_evidence'
          ? 'border-amber-200 bg-amber-50 text-amber-700'
          : 'border-sky-200 bg-sky-50 text-sky-700';
  }

  priorityClass(priority: string): string {
    switch (priority) {
      case 'urgent':
      case 'critical':
        return 'border-rose-200 bg-rose-50 text-rose-700';
      case 'high':
        return 'border-amber-200 bg-amber-50 text-amber-700';
      case 'low':
        return 'border-slate-200 bg-slate-100 text-slate-600';
      default:
        return 'border-sky-200 bg-sky-50 text-sky-700';
    }
  }

  formatDateTime(value?: string | null): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(this.isRtl ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  }

  supportCaseStatusLabel(status: string): string {
    const key = status === 'in_review'
      ? 'SUPPORT_ADMIN.CASE_STATUS.REVIEW'
      : status === 'awaiting_customer_evidence'
        ? 'SUPPORT_ADMIN.CASE_STATUS.WAITING_RESPONSE'
        : status === 'approved'
          ? 'SUPPORT_ADMIN.CASE_STATUS.APPROVED'
          : status === 'rejected'
            ? 'SUPPORT_ADMIN.CASE_STATUS.REJECTED'
            : status === 'resolved'
              ? 'SUPPORT_ADMIN.STATUS.RESOLVED'
              : 'SUPPORT_ADMIN.STATUS.OPEN';
    return this.translate.instant(key);
  }

  driverCaseDriverId(driverCase: SupportCaseRow): string | null {
    const match = /^driver-account:(.+)$/i.exec(driverCase.orderDisplayId || '');
    return match?.[1]?.trim() || null;
  }

  driverCaseDriverLabel(driverCase: SupportCaseRow): string {
    const driverId = this.driverCaseDriverId(driverCase);
    if (!driverId) {
      if (driverCase.type === 'driver_report') {
        return driverCase.initiatorRoleLabel
          || driverCase.typeLabel
          || this.translate.instant('SUPPORT_ADMIN.DRIVER_TABLE.UNKNOWN_DRIVER');
      }

      return driverCase.customerName || this.translate.instant('SUPPORT_ADMIN.DRIVER_TABLE.UNKNOWN_DRIVER');
    }

    return driverCase.customerName && driverCase.customerName !== 'Driver account'
      ? driverCase.customerName
      : `${this.translate.instant('SUPPORT_ADMIN.DRIVER_TABLE.DRIVER')} #${this.shortId(driverId)}`;
  }

  driverCaseSummary(driverCase: SupportCaseRow): string {
    return driverCase.customerSummary || driverCase.note || driverCase.driverResponse || driverCase.reason || '';
  }

  get activeTabHintKey(): string {
    switch (this.activeTab) {
      case 'driver':
        return 'SUPPORT_ADMIN.TABS_HINT.DRIVER';
      case 'legacy':
        return 'SUPPORT_ADMIN.TABS_HINT.LEGACY';
      default:
        return 'SUPPORT_ADMIN.TABS_HINT.VENDOR';
    }
  }

  tabBadgeCount(tab: AdminSupportTab): number {
    switch (tab) {
      case 'driver':
        return this.driverTotal;
      case 'legacy':
        return this.legacyTotal;
      default:
        return this.vendorTotal;
    }
  }

  driverCasePrimaryLabel(driverCase: SupportCaseRow): string {
    const orderRef = driverCase.orderDisplayId?.trim();
    if (orderRef && !this.isGuid(orderRef) && !orderRef.startsWith('driver-account:')) {
      return orderRef.startsWith('#') ? orderRef : `#${orderRef}`;
    }

    return driverCase.typeLabel?.trim() || driverCase.reason?.trim() || driverCase.type;
  }

  legacyCasePrimaryLabel(legacyCase: SupportCaseRow): string {
    const orderRef = legacyCase.orderDisplayId?.trim();
    if (orderRef && !this.isGuid(orderRef)) {
      return orderRef.startsWith('#') ? orderRef : `#${orderRef}`;
    }

    return legacyCase.typeLabel?.trim() || this.translate.instant('SUPPORT_ADMIN.LEGACY_TABLE.ORDER');
  }

  private isGuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
  }

  shortId(value: string): string {
    return value?.length > 8 ? value.slice(0, 8) : value;
  }

  trackByTicketId(_index: number, ticket: AdminVendorSupportTicket): string {
    return ticket.id;
  }

  trackBySupportCaseId(_index: number, supportCase: SupportCaseRow): string {
    return supportCase.id;
  }

  trackByLegacyId(_index: number, legacyCase: SupportCaseRow): string {
    return legacyCase.id;
  }

  trackByMessageId(_index: number, message: { id: string }): string {
    return message.id;
  }

  private loadVendorTickets(): void {
    this.isLoadingVendor = true;
    this.supportService.getTickets({
      page: this.vendorPage,
      pageSize: this.pageSize,
      status: this.activeTab === 'vendor' ? this.statusFilter : 'all',
      priority: this.activeTab === 'vendor' ? this.priorityFilter : 'all',
      category: this.activeTab === 'vendor' ? this.categoryFilter : 'all',
      search: this.searchTerm
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
      this.cdr.markForCheck();
        this.vendorTickets = response.items;
        this.vendorTotal = response.total;
        this.isLoadingVendor = false;
      });
  }

  private loadDriverCases(afterLoad?: () => void): void {
    this.isLoadingDriver = true;
    const safePage = Math.max(1, this.driverPage);
    const requestPageSize = Math.max(this.pageSize * safePage, this.pageSize);
    const status = this.activeTab === 'driver' ? this.statusFilter : 'all';
    const priority = this.activeTab === 'driver' ? this.priorityFilter : 'all';

    forkJoin(this.driverSupportCaseTypes.map((type) => this.supportCasesService.getSupportCases(
      1,
      requestPageSize,
      this.searchTerm,
      status,
      priority,
      undefined,
      type
    )))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((responses) => {
      this.cdr.markForCheck();
        const mergedCases = this.sortSupportCases(responses.flatMap((response) => response.items));
        const startIndex = (safePage - 1) * this.pageSize;

        this.driverCases = mergedCases.slice(startIndex, startIndex + this.pageSize);
        this.driverTotal = responses.reduce((total, response) => total + response.totalCount, 0);
        this.isLoadingDriver = false;
        afterLoad?.();
      });
  }

  private sortSupportCases(cases: SupportCaseRow[]): SupportCaseRow[] {
    return [...cases].sort((left, right) => this.caseTimestamp(right) - this.caseTimestamp(left));
  }

  private caseTimestamp(supportCase: SupportCaseRow): number {
    const timestamp = Date.parse(supportCase.createdAt || '');
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  private loadLegacyCases(afterLoad?: () => void): void {
    this.isLoadingLegacy = true;
    this.supportCasesService.getSupportCases(
      this.legacyPage,
      this.pageSize,
      this.searchTerm,
      this.activeTab === 'legacy' ? this.statusFilter : 'all',
      this.activeTab === 'legacy' ? this.priorityFilter : 'all',
      undefined,
      'complaint'
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
      this.cdr.markForCheck();
        this.legacyCases = response.items;
        this.legacyTotal = response.totalCount;
        this.isLoadingLegacy = false;
        afterLoad?.();
      });
  }

  private setSelectedTicket(ticket: AdminVendorSupportTicket, updateQuery: boolean): void {
    this.selectedTicket = ticket;
    this.selectedDriverCase = null;
    this.selectedLegacyCase = null;
    this.replyDraft = updateQuery ? '' : this.replyDraft;
    this.statusDraft = ticket.status;

    if (updateQuery) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: 'vendor', ticketId: ticket.id, driverCaseId: null, legacyCaseId: null },
        queryParamsHandling: 'merge'
      });
    }
  }

  private syncQueryParams(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        tab: this.activeTab,
        search: this.searchTerm.trim() || null,
        ticketId: null,
        driverCaseId: null,
        legacyCaseId: null
      },
      queryParamsHandling: 'merge'
    });
  }

  private showToast(key: string, tone: ToastTone): void {
    this.toastTone = tone;
    this.toastMessage = this.translate.instant(key);
    setTimeout(() => {
      if (this.toastMessage === this.translate.instant(key)) {
        this.toastMessage = '';
      }
    }, 2800);
  }
}
