import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { DetailTabNavItem, DetailTabsNavComponent } from '@shared/components/ui/detail-tabs-nav/detail-tabs-nav.component';
import { ExportService } from '@shared/utils/export';
import { ToastService } from '@shared/services/toast.service';
import { FinanceService } from '../../../services/finance.service';

interface FinanceRouteItem {
 id: string;
 label: string;
 route: string;
 summary: string;
 dataMode: 'مفعل' | 'قيد التطوير';
 emphasis?: 'danger' | 'warning' | 'neutral';
}

interface FinanceGroup {
 id: string;
 label: string;
 icon: string;
 routes: FinanceRouteItem[];
}

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-finances-shell',
 standalone: true,
 imports: [CommonModule, RouterModule, TranslateModule, DetailTabsNavComponent],
 template: `
 <div class="finance-shell min-h-screen bg-slate-50/50">
 
 <!-- Top Global Header -->
 <div class="bg-white border-b border-slate-200 shadow-sm relative z-20">
 <div class="mx-auto flex w-full max-w-[1680px] flex-col px-4 sm:px-6 lg:px-8">
 
 <!-- Header Content -->
 <div class="flex flex-wrap items-center justify-between gap-4 py-6">
 <div class="flex items-center gap-4">
 <div class="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-md">
 <span class="material-symbols-outlined text-white text-[24px]">account_balance</span>
 </div>
 <div>
 <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ 'FINANCES.SHELL.TITLE' | translate }}</h1>
 <div class="flex items-center gap-2 mt-1">
 <span class="text-[12px] font-bold text-slate-500">{{ 'FINANCES.SHELL.SUBTITLE' | translate }}</span>
 <div class="h-1 w-1 rounded-full bg-slate-300"></div>
 <div class="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 border border-emerald-100">
 <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
 <span class="text-[10px] font-black uppercase tracking-widest">{{ 'FINANCES.SHELL.CONNECTED' | translate }}</span>
 </div>
 </div>
 </div>
 </div>
 
 <div class="flex items-center gap-3">
 <button type="button" (click)="onExportReports()" class="h-10 px-4 rounded-xl bg-slate-100 text-[13px] font-bold text-slate-700 hover:bg-slate-200 transition-all border border-slate-200/50 flex items-center gap-2">
 <span class="material-symbols-outlined text-[18px]">download</span>
 {{ 'FINANCES.SHELL.EXPORT_REPORTS' | translate }}
 </button>
 </div>
 </div>

 <!-- Main Navigation Groups -->
 <div class="-mb-px pt-2">
 <app-detail-tabs-nav
 [tabs]="mainNavTabs"
 [activeTab]="activeGroupId()"
 (tabChange)="onMainGroupChange($event)">
 </app-detail-tabs-nav>
 </div>

 </div>
 </div>

 <!-- Secondary Sub-Navigation (Only visible if the active group has multiple routes) -->
 <div *ngIf="activeGroupRoutes().length > 1" class="bg-white/80 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-10">
 <div class="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-8 py-3 flex gap-2 overflow-x-auto scroll-smooth">
 <button *ngFor="let route of activeGroupRoutes()"
 (click)="navigate(route.route)"
 class="px-4 py-2 rounded-lg text-[12px] font-black transition-all whitespace-nowrap flex items-center gap-2"
 [ngClass]="activeRouteId() === route.id ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'">
 {{ route.label | translate }}
 <span *ngIf="route.emphasis === 'warning'" class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
 <span *ngIf="route.emphasis === 'danger'" class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
 <span *ngIf="route.dataMode === 'قيد التطوير'" class="bg-white/20 text-slate-300 px-1.5 py-0.5 rounded text-[9px] mr-1">{{ 'FINANCES.SHELL.COMING_SOON' | translate }}</span>
 </button>
 </div>
 </div>

 <!-- Main Content Area -->
 <main class="mx-auto w-full max-w-[1680px] p-4 sm:p-6 lg:p-8">
 
 <div class="mb-5 flex flex-wrap items-center gap-2" *ngIf="activeGroupRoutes().length > 1">
 <h2 class="text-xl font-black text-slate-800">{{ activeRoute().label | translate }}</h2>
 <div class="h-4 w-px bg-slate-300 mx-2"></div>
 <p class="text-[12px] font-medium text-slate-500">{{ activeRoute().summary | translate }}</p>
 </div>

 <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
 <router-outlet></router-outlet>
 </div>
 </main>

 </div>
 `,
 styles: [`
 :host {
 display: block;
 width: 100%;
 }
 `]
})
export class FinancesShellComponent {
 private readonly cdr = inject(ChangeDetectorRef);
 private readonly router = inject(Router);
 private readonly destroyRef = inject(DestroyRef);
 private readonly translate = inject(TranslateService);
 private readonly exportService = inject(ExportService);
 private readonly toastService = inject(ToastService);
 private readonly financeService = inject(FinanceService);
 private readonly currentUrl = signal(this.router.url);

