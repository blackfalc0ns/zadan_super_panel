import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { DetailTabNavItem, DetailTabsNavComponent } from '@shared/components/ui/detail-tabs-nav/detail-tabs-nav.component';

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
  selector: 'app-finances-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, DetailTabsNavComponent],
  template: `
    <div class="finance-shell min-h-screen bg-slate-50/50" dir="rtl">
      
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
                <h1 class="text-2xl font-black text-slate-900 tracking-tight">المالية والحسابات</h1>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[12px] font-bold text-slate-500">الإدارة المركزية للتدفقات النقدية، التسويات، والمحافظ</span>
                  <div class="h-1 w-1 rounded-full bg-slate-300"></div>
                  <div class="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 border border-emerald-100">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="text-[10px] font-black uppercase tracking-widest">متصل بالشبكة</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
               <button class="h-10 px-4 rounded-xl bg-slate-100 text-[13px] font-bold text-slate-700 hover:bg-slate-200 transition-all border border-slate-200/50 flex items-center gap-2">
                 <span class="material-symbols-outlined text-[18px]">download</span>
                 تصدير التقارير
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
             {{ route.label }}
             <span *ngIf="route.emphasis === 'warning'" class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
             <span *ngIf="route.emphasis === 'danger'" class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
             <span *ngIf="route.dataMode === 'قيد التطوير'" class="bg-white/20 text-slate-300 px-1.5 py-0.5 rounded text-[9px] mr-1">قريباً</span>
           </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <main class="mx-auto w-full max-w-[1680px] p-4 sm:p-6 lg:p-8">
         
         <div class="mb-5 flex flex-wrap items-center gap-2" *ngIf="activeGroupRoutes().length > 1">
            <h2 class="text-xl font-black text-slate-800">{{ activeRoute().label }}</h2>
            <div class="h-4 w-px bg-slate-300 mx-2"></div>
            <p class="text-[12px] font-medium text-slate-500">{{ activeRoute().summary }}</p>
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
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly currentUrl = signal(this.router.url);

  readonly groups: FinanceGroup[] = [
    {
      id: 'dashboard',
      label: 'نظرة عامة',
      icon: 'space_dashboard',
      routes: [
        { id: 'overview', label: 'اللوحة الرئيسية', route: '/finances/overview', summary: 'ملخص للإيرادات وحالة العمليات المفتوحة.', dataMode: 'مفعل' }
      ]
    },
    {
      id: 'accounts',
      label: 'المحافظ والسجلات',
      icon: 'account_balance_wallet',
      routes: [
        { id: 'wallets', label: 'أرصدة المحافظ', route: '/finances/wallets', summary: 'إدارة المحافظ الافتراضية للمتاجر والمناديب وتتبع الأرصدة.', dataMode: 'مفعل' },
        { id: 'ledger', label: 'السجل المالي', route: '/finances/ledger', summary: 'سجل تدقيق يوضح جميع الحركات المالية الداخلة والخارجة.', dataMode: 'مفعل' },
        { id: 'adjustments', label: 'تسويات يدوية', route: '/finances/adjustments', summary: 'القيام بإدخالات مالية يدوية وتصحيح الأرصدة.', dataMode: 'قيد التطوير' }
      ]
    },
    {
      id: 'operations',
      label: 'العمليات والتسويات',
      icon: 'sync_alt',
      routes: [
        { id: 'settlements', label: 'التسويات الدورية', route: '/finances/settlements', summary: 'دفع المستحقات المالية الدورية للمتاجر والمناديب.', dataMode: 'مفعل' },
        { id: 'withdrawals', label: 'طلبات السحب', route: '/finances/withdrawals', summary: 'الطلبات المرفوعة من المناديب لسحب أرصدتهم النقدية.', dataMode: 'مفعل', emphasis: 'warning' },
        { id: 'cod', label: 'مطابقة COD', route: '/finances/cod', summary: 'تتبع وتحصيل المبالغ النقدية الدفع عند الاستلام من المناديب.', dataMode: 'مفعل', emphasis: 'warning' }
      ]
    },
    {
      id: 'disputes',
      label: 'المنازعات المالية',
      icon: 'gavel',
      routes: [
        { id: 'refunds', label: 'طلبات التعويض والمرتجعات', route: '/finances/refunds', summary: 'إدارة طلبات التعويض وتحديد الجهة المسؤولة عن الخسارة.', dataMode: 'مفعل', emphasis: 'danger' }
      ]
    },
    {
      id: 'settings',
      label: 'الرسوم والتدقيق',
      icon: 'admin_panel_settings',
      routes: [
        { id: 'pricing', label: 'هيكلة التسعير', route: '/finances/pricing', summary: 'تكوين عمولات المنصة، رسوم التوصيل، ونسب ضريبة القيمة المضافة.', dataMode: 'مفعل' },
        { id: 'audit', label: 'سجل التدقيق', route: '/finances/audit', summary: 'تتبع كافة التغييرات الحساسة التي تمت على النظام المالي.', dataMode: 'قيد التطوير' }
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
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
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
}
