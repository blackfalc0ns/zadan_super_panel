import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MarketingTabsInlineComponent } from '@marketing/components/marketing-tabs-inline/marketing-tabs-inline.component';
import { HomeContentSectionSetting, HomeContentSectionType } from '@marketing/models/marketing.models';
import { MarketingApiService } from '@marketing/services/marketing.api.service';
import { describeApiError, humanizeSectionType } from '@marketing/utils/marketing-date.utils';
import { AppButtonComponent } from '@shared/components/ui/button/button.component';
import { AppCardComponent } from '@shared/components/ui/card/card.component';
import { AppInputComponent } from '@shared/components/ui/form-controls/input/input.component';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { StatusPillComponent } from '@shared/components/ui/status-pill/status-pill.component';
import { ToastService } from '@shared/services/toast.service';

const SECTION_ORDER: HomeContentSectionType[] = [
  'Banners',
  'Categories',
  'SpecialOffers',
  'Recommended',
  'BestSelling',
  'Brands',
  'FeaturedProducts',
  'ExploreMore',
  'DynamicSections'
];

@Component({
  selector: 'app-marketing-home-visibility',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MarketingTabsInlineComponent,
    AppCardComponent,
    AppButtonComponent,
    AppInputComponent,
    AppPageHeaderComponent,
    StatusPillComponent,
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        [title]="'MARKETING.TABS.HOME_VISIBILITY'"
        [subtitle]="'MARKETING.VISIBILITY.DESCRIPTION'"
        [showToolbar]="true"
        [breadcrumbs]="[
          { label: 'SIDEBAR.HOME', url: '/dashboard' },
          { label: 'SIDEBAR.MARKETING', url: '/marketing/home-visibility' },
          { label: 'MARKETING.TABS.HOME_VISIBILITY' }
        ]">
        <span title-prefix class="material-symbols-outlined text-[28px] text-zadna-primary">visibility</span>

        <div actions class="flex flex-wrap items-center gap-3 animate-in slide-in-from-left-10 duration-700">
          <app-button
            variant="outline"
            size="sm"
            [isLoading]="loading"
            customClass="!rounded-[1.2rem]"
            (btnClick)="loadSettings()">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">refresh</span>
              <span>{{ 'MARKETING.ACTIONS.REFRESH' | translate }}</span>
            </div>
          </app-button>
        </div>
      </app-page-header>

      <div class="grid gap-4 xl:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] xl:items-center">
        <div class="max-w-[34rem]">
          <app-input
            [(ngModel)]="searchTerm"
            [placeholder]="'COMMON.SEARCH'"
            [dir]="translateService.currentLang === 'ar' ? 'rtl' : 'ltr'"
            [hasIcon]="true"
            [inputClass]="'!bg-transparent !border-0 !ring-0 !text-zadna-primary !placeholder-zadna-primary/40'"
            [customClass]="'bg-white/80 backdrop-blur-xl border border-slate-200/60 focus-within:bg-white focus-within:border-zadna-primary/50 focus-within:shadow-[0_8px_30px_-5px_rgba(18,124,140,0.15)] hover:bg-white transition-all shadow-sm rounded-[1.5rem] overflow-hidden'">
            <svg icon class="w-4 h-4 text-zadna-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </app-input>
        </div>

        <app-marketing-tabs-inline></app-marketing-tabs-inline>
      </div>

      <div *ngIf="error" class="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
        {{ error }}
      </div>

      <div *ngIf="!loading && !filteredSettings.length" class="rounded-[2rem] border border-slate-200/70 bg-white/80 p-12 text-center shadow-sm">
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-100 text-slate-300">
          <span class="material-symbols-outlined text-[34px]">visibility_off</span>
        </div>
        <h3 class="mt-5 text-xl font-black text-slate-900">{{ 'COMMON.NO_RESULTS' | translate }}</h3>
        <p class="mt-2 text-sm font-bold text-slate-400">{{ 'MARKETING.VISIBILITY.DESCRIPTION' | translate }}</p>
      </div>

      <div *ngIf="filteredSettings.length" class="grid gap-5 xl:grid-cols-2">
        <app-card
          *ngFor="let setting of filteredSettings"
          rounded="3xl"
          padding="lg"
          [customClass]="getSectionCardClass(setting.sectionType)">
          <div class="space-y-5">
            <div class="flex items-start justify-between gap-4">
              <div class="flex min-w-0 items-start gap-4">
                <div [class]="getSectionIconWrapperClass(setting.sectionType)">
                  <span class="material-symbols-outlined text-[24px]">{{ getSectionIcon(setting.sectionType) }}</span>
                </div>

                <div class="min-w-0">
                  <p class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {{ setting.sectionType }}
                  </p>
                  <h3 class="mt-2 text-xl font-black text-slate-900">
                    {{ toTitle(setting.sectionType) }}
                  </h3>
                  <p class="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500">
                    {{ 'MARKETING.VISIBILITY.CARD_DESCRIPTION' | translate }}
                  </p>
                </div>
              </div>

              <app-status-pill
                [label]="setting.isEnabled ? 'MARKETING.VISIBILITY.ENABLED' : 'MARKETING.VISIBILITY.DISABLED'"
                [variant]="setting.isEnabled ? 'success' : 'neutral'"
                size="sm">
              </app-status-pill>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-[1.5rem] border border-slate-200/70 bg-white/80 px-4 py-3">
                <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  {{ 'COMMON.STATUS' | translate }}
                </p>
                <p class="mt-2 text-sm font-black" [ngClass]="setting.isEnabled ? 'text-emerald-600' : 'text-slate-600'">
                  {{ (setting.isEnabled ? 'MARKETING.VISIBILITY.ENABLED' : 'MARKETING.VISIBILITY.DISABLED') | translate }}
                </p>
              </div>

              <div class="rounded-[1.5rem] border border-slate-200/70 bg-white/80 px-4 py-3">
                <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  API Key
                </p>
                <p class="mt-2 text-sm font-black text-slate-700">
                  {{ setting.sectionType }}
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  <span class="h-2 w-2 rounded-full" [ngClass]="setting.isEnabled ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                  {{ toTitle(setting.sectionType) }}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <app-button
                  [variant]="setting.isEnabled ? 'outline' : 'secondary'"
                  size="sm"
                  [isLoading]="pendingSection === setting.sectionType && saving"
                  customClass="!rounded-[1.1rem]"
                  (btnClick)="toggleSetting(setting)">
                  {{ (setting.isEnabled ? 'MARKETING.ACTIONS.DEACTIVATE' : 'MARKETING.ACTIONS.ACTIVATE') | translate }}
                </app-button>

                <app-button
                  variant="ghost"
                  size="sm"
                  [isLoading]="pendingSection === setting.sectionType && saving"
                  customClass="!rounded-[1.1rem]"
                  (btnClick)="updateSetting(setting, !setting.isEnabled)">
                  {{ 'MARKETING.VISIBILITY.ACTIONS.SAVE_STATE' | translate }}
                </app-button>
              </div>
            </div>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class MarketingHomeVisibilityComponent implements OnInit {
  settings: HomeContentSectionSetting[] = [];
  loading = false;
  saving = false;
  error = '';
  searchTerm = '';
  pendingSection: HomeContentSectionType | null = null;

  constructor(
    private readonly marketingApi: MarketingApiService,
    private readonly toastService: ToastService,
    readonly translateService: TranslateService
  ) {}

  get enabledCount(): number {
    return this.settings.filter((setting) => setting.isEnabled).length;
  }

  get disabledCount(): number {
    return this.settings.length - this.enabledCount;
  }

  get filteredSettings(): HomeContentSectionSetting[] {
    const query = this.searchTerm.trim().toLocaleLowerCase();
    if (!query) {
      return this.settings;
    }

    return this.settings.filter((setting) =>
      [setting.sectionType, this.toTitle(setting.sectionType)]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLocaleLowerCase().includes(query))
    );
  }
  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.error = '';

    this.marketingApi.getHomeContentSectionSettings().subscribe({
      next: (settings) => {
        const ranked = new Map<HomeContentSectionType, number>(SECTION_ORDER.map((value, index) => [value, index]));
        this.settings = [...settings].sort((left, right) => (ranked.get(left.sectionType) ?? 99) - (ranked.get(right.sectionType) ?? 99));
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = describeApiError(error);
      }
    });
  }

  toggleSetting(setting: HomeContentSectionSetting): void {
    const request$ = setting.isEnabled
      ? this.marketingApi.deactivateSectionVisibility(setting.sectionType)
      : this.marketingApi.activateSectionVisibility(setting.sectionType);

    this.pendingSection = setting.sectionType;
    this.saving = true;

    request$.subscribe({
      next: () => {
        this.finishMutation(this.translateService.instant(setting.isEnabled ? 'MARKETING.VISIBILITY.MESSAGES.DEACTIVATED' : 'MARKETING.VISIBILITY.MESSAGES.ACTIVATED'));
      },
      error: (error) => {
        this.saving = false;
        this.pendingSection = null;
        this.toastService.error(describeApiError(error), this.translateService.instant('MARKETING.TABS.HOME_VISIBILITY'));
      }
    });
  }

  updateSetting(setting: HomeContentSectionSetting, isEnabled: boolean): void {
    this.pendingSection = setting.sectionType;
    this.saving = true;

    this.marketingApi.updateSectionVisibility(setting.sectionType, { isEnabled }).subscribe({
      next: () => {
        this.finishMutation(this.translateService.instant('MARKETING.VISIBILITY.MESSAGES.SAVED'));
      },
      error: (error) => {
        this.saving = false;
        this.pendingSection = null;
        this.toastService.error(describeApiError(error), this.translateService.instant('MARKETING.TABS.HOME_VISIBILITY'));
      }
    });
  }

  toTitle(sectionType: string): string {
    const mapped = this.translateService.instant(`MARKETING.SECTION_TYPES.${sectionType}`);
    return mapped === `MARKETING.SECTION_TYPES.${sectionType}` ? humanizeSectionType(sectionType) : mapped;
  }

  getSectionIcon(sectionType: HomeContentSectionType): string {
    const icons: Record<HomeContentSectionType, string> = {
      Banners: 'ad',
      Categories: 'category',
      SpecialOffers: 'local_offer',
      Recommended: 'thumb_up',
      BestSelling: 'workspace_premium',
      Brands: 'storefront',
      FeaturedProducts: 'star',
      ExploreMore: 'travel_explore',
      DynamicSections: 'grid_view'
    };

    return icons[sectionType];
  }

  getSectionCardClass(sectionType: HomeContentSectionType): string {
    const classes: Record<HomeContentSectionType, string> = {
      Banners: 'border border-emerald-200/70 bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(255,255,255,0.92))] shadow-sm',
      Categories: 'border border-sky-200/70 bg-[linear-gradient(135deg,rgba(239,246,255,0.95),rgba(255,255,255,0.92))] shadow-sm',
      SpecialOffers: 'border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.95),rgba(255,255,255,0.92))] shadow-sm',
      Recommended: 'border border-violet-200/70 bg-[linear-gradient(135deg,rgba(245,243,255,0.95),rgba(255,255,255,0.92))] shadow-sm',
      BestSelling: 'border border-orange-200/70 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,255,255,0.92))] shadow-sm',
      Brands: 'border border-cyan-200/70 bg-[linear-gradient(135deg,rgba(236,254,255,0.95),rgba(255,255,255,0.92))] shadow-sm',
      FeaturedProducts: 'border border-pink-200/70 bg-[linear-gradient(135deg,rgba(253,242,248,0.95),rgba(255,255,255,0.92))] shadow-sm',
      ExploreMore: 'border border-indigo-200/70 bg-[linear-gradient(135deg,rgba(238,242,255,0.95),rgba(255,255,255,0.92))] shadow-sm',
      DynamicSections: 'border border-teal-200/70 bg-[linear-gradient(135deg,rgba(240,253,250,0.95),rgba(255,255,255,0.92))] shadow-sm'
    };

    return classes[sectionType];
  }

  getSectionIconWrapperClass(sectionType: HomeContentSectionType): string {
    const classes: Record<HomeContentSectionType, string> = {
      Banners: 'flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] bg-emerald-100 text-emerald-700 shadow-sm',
      Categories: 'flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] bg-sky-100 text-sky-700 shadow-sm',
      SpecialOffers: 'flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] bg-amber-100 text-amber-700 shadow-sm',
      Recommended: 'flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] bg-violet-100 text-violet-700 shadow-sm',
      BestSelling: 'flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] bg-orange-100 text-orange-700 shadow-sm',
      Brands: 'flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] bg-cyan-100 text-cyan-700 shadow-sm',
      FeaturedProducts: 'flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] bg-pink-100 text-pink-700 shadow-sm',
      ExploreMore: 'flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] bg-indigo-100 text-indigo-700 shadow-sm',
      DynamicSections: 'flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] bg-teal-100 text-teal-700 shadow-sm'
    };

    return classes[sectionType];
  }

  private finishMutation(message: string): void {
    this.saving = false;
    this.pendingSection = null;
    this.toastService.success(message, this.translateService.instant('MARKETING.SHELL.TITLE'));
    this.loadSettings();
  }
}
