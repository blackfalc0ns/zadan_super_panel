import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { DetailTabsNavComponent, DetailTabNavItem } from '../../../../../shared/components/ui/detail-tabs-nav/detail-tabs-nav.component';

interface FinanceTab {
  id: string;
  labelKey: string;
  route: string;
  icon: string;
  badge?: number;
  badgeColor?: string;
}

@Component({
  selector: 'app-finances-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, DetailTabsNavComponent],
  template: `
    <div class="flex flex-col min-h-full">

      <!-- Page Header -->
      <div class="bg-white border-b border-slate-200/60 sticky top-0 z-30">
        <div class="px-6 pt-6 pb-0">

          <!-- Title Row -->
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-zadna-primary to-zadna-primaryLight flex items-center justify-center shadow-lg shadow-zadna-primary/25">
                <span class="material-symbols-outlined text-white text-[20px]">account_balance</span>
              </div>
              <div>
                <h1 class="text-lg font-black text-slate-800">{{ 'FINANCES.TITLE' | translate }}</h1>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ 'FINANCES.SUBTITLE' | translate }}</p>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="flex items-center gap-2">
              <a
                [routerLink]="'/finances/overview'"
                class="h-8 px-3 flex items-center gap-1.5 text-[10px] font-black text-slate-600 bg-slate-100 rounded-xl border border-slate-200 hover:bg-slate-200 transition-all"
              >
                <span class="material-symbols-outlined text-[14px]">analytics</span>
                {{ 'FINANCES.TABS.DASHBOARD' | translate }}
              </a>
              <a
                [routerLink]="'/finances/settlements'"
                class="h-8 px-3 flex items-center gap-1.5 text-[10px] font-black text-slate-600 bg-slate-100 rounded-xl border border-slate-200 hover:bg-slate-200 transition-all"
              >
                <span class="material-symbols-outlined text-[14px]">payments</span>
                {{ 'FINANCES.ACTIONS.VIEW_SETTLEMENTS' | translate }}
              </a>
              <a
                [routerLink]="'/finances/refunds'"
                class="h-8 px-3 flex items-center gap-1.5 text-[10px] font-black text-white bg-zadna-primary rounded-xl shadow-sm shadow-zadna-primary/30 hover:bg-zadna-primaryDark transition-all"
              >
                <span class="material-symbols-outlined text-[14px]">undo</span>
                {{ 'FINANCES.ACTIONS.VIEW_REFUNDS' | translate }}
              </a>
            </div>
          </div>

          <!-- Tab Navigation -->
          <app-detail-tabs-nav
            [tabs]="navTabs"
            [activeTab]="activeTabId"
            (tabChange)="onTabSelect($event)">
          </app-detail-tabs-nav>
        </div>
      </div>

      <!-- Page Content -->
      <div class="flex-1 p-6 min-h-0">
        <router-outlet></router-outlet>
      </div>

    </div>
  `,
  styles: [`:host { display: flex; flex-direction: column; height: 100%; }`]
})
export class FinancesShellComponent {
  currentUrl = '';

  tabs: FinanceTab[] = [
    { id: 'overview',     labelKey: 'FINANCES.TABS.DASHBOARD',    route: '/finances/overview',     icon: 'dashboard' },
    { id: 'pricing',      labelKey: 'FINANCES.TABS.PRICING',      route: '/finances/pricing',      icon: 'tune' },
    { id: 'ledger',       labelKey: 'FINANCES.TABS.LEDGER',       route: '/finances/ledger',       icon: 'receipt_long' },
    { id: 'settlements',  labelKey: 'FINANCES.TABS.SETTLEMENTS',  route: '/finances/settlements',  icon: 'payments' },
    { id: 'refunds',      labelKey: 'FINANCES.TABS.REFUNDS',      route: '/finances/refunds',      icon: 'undo', badge: 3, badgeColor: 'bg-orange-500 text-white' },
    { id: 'cod',          labelKey: 'FINANCES.TABS.COD',          route: '/finances/cod',          icon: 'local_atm' },
    { id: 'adjustments',  labelKey: 'FINANCES.TABS.ADJUSTMENTS',  route: '/finances/adjustments',  icon: 'rule' },
    { id: 'audit',        labelKey: 'FINANCES.TABS.AUDIT',        route: '/finances/audit',        icon: 'history' },
  ];

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.currentUrl = e.urlAfterRedirects || e.url;
    });
  }

  get activeTabId(): string {
    return this.tabs.find((tab) => this.isActiveTab(tab))?.id ?? 'overview';
  }

  get navTabs(): DetailTabNavItem[] {
    return this.tabs.map((tab) => ({
      id: tab.id,
      labelKey: tab.labelKey,
      icon: tab.icon,
      count: tab.badge,
      route: tab.route
    }));
  }

  isActiveTab(tab: FinanceTab): boolean {
    return this.currentUrl.includes(tab.route);
  }

  onTabSelect(_: string): void {}
}