 readonly groups: FinanceGroup[] = [
 {
 id: 'dashboard',
 label: 'FINANCES.SHELL.GROUPS.DASHBOARD',
 icon: 'space_dashboard',
 routes: [
 { id: 'overview', label: 'FINANCES.SHELL.ROUTES.OVERVIEW.LABEL', route: '/finances/overview', summary: 'FINANCES.SHELL.ROUTES.OVERVIEW.SUMMARY', dataMode: 'مفعل' }
 ]
 },
 {
 id: 'accounts',
 label: 'FINANCES.SHELL.GROUPS.ACCOUNTS',
 icon: 'account_balance_wallet',
 routes: [
 { id: 'wallets', label: 'FINANCES.SHELL.ROUTES.WALLETS.LABEL', route: '/finances/wallets', summary: 'FINANCES.SHELL.ROUTES.WALLETS.SUMMARY', dataMode: 'مفعل' },
 { id: 'ledger', label: 'FINANCES.SHELL.ROUTES.LEDGER.LABEL', route: '/finances/ledger', summary: 'FINANCES.SHELL.ROUTES.LEDGER.SUMMARY', dataMode: 'مفعل' },
 { id: 'adjustments', label: 'FINANCES.SHELL.ROUTES.ADJUSTMENTS.LABEL', route: '/finances/adjustments', summary: 'FINANCES.SHELL.ROUTES.ADJUSTMENTS.SUMMARY', dataMode: 'مفعل' }
 ]
 },
 {
 id: 'operations',
 label: 'FINANCES.SHELL.GROUPS.OPERATIONS',
 icon: 'sync_alt',
 routes: [
 { id: 'settlements', label: 'FINANCES.SHELL.ROUTES.SETTLEMENTS.LABEL', route: '/finances/settlements', summary: 'FINANCES.SHELL.ROUTES.SETTLEMENTS.SUMMARY', dataMode: 'مفعل' },
  { id: 'payout-reconciliation', label: 'FINANCES.SHELL.ROUTES.PAYOUT_RECONCILIATION.LABEL', route: '/finances/payout-reconciliation', summary: 'FINANCES.SHELL.ROUTES.PAYOUT_RECONCILIATION.SUMMARY', dataMode: 'مفعل' },
  { id: 'withdrawals', label: 'FINANCES.SHELL.ROUTES.WITHDRAWALS.LABEL', route: '/finances/withdrawals', summary: 'FINANCES.SHELL.ROUTES.WITHDRAWALS.SUMMARY', dataMode: 'مفعل', emphasis: 'warning' },
 { id: 'cod', label: 'FINANCES.SHELL.ROUTES.COD.LABEL', route: '/finances/cod', summary: 'FINANCES.SHELL.ROUTES.COD.SUMMARY', dataMode: 'مفعل', emphasis: 'warning' },
 { id: 'vendor-cod', label: 'FINANCES.SHELL.ROUTES.VENDOR_COD.LABEL', route: '/finances/vendor-cod', summary: 'FINANCES.SHELL.ROUTES.VENDOR_COD.SUMMARY', dataMode: 'مفعل', emphasis: 'warning' }
 ]
 },
 {
 id: 'disputes',
 label: 'FINANCES.SHELL.GROUPS.DISPUTES',
 icon: 'gavel',
 routes: [
 { id: 'refunds', label: 'FINANCES.SHELL.ROUTES.REFUNDS.LABEL', route: '/finances/refunds', summary: 'FINANCES.SHELL.ROUTES.REFUNDS.SUMMARY', dataMode: 'مفعل', emphasis: 'danger' }
 ]
 },
 {
 id: 'settings',
 label: 'FINANCES.SHELL.GROUPS.SETTINGS',
 icon: 'admin_panel_settings',
 routes: [
 { id: 'platform-account', label: 'FINANCES.PLATFORM_ACCOUNT.NAV_LABEL', route: '/finances/platform-account', summary: 'FINANCES.PLATFORM_ACCOUNT.NAV_SUMMARY', dataMode: 'مفعل' },
 { id: 'pricing', label: 'FINANCES.SHELL.ROUTES.PRICING.LABEL', route: '/finances/pricing', summary: 'FINANCES.SHELL.ROUTES.PRICING.SUMMARY', dataMode: 'مفعل' },
 { id: 'fulfillment', label: 'FINANCES.SHELL.ROUTES.FULFILLMENT.LABEL', route: '/finances/fulfillment', summary: 'FINANCES.SHELL.ROUTES.FULFILLMENT.SUMMARY', dataMode: 'مفعل' },
 { id: 'audit', label: 'FINANCES.SHELL.ROUTES.AUDIT.LABEL', route: '/finances/audit', summary: 'FINANCES.SHELL.ROUTES.AUDIT.SUMMARY', dataMode: 'مفعل' }
 ]
 }
 ];

