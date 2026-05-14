import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HomeContentSectionSetting, HomeContentSectionType } from '@marketing/models/marketing.models';
import { MarketingApiService } from '@marketing/services/marketing.api.service';
import { describeApiError, humanizeSectionType } from '@marketing/utils/marketing-date.utils';
import { AppButtonComponent } from '@shared/components/ui/button/button.component';
import { AppInputComponent } from '@shared/components/ui/form-controls/input/input.component';
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
    AppButtonComponent,
    AppInputComponent,
  ],
  template: `
    <div class="space-y-6">

      <!-- Action Bar -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="max-w-[24rem] w-full">
          <app-input
            [(ngModel)]="searchTerm"
            [placeholder]="'MARKETING.VISIBILITY.SEARCH_PLACEHOLDER' | translate"
            [hasIcon]="true"
            [inputClass]="'!bg-transparent !border-0 !ring-0 !text-slate-900 !placeholder-slate-400'"
            [customClass]="'bg-white/70 backdrop-blur-xl border border-slate-200/60 focus-within:bg-white focus-within:border-zadna-primary/50 focus-within:shadow-[0_8px_30px_-5px_rgba(18,124,140,0.15)] hover:bg-white/80 transition-all shadow-sm rounded-2xl overflow-hidden'">
            <span icon class="material-symbols-outlined text-slate-400 text-[20px]">search</span>
          </app-input>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="loadSettings()"
            [disabled]="loading"
            class="h-11 px-4 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-bold flex items-center gap-2 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
            <span class="material-symbols-outlined text-[18px]" [class.animate-spin]="loading">refresh</span>
            {{ 'MARKETING.ACTIONS.REFRESH' | translate }}
          </button>
        </div>
      </div>

      <div *ngIf="error" class="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
        {{ error }}
      </div>

      <div *ngIf="!loading && !filteredSettings.length" class="rounded-[2rem] border border-slate-200/70 bg-white/80 p-12 text-center shadow-sm">
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-100 text-slate-300">
          <span class="material-symbols-outlined text-[34px]">visibility_off</span>
        </div>
        <h3 class="mt-5 text-xl font-black text-slate-900">{{ 'MARKETING.VISIBILITY.MESSAGES.EMPTY_TITLE' | translate }}</h3>
        <p class="mt-2 text-sm font-bold text-slate-400">{{ 'MARKETING.VISIBILITY.DESCRIPTION' | translate }}</p>
      </div>

      <!-- Settings List View -->
      <div *ngIf="filteredSettings.length" class="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        
        <div class="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest">
          <div class="col-span-8 md:col-span-6">{{ 'MARKETING.VISIBILITY.TABLE.SECTION' | translate }}</div>
          <div class="hidden md:block md:col-span-3 text-center">{{ 'MARKETING.VISIBILITY.TABLE.API_KEY' | translate }}</div>
          <div class="col-span-4 md:col-span-3 text-end">{{ 'MARKETING.VISIBILITY.TABLE.STATUS' | translate }}</div>
        </div>

        <div class="divide-y divide-slate-100">
          <div
            *ngFor="let setting of filteredSettings"
            class="group grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors relative">
            
            <div *ngIf="pendingSection === setting.sectionType && saving" class="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div class="h-6 w-6 animate-spin rounded-full border-2 border-zadna-primary border-t-transparent"></div>
            </div>

            <!-- Section Info -->
            <div class="col-span-8 md:col-span-6 flex items-center gap-4">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zadna-primary/10 text-zadna-primary border border-zadna-primary/10 group-hover:scale-105 transition-transform duration-300">
                <span class="material-symbols-outlined text-[24px]">{{ getSectionIcon(setting.sectionType) }}</span>
              </div>
              <div class="min-w-0">
                <h3 class="text-[15px] font-black text-slate-900">
                  {{ 'MARKETING.SECTION_TYPES.' + setting.sectionType | translate }}
                </h3>
                <p class="text-[12px] font-bold text-slate-500 mt-0.5 truncate max-w-[200px] sm:max-w-[300px]">
                  {{ 'MARKETING.VISIBILITY.CARD_DESCRIPTION' | translate }}
                </p>
              </div>
            </div>

            <!-- API Key (Hidden on small screens) -->
            <div class="hidden md:flex md:col-span-3 justify-center">
              <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600 tracking-wider font-mono" dir="ltr">
                {{ setting.sectionType }}
              </span>
            </div>

            <!-- Toggle Switch -->
            <div class="col-span-4 md:col-span-3 flex justify-end items-center gap-3">
              <span class="hidden sm:inline-block text-xs font-bold" [ngClass]="setting.isEnabled ? 'text-emerald-600' : 'text-slate-400'">
                {{ (setting.isEnabled ? 'MARKETING.VISIBILITY.ENABLED' : 'MARKETING.VISIBILITY.DISABLED') | translate }}
              </span>
              
              <div class="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                <input 
                  type="checkbox" 
                  [checked]="setting.isEnabled"
                  (change)="toggleSetting(setting)"
                  class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-slate-300 appearance-none cursor-pointer transition-all duration-300 checked:right-0 checked:border-zadna-primary focus:outline-none focus:ring-0 focus:ring-offset-0 shadow-sm" 
                  style="right: 1.5rem;" 
                  [style.right]="setting.isEnabled ? '0' : '1.5rem'" 
                  [style.borderColor]="setting.isEnabled ? '#127c8c' : '#cbd5e1'"/>
                <label class="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer transition-colors duration-300" [style.backgroundColor]="setting.isEnabled ? '#77cdd8' : '#cbd5e1'"></label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  `,
  styles: [`
    .toggle-checkbox:checked { right: 0; border-color: #127c8c; }
    .toggle-label { background-color: #cbd5e1; }
    .toggle-checkbox:checked + .toggle-label { background-color: #77cdd8; }
  `]
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
    if (this.saving) return; // Prevent double clicks
    
    const request$ = setting.isEnabled
      ? this.marketingApi.deactivateSectionVisibility(setting.sectionType)
      : this.marketingApi.activateSectionVisibility(setting.sectionType);

    this.pendingSection = setting.sectionType;
    this.saving = true;

    request$.subscribe({
      next: () => {
        this.finishMutation(
          setting.isEnabled 
            ? this.translateService.instant('MARKETING.VISIBILITY.MESSAGES.DEACTIVATED') 
            : this.translateService.instant('MARKETING.VISIBILITY.MESSAGES.ACTIVATED')
        );
      },
      error: (error) => {
        this.saving = false;
        this.pendingSection = null;
        this.toastService.error(describeApiError(error), this.translateService.instant('MARKETING.TABS.HOME_VISIBILITY'));
      }
    });
  }

  toTitle(sectionType: string): string {
    return this.translateService.instant('MARKETING.SECTION_TYPES.' + sectionType);
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

  private finishMutation(message: string): void {
    this.saving = false;
    this.pendingSection = null;
    this.toastService.success(message, this.translateService.instant('MARKETING.SHELL.TITLE'));
    this.loadSettings();
  }
}
