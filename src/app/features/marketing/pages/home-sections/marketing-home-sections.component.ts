import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Category } from '@catalog/models/catalog.domain.models';
import { CatalogService } from '@catalog/services/catalog.api.service';
import {
  HomeSectionThemeOption,
  MarketingCategoryOption,
  MarketingHomeSection,
  MarketingHomeSectionPayload,
  MarketingHomeSectionUpdatePayload
} from '@marketing/models/marketing.models';
import { MarketingApiService } from '@marketing/services/marketing.api.service';
import { describeApiError, formatDateRange, formatDateTime } from '@marketing/utils/marketing-date.utils';
import { HomeSectionFormModalComponent } from '@marketing/components/home-section-form-modal/home-section-form-modal.component';
import { DeleteConfirmationModalComponent } from '@shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { AppButtonComponent } from '@shared/components/ui/button/button.component';
import { DataTableComponent, TableColumn } from '@shared/components/ui/data-table/data-table.component';
import { AppInputComponent } from '@shared/components/ui/form-controls/input/input.component';
import { StatusPillComponent } from '@shared/components/ui/status-pill/status-pill.component';
import { ToastService } from '@shared/services/toast.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-marketing-home-sections',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AppButtonComponent,
    AppInputComponent,
    StatusPillComponent,
    DeleteConfirmationModalComponent,
    HomeSectionFormModalComponent,
    DataTableComponent
  ],
  template: `
    <div class="space-y-6">
      
      <!-- Action Bar -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="max-w-[24rem] w-full">
          <app-input
            [(ngModel)]="searchTerm"
            [placeholder]="'بحث في أقسام الرئيسية...'"
            dir="rtl"
            [hasIcon]="true"
            [inputClass]="'!bg-transparent !border-0 !ring-0 !text-slate-900 !placeholder-slate-400'"
            [customClass]="'bg-white/70 backdrop-blur-xl border border-slate-200/60 focus-within:bg-white focus-within:border-zadna-primary/50 focus-within:shadow-[0_8px_30px_-5px_rgba(18,124,140,0.15)] hover:bg-white/80 transition-all shadow-sm rounded-2xl overflow-hidden'">
            <span icon class="material-symbols-outlined text-slate-400 text-[20px]">search</span>
          </app-input>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="loadData()"
            [disabled]="loading"
            class="h-11 px-4 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-bold flex items-center gap-2 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
            <span class="material-symbols-outlined text-[18px]" [class.animate-spin]="loading">refresh</span>
            تحديث
          </button>

          <button
            type="button"
            (click)="openCreate()"
            [disabled]="!categoryOptions.length"
            class="h-11 px-5 rounded-2xl bg-zadna-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-zadna-primary/90 hover:shadow-lg hover:shadow-zadna-primary/20 disabled:opacity-50 disabled:hover:shadow-none transition-all">
            <span class="material-symbols-outlined text-[18px]">add</span>
            إضافة قسم جديد
          </button>
        </div>
      </div>

      <div *ngIf="error" class="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
        {{ error }}
      </div>

      <div *ngIf="!loading && !categoryOptions.length && !sections.length && !error" class="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
        يجب إضافة أقسام (Categories) للمتجر أولاً لتتمكن من إنشاء أقسام للرئيسية.
      </div>

      <!-- Data Table -->
      <app-data-table
        [data]="filteredSections"
        [columns]="tableColumns"
        [isLoading]="loading"
        [emptyStateTitle]="'لا توجد أقسام للصفحة الرئيسية'"
        [emptyStateMessage]="'لم تقم بإضافة أي قسم ليظهر في الصفحة الرئيسية للتطبيق.'"
        [containerClass]="'bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/70 shadow-sm'">

          <ng-template #customColumn let-section let-column="column">
            <ng-container *ngIf="column.key === 'categoryNameEn'">
              <div class="flex items-center gap-3 text-start">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.1rem] bg-zadna-primary/10 text-zadna-primary border border-zadna-primary/10 shadow-sm">
                  <span class="material-symbols-outlined text-[20px]">grid_view</span>
                </div>
                <div class="min-w-0">
                  <div class="truncate text-[13px] font-black text-slate-900">
                    {{ section.categoryNameAr }}
                  </div>
                  <div class="mt-1 truncate text-[11px] font-bold text-slate-400">
                    {{ section.categoryNameEn }}
                  </div>
                </div>
              </div>
            </ng-container>

            <ng-container *ngIf="column.key === 'theme'">
              <span class="rounded-xl bg-zadna-primary/10 px-3 py-1.5 text-xs font-black text-zadna-primary border border-zadna-primary/20">
                {{ getThemeLabel(section) }}
              </span>
            </ng-container>

            <ng-container *ngIf="column.key === 'displayOrder'">
              <span class="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                {{ section.displayOrder }}
              </span>
            </ng-container>

            <ng-container *ngIf="column.key === 'productsTake'">
              <span class="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                {{ section.productsTake }} منتجات
              </span>
            </ng-container>

            <ng-container *ngIf="column.key === 'schedule'">
              <div class="flex items-center gap-2">
                 <span class="material-symbols-outlined text-[14px] text-slate-400">calendar_month</span>
                 <span class="text-[11px] font-bold text-slate-600" dir="ltr">
                   {{ formatDateRangeLabel(section) }}
                 </span>
              </div>
            </ng-container>

            <ng-container *ngIf="column.key === 'isActive'">
              <div class="flex justify-start">
                <app-status-pill
                  [label]="section.isActive ? 'نشط' : 'غير نشط'"
                  [variant]="section.isActive ? 'success' : 'neutral'"
                  size="sm">
                </app-status-pill>
              </div>
            </ng-container>

            <ng-container *ngIf="column.key === 'actions'">
              <div class="flex justify-end gap-1.5" (click)="$event.stopPropagation()">
                <button
                  type="button"
                  class="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-zadna-primary/10 hover:text-zadna-primary transition-colors"
                  (click)="openEdit(section.id)"
                  title="تعديل">
                  <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>

                <button
                  type="button"
                  class="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  [ngClass]="section.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'"
                  (click)="toggleStatus(section)"
                  [title]="section.isActive ? 'إيقاف' : 'تفعيل'">
                  <span class="material-symbols-outlined text-[18px]">
                    {{ section.isActive ? 'pause' : 'play_arrow' }}
                  </span>
                </button>

                <button
                  type="button"
                  class="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                  (click)="promptDelete(section)"
                  title="حذف">
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </ng-container>
          </ng-template>
      </app-data-table>
    </div>

    <app-home-section-form-modal [isOpen]="isModalOpen" [isSaving]="saving" [section]="selectedSection" [categoryOptions]="categoryOptions" [themeOptions]="themeOptions" (close)="closeModal()" (save)="saveSection($event)"></app-home-section-form-modal>

    <app-delete-confirmation-modal
      [isOpen]="deleteTarget !== null"
      [isLoading]="deleting"
      [title]="'حذف قسم الرئيسية'"
      [message]="'هل أنت متأكد من رغبتك في إزالة هذا القسم من الصفحة الرئيسية للتطبيق؟ لا يمكن التراجع عن هذا الإجراء.'"
      (close)="deleteTarget = null"
      (confirm)="confirmDelete()">
    </app-delete-confirmation-modal>
  `
})
export class MarketingHomeSectionsComponent implements OnInit {
  sections: MarketingHomeSection[] = [];
  categoryOptions: MarketingCategoryOption[] = [];
  themeOptions: HomeSectionThemeOption[] = [];
  loading = false;
  saving = false;
  deleting = false;
  error = '';
  searchTerm = '';
  isModalOpen = false;
  selectedSection: MarketingHomeSection | null = null;
  deleteTarget: MarketingHomeSection | null = null;