 readonly activeGroup = computed(() => {
 const url = this.currentUrl();
 for (const group of this.groups) {
 if (group.routes.some(r => url.includes(r.route))) {
 return group;
 }
 }
 return this.groups[0];
 });

 readonly activeGroupId = computed(() => this.activeGroup().id);
 readonly activeGroupRoutes = computed(() => this.activeGroup().routes);

 readonly activeRoute = computed(() => {
 const url = this.currentUrl();
 for (const route of this.activeGroup().routes) {
 if (url.includes(route.route)) {
 return route;
 }
 }
 return this.activeGroup().routes[0];
 });

 readonly activeRouteId = computed(() => this.activeRoute().id);

 get mainNavTabs(): DetailTabNavItem[] {
 return this.groups.map(g => ({
 id: g.id,
 labelKey: g.label,
 icon: g.icon,
 attention: g.routes.some(r => r.emphasis === 'danger' || r.emphasis === 'warning')
 }));
 }

 constructor() {
 this.router.events.pipe(
 filter((event) => event instanceof NavigationEnd),
 takeUntilDestroyed(this.destroyRef)
 ).subscribe((event) => {
 this.cdr.markForCheck();
 const navigation = event as NavigationEnd;
 this.currentUrl.set(navigation.urlAfterRedirects || navigation.url);
 });
 }

 onMainGroupChange(groupId: string): void {
 const group = this.groups.find(g => g.id === groupId);
 if (group && group.routes.length > 0) {
 void this.router.navigateByUrl(group.routes[0].route);
 }
 }

 navigate(route: string): void {
 void this.router.navigateByUrl(route);
 }

 onExportReports(): void {
 const route = this.activeRoute();
 this.financeService.exportFinanceReport(
 this.translate.instant(route.label),
 route.route,
 this.translate.instant(route.summary)
 ).subscribe({
 next: (blob) => {
 this.exportService.downloadServerFile(blob, this.exportService.fileName('finance-report', 'pdf'));
 this.toastService.success(this.translate.instant('COMMON.EXPORT_SUCCESS'));
 },
 error: () => {
 this.toastService.error(this.translate.instant('COMMON.EXPORT_FAILED'));
 }
 });
 }
}
