import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { DetailTabNavItem, DetailTabsNavComponent } from '@shared/components/ui/detail-tabs-nav/detail-tabs-nav.component';

interface MarketingRouteItem {
  id: string;
  label: string;
  route: string;
  summary: string;
  icon: string;
}

@Component({
  selector: 'app-marketing-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, DetailTabsNavComponent],
  template: `
    <div class="marketing-shell min-h-screen bg-slate-50/50" dir="rtl">
      
      <!-- Top Global Header -->
      <div class="bg-white border-b border-slate-200 shadow-sm relative z-20">
        <div class="mx-auto flex w-full max-w-[1680px] flex-col px-4 sm:px-6 lg:px-8">
          
          <!-- Header Content -->
          <div class="flex flex-wrap items-center justify-between gap-4 py-6">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-zadna-primary/10 flex items-center justify-center border border-zadna-primary/20 shadow-sm">
                <span class="material-symbols-outlined text-zadna-primary text-[24px]">campaign</span>
              </div>
              <div>
                <h1 class="text-2xl font-black text-slate-900 tracking-tight">إدارة التسويق والواجهة</h1>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[12px] font-bold text-slate-500">مركز التحكم بالبنرات الإعلانية، المنتجات المميزة، وتنسيق الصفحة الرئيسية</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="-mb-px">
            <app-detail-tabs-nav
              [tabs]="navTabs"
              [activeTab]="activeRouteId()"
              (tabChange)="onTabChange($event)">
            </app-detail-tabs-nav>
          </div>

        </div>
      </div>

      <!-- Main Content Area -->
      <main class="mx-auto w-full max-w-[1680px] p-4 sm:p-6 lg:p-8">
         <div class="mb-5 flex flex-wrap items-center gap-2">
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
export class MarketingShellComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly currentUrl = signal(this.router.url);

  readonly routes: MarketingRouteItem[] = [
    { id: 'coupons', label: 'الكوبانات', route: '/marketing/coupons', icon: 'sell', summary: 'إدارة أكواد الخصم وتحديد المتاجر المستفيدة وفترات التفعيل.' },
    { id: 'banners', label: 'البنرات الإعلانية', route: '/marketing/banners', icon: 'ad', summary: 'إدارة العروض الترويجية واللافتات الإعلانية النشطة.' },
    { id: 'featured-products', label: 'المنتجات المميزة', route: '/marketing/featured-products', icon: 'star', summary: 'ترويج منتجات محددة على واجهة التطبيق.' },
    { id: 'home-sections', label: 'أقسام الرئيسية', route: '/marketing/home-sections', icon: 'grid_view', summary: 'التحكم في ترتيب وأقسام الواجهة الرئيسية.' },
    { id: 'home-visibility', label: 'إعدادات الظهور', route: '/marketing/home-visibility', icon: 'visibility', summary: 'تفعيل أو إخفاء عناصر الصفحة الرئيسية.' }
  ];

  readonly activeRoute = computed(() =>
    this.routes.find((route) => this.currentUrl().includes(route.route)) ?? this.routes[0]
  );

  readonly activeRouteId = computed(() => this.activeRoute().id);

  get navTabs(): DetailTabNavItem[] {
    return this.routes.map(r => ({
      id: r.id,
      labelKey: r.label,
      icon: r.icon,
      route: r.route
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

  onTabChange(tabId: string): void {
    const routeItem = this.routes.find(r => r.id === tabId);
    if (routeItem) {
      void this.router.navigateByUrl(routeItem.route);
    }
  }
}