  readonly tableColumns: TableColumn[] = [
    { key: 'categoryNameEn', title: 'التصنيف المعروض', type: 'custom', width: '20rem', align: 'left' },
    { key: 'theme', title: 'نمط العرض', type: 'custom', width: '10rem', align: 'center' },
    { key: 'productsTake', title: 'عدد المنتجات', type: 'custom', width: '8rem', align: 'center' },
    { key: 'displayOrder', title: 'الترتيب', type: 'custom', width: '6rem', align: 'center' },
    { key: 'schedule', title: 'تاريخ العرض', type: 'custom', width: '13rem', align: 'left' },
    { key: 'isActive', title: 'الحالة', type: 'custom', width: '7rem', align: 'left' },
    { key: 'actions', title: 'إجراءات', type: 'custom', width: '10rem', align: 'right' }
  ];

  constructor(
    private readonly marketingApi: MarketingApiService,
    private readonly catalogService: CatalogService,
    private readonly toastService: ToastService,
    readonly translateService: TranslateService
  ) {}

  get filteredSections(): MarketingHomeSection[] {
    const query = this.searchTerm.trim().toLocaleLowerCase();
    if (!query) {
      return this.sections;
    }

    return this.sections.filter((section) =>
      [section.categoryNameAr, section.categoryNameEn, section.theme]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLocaleLowerCase().includes(query))
    );
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      sections: this.marketingApi.getHomeSections(),
      categories: this.catalogService.getCategories(undefined, true),
      themes: this.marketingApi.getHomeSectionThemes()
    }).subscribe({
      next: ({ sections, categories, themes }) => {
        this.sections = [...sections].sort(
          (left, right) => left.displayOrder - right.displayOrder || right.updatedAtUtc.localeCompare(left.updatedAtUtc)
        );
        this.themeOptions = themes;
        this.categoryOptions = flattenLevelThreeCategories(categories)
          .map((category) => ({
            id: category.id,
            nameAr: category.nameAr,
            nameEn: category.nameEn,
            level: category.level ?? 0,
            pathLabel: buildCategoryPath(category)
          }))
          .sort((left, right) => left.pathLabel.localeCompare(right.pathLabel));
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = describeApiError(error);
      }
    });
  }

  openCreate(): void {
    this.selectedSection = null;
    this.isModalOpen = true;
  }

  openEdit(id: string): void {
    this.saving = true;
    this.marketingApi.getHomeSectionById(id).subscribe({
      next: (section) => {
        this.selectedSection = section;
        this.isModalOpen = true;
        this.saving = false;
      },
      error: (error) => {
        this.saving = false;
        this.toastService.error(describeApiError(error), 'أقسام الرئيسية');
      }
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedSection = null;
  }

  saveSection(payload: MarketingHomeSectionUpdatePayload): void {
    this.saving = true;

    const request$ = this.selectedSection
      ? this.marketingApi.updateHomeSection(this.selectedSection.id, payload)
      : this.marketingApi.createHomeSection(toCreatePayload(payload));

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadData();
        this.toastService.success(
          this.selectedSection ? 'تم تحديث القسم' : 'تم إضافة القسم بنجاح',
          'التسويق'
        );
      },
      error: (error) => {
        this.saving = false;
        this.toastService.error(describeApiError(error), 'أقسام الرئيسية');
      }
    });
  }

  toggleStatus(section: MarketingHomeSection): void {
    const request$ = section.isActive ? this.marketingApi.deactivateHomeSection(section.id) : this.marketingApi.activateHomeSection(section.id);

    request$.subscribe({
      next: () => {
        this.toastService.success(
          section.isActive ? 'تم إيقاف عرض القسم' : 'تم تفعيل عرض القسم',
          'التسويق'
        );
        this.loadData();
      },
      error: (error) => this.toastService.error(describeApiError(error), 'أقسام الرئيسية')
    });
  }

  promptDelete(section: MarketingHomeSection): void {
    this.deleteTarget = section;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) {
      return;
    }

    this.deleting = true;
    this.marketingApi.deleteHomeSection(this.deleteTarget.id).subscribe({
      next: () => {
        this.deleting = false;
        this.deleteTarget = null;
        this.toastService.success('تم حذف القسم بنجاح', 'التسويق');
        this.loadData();
      },
      error: (error) => {
        this.deleting = false;
        this.toastService.error(describeApiError(error), 'أقسام الرئيسية');
      }
    });
  }

  formatDateRangeLabel(section: MarketingHomeSection): string {
    return formatDateRange(section.startsAtUtc, section.endsAtUtc);
  }

  getThemeLabel(section: MarketingHomeSection): string {
    return this.translateService.currentLang === 'ar' ? section.themeLabelAr : section.themeLabelEn;
  }

  formatDateTimeLabel(value: string): string {
    return formatDateTime(value);
  }
}

function toCreatePayload(payload: MarketingHomeSectionUpdatePayload): MarketingHomeSectionPayload {
  const { isActive: _, ...createPayload } = payload;
  return createPayload;
}

function flattenLevelThreeCategories(categories: Category[]): Category[] {
  const flattened = flattenCategories(categories);
  return flattened.filter((category) => (category.level ?? 0) === 3);
}

function flattenCategories(categories: Category[]): Category[] {
  return categories.flatMap((category) => [category, ...flattenCategories(category.subCategories ?? [])]);
}

function buildCategoryPath(category: Category): string {
  const parents = [category.parentNameEn, category.nameEn].filter(Boolean).join(' / ');
  const arabic = [category.parentNameAr, category.nameAr].filter(Boolean).join(' / ');
  return arabic ? `${parents} | ${arabic}` : parents;
}
