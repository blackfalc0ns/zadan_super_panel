import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, interval, switchMap } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { AdminBrandBulkOperation, AdminBrandBulkOperationItem, BulkBrandDraft, Category } from '@catalog/models/catalog.domain.models';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';

@Component({
  selector: 'app-bulk-brands-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AppPageHeaderComponent],
  template: `
    <div class="flex min-h-full flex-col overflow-x-hidden bg-slate-50/50">
      <app-page-header
        [title]="'BRANDS.BULK_UPLOAD'"
        [subtitle]="'BRANDS.BULK_UPLOAD_DESC'"
        [showToolbar]="true"
        [breadcrumbs]="[
          { label: 'SIDEBAR.CATALOG', url: '/catalog/categories' },
          { label: 'BRANDS.TITLE', url: '/catalog/brands' },
          { label: 'BRANDS.BULK_UPLOAD' }
        ]">
        <span title-prefix class="material-symbols-outlined text-[28px] text-zadna-primary">brand_family</span>
      </app-page-header>

      <div class="mx-auto flex w-full max-w-[120rem] flex-col overflow-x-hidden px-4 py-6 pb-8 md:px-8" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
        @if (isLoading) {
          <div class="flex min-h-[60vh] items-center justify-center rounded-[28px] border border-slate-200/70 bg-white">
            <div class="flex flex-col items-center gap-4 text-slate-400">
              <div class="h-14 w-14 animate-spin rounded-full border-4 border-zadna-primary/15 border-t-zadna-primary"></div>
              <span class="text-sm font-black">{{ currentLang === 'ar' ? 'جارٍ تحميل البيانات...' : 'Loading data...' }}</span>
            </div>
          </div>
        } @else {
          <div class="flex flex-col gap-4">
            <div class="max-w-full rounded-[24px] border border-slate-200/70 bg-white px-5 py-4 shadow-sm">
              <div class="grid gap-4 2xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
                <div class="rounded-[20px] border border-slate-200 bg-white p-4">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <h3 class="text-xs font-black text-slate-900">{{ currentLang === 'ar' ? 'إجراءات سريعة' : 'Quick actions' }}</h3>
                    <div class="flex flex-wrap gap-2">
                      <button type="button" (click)="addRows(25)" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.72rem] font-black text-slate-700">
                        {{ currentLang === 'ar' ? 'إضافة 25 صف' : 'Add 25 rows' }}
                      </button>
                      <button type="button" (click)="addRows(100)" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.72rem] font-black text-slate-700">
                        {{ currentLang === 'ar' ? 'إضافة 100 صف' : 'Add 100 rows' }}
                      </button>
                      <button type="button" (click)="duplicateSelectedRows()" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.72rem] font-black text-slate-700">
                        {{ currentLang === 'ar' ? 'نسخ المحدد' : 'Duplicate selected' }}
                      </button>
                      <button type="button" (click)="removeSelectedRows()" class="rounded-xl border border-rose-200 px-3 py-1.5 text-[0.72rem] font-black text-rose-600">
                        {{ currentLang === 'ar' ? 'حذف المحدد' : 'Remove selected' }}
                      </button>
                    </div>
                  </div>

                  <div class="mt-4 grid gap-3 xl:grid-cols-[minmax(16rem,1fr)_minmax(12rem,0.7fr)_minmax(12rem,0.7fr)]">
                    <label class="space-y-1">
                      <span class="text-[0.72rem] font-black text-slate-500">{{ currentLang === 'ar' ? 'التصنيف الافتراضي' : 'Default category' }}</span>
                      <select [(ngModel)]="defaults.categoryId" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-bold outline-none focus:border-zadna-primary/40">
                        <option [ngValue]="null">{{ currentLang === 'ar' ? 'بدون' : 'None' }}</option>
                        @for (category of leafCategories; track category.id) {
                          <option [value]="category.id">{{ getCategoryLabel(category) }}</option>
                        }
                      </select>
                    </label>

                    <div class="space-y-1">
                      <span class="text-[0.72rem] font-black text-slate-500">{{ currentLang === 'ar' ? 'اللوجو الافتراضي' : 'Default logo' }}</span>
                      <div class="flex items-center gap-2">
                        <input #defaultLogoInput type="file" accept=".jpg,.jpeg,.png,.webp" class="hidden" (change)="onDefaultsLogoSelected($event)">
                        <button type="button" (click)="defaultLogoInput.click()" [disabled]="isUploadingDefaultLogo" class="rounded-xl border border-slate-200 px-3 py-2 text-[0.72rem] font-black text-slate-700 disabled:opacity-50">
                          {{ currentLang === 'ar' ? 'رفع اللوجو' : 'Upload logo' }}
                        </button>
                      </div>
                      @if (defaults.logoUrl) {
                        <div class="flex items-center gap-2">
                          <img [src]="defaults.logoUrl" alt="Default logo" class="h-10 w-10 rounded-lg border border-slate-200 bg-white object-contain p-1">
                          <button type="button" (click)="defaults.logoUrl = null" class="text-[0.72rem] font-black text-rose-600">
                            {{ currentLang === 'ar' ? 'إزالة' : 'Remove' }}
                          </button>
                        </div>
                      }
                    </div>

                    <div class="space-y-1">
                      <span class="text-[0.72rem] font-black text-slate-500">{{ currentLang === 'ar' ? 'صورة الغلاف الافتراضية' : 'Default cover' }}</span>
                      <div class="flex items-center gap-2">
                        <input #defaultCoverInput type="file" accept=".jpg,.jpeg,.png,.webp" class="hidden" (change)="onDefaultsCoverSelected($event)">
                        <button type="button" (click)="defaultCoverInput.click()" [disabled]="isUploadingDefaultCover" class="rounded-xl border border-slate-200 px-3 py-2 text-[0.72rem] font-black text-slate-700 disabled:opacity-50">
                          {{ currentLang === 'ar' ? 'رفع الغلاف' : 'Upload cover' }}
                        </button>
                      </div>
                      @if (defaults.coverImageUrl) {
                        <div class="flex items-center gap-2">
                          <img [src]="defaults.coverImageUrl" alt="Default cover" class="h-10 w-16 rounded-lg border border-slate-200 bg-white object-cover">
                          <button type="button" (click)="defaults.coverImageUrl = null" class="text-[0.72rem] font-black text-rose-600">
                            {{ currentLang === 'ar' ? 'إزالة' : 'Remove' }}
                          </button>
                        </div>
                      }
                    </div>
                  </div>

                  <div class="mt-4 flex flex-wrap items-center gap-3">
                    <label class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[0.72rem] font-black text-slate-700">
                      <input type="checkbox" [(ngModel)]="defaults.isActive">
                      <span>{{ currentLang === 'ar' ? 'نشط' : 'Active' }}</span>
                    </label>
                    <button type="button" (click)="applyDefaultsToSelected()" class="rounded-xl bg-zadna-primary px-3 py-1.5 text-[0.72rem] font-black text-white shadow-lg shadow-zadna-primary/20">
                      {{ currentLang === 'ar' ? 'تطبيق على المحدد' : 'Apply to selected' }}
                    </button>
                    <button type="button" (click)="applyDefaultsToAll()" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.72rem] font-black text-slate-700">
                      {{ currentLang === 'ar' ? 'تطبيق على الكل' : 'Apply to all' }}
                    </button>
                  </div>
                </div>

                <div class="rounded-[20px] border border-slate-200 bg-white p-4">
                  <h3 class="text-xs font-black text-slate-900">{{ currentLang === 'ar' ? 'ملخص' : 'Summary' }}</h3>
                  <div class="mt-3 grid gap-2.5 sm:grid-cols-2">
                    <div class="rounded-xl bg-slate-50 p-2.5">
                      <div class="text-[0.72rem] font-black text-slate-500">{{ currentLang === 'ar' ? 'الصفوف' : 'Rows' }}</div>
                      <div class="mt-1 text-lg font-black text-slate-900">{{ rows.length }}</div>
                    </div>
                    <div class="rounded-xl bg-slate-50 p-2.5">
                      <div class="text-[0.72rem] font-black text-slate-500">{{ currentLang === 'ar' ? 'المحدد' : 'Selected' }}</div>
                      <div class="mt-1 text-lg font-black text-slate-900">{{ selectedCount }}</div>
                    </div>
                    <div class="rounded-xl bg-emerald-50 p-2.5">
                      <div class="text-[0.72rem] font-black text-emerald-600">{{ currentLang === 'ar' ? 'جاهزة للإرسال' : 'Ready to submit' }}</div>
                      <div class="mt-1 text-lg font-black text-emerald-700">{{ submittableRows.length }}</div>
                    </div>
                    <div class="rounded-xl bg-rose-50 p-2.5">
                      <div class="text-[0.72rem] font-black text-rose-600">{{ currentLang === 'ar' ? 'بها أخطاء' : 'With errors' }}</div>
                      <div class="mt-1 text-lg font-black text-rose-700">{{ invalidRowsCount }}</div>
                    </div>
                  </div>

                  @if (isSubmitting || stage === 'done') {
                    <div class="mt-4 rounded-2xl bg-slate-50 p-4">
                      <div class="text-sm font-black text-slate-900">{{ operation?.status || 'Processing' }}</div>
                      <div class="mt-2 text-xs font-bold text-slate-500">{{ processedRows }} / {{ submittedRowIds.length }}</div>
                      <div class="mt-1 text-xs font-bold text-emerald-600">{{ currentLang === 'ar' ? 'نجح' : 'Succeeded' }}: {{ succeededRows }}</div>
                      <div class="text-xs font-bold text-rose-600">{{ currentLang === 'ar' ? 'فشل' : 'Failed' }}: {{ failedRows }}</div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <div class="max-w-full overflow-x-auto overflow-y-hidden rounded-[24px] border border-slate-200/70 bg-white px-4 py-4 shadow-sm md:px-5">
              <table class="min-w-[1480px] w-full table-fixed border-separate border-spacing-x-2 border-spacing-y-0">
                <thead>
                  <tr class="border-b border-slate-100 text-[0.62rem] uppercase tracking-[0.1em] text-slate-400">
                    <th class="w-10 px-1 pb-3 text-start"><input type="checkbox" [checked]="allRowsSelected" (change)="toggleAllRows($any($event.target).checked)"></th>
                    <th class="w-10 px-1 pb-3 text-start">#</th>
                    <th class="w-44 px-2 pb-3 text-start">{{ currentLang === 'ar' ? 'الاسم عربي' : 'Arabic name' }}</th>
                    <th class="w-44 px-2 pb-3 text-start">{{ currentLang === 'ar' ? 'الاسم إنجليزي' : 'English name' }}</th>
                    <th class="w-40 px-2 pb-3 text-start">{{ currentLang === 'ar' ? 'التصنيف' : 'Category' }}</th>
                    <th class="w-48 px-2 pb-3 text-start">{{ currentLang === 'ar' ? 'اللوجو' : 'Logo' }}</th>
                    <th class="w-52 px-2 pb-3 text-start">{{ currentLang === 'ar' ? 'الغلاف' : 'Cover' }}</th>
                    <th class="w-24 px-2 pb-3 text-start">{{ currentLang === 'ar' ? 'الحالة' : 'Status' }}</th>
                    @if (stage === 'done') {
                      <th class="w-44 px-2 pb-3 text-start">{{ currentLang === 'ar' ? 'النتيجة' : 'Result' }}</th>
                    }
                    <th class="w-24 px-2 pb-3 text-end">{{ currentLang === 'ar' ? 'إجراء' : 'Action' }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  @for (row of pagedRows; track row.rowId; let visibleIndex = $index) {
                    <tr class="align-top">
                      <td class="py-2.5"><input type="checkbox" [(ngModel)]="row.selected"></td>
                      <td class="py-2.5 text-xs font-black text-slate-500">{{ ((currentPage - 1) * pageSize) + visibleIndex + 1 }}</td>
                      <td class="py-2.5">
                        <div class="space-y-1">
                          <input [(ngModel)]="row.nameAr" type="text" [disabled]="isSubmitting" class="h-10 w-full rounded-lg border border-slate-200 px-2.5 text-xs font-bold">
                          @if (getRowError(row)) {
                            <div class="text-[0.68rem] font-bold leading-4 text-rose-600">{{ getRowError(row) }}</div>
                          }
                        </div>
                      </td>
                      <td class="py-2.5">
                        <input [(ngModel)]="row.nameEn" type="text" [disabled]="isSubmitting" class="h-10 w-full rounded-lg border border-slate-200 px-2.5 text-xs font-bold">
                      </td>
                      <td class="py-2.5">
                        <select [(ngModel)]="row.categoryId" [disabled]="isSubmitting" class="h-10 w-full rounded-lg border border-slate-200 px-2.5 text-[0.7rem] font-bold">
                          <option [ngValue]="null">{{ currentLang === 'ar' ? 'اختر التصنيف' : 'Select category' }}</option>
                          @for (category of leafCategories; track category.id) {
                            <option [value]="category.id">{{ getCategoryLabel(category) }}</option>
                          }
                        </select>
                      </td>
                      <td class="py-2.5">
                        <div class="space-y-2">
                          <div class="flex items-center gap-2">
                            <input #rowLogoInput type="file" accept=".jpg,.jpeg,.png,.webp" class="hidden" (change)="onRowLogoSelected(row, $event)">
                            <button type="button" (click)="rowLogoInput.click()" [disabled]="isSubmitting || uploadingRowIds.has(row.rowId)" class="rounded-lg border border-slate-200 px-2.5 py-2 text-[0.68rem] font-black text-slate-600 disabled:opacity-50">
                              {{ currentLang === 'ar' ? 'رفع اللوجو' : 'Upload logo' }}
                            </button>
                          </div>
                          @if (row.logoUrl) {
                            <div class="flex items-center gap-2">
                              <img [src]="row.logoUrl" alt="Brand logo" class="h-10 w-10 rounded-lg border border-slate-200 bg-white object-contain p-1">
                              <button type="button" (click)="row.logoUrl = null" [disabled]="isSubmitting" class="text-[0.68rem] font-black text-rose-600">
                                {{ currentLang === 'ar' ? 'إزالة' : 'Remove' }}
                              </button>
                            </div>
                          }
                        </div>
                      </td>
                      <td class="py-2.5">
                        <div class="space-y-2">
                          <div class="flex items-center gap-2">
                            <input #rowCoverInput type="file" accept=".jpg,.jpeg,.png,.webp" class="hidden" (change)="onRowCoverSelected(row, $event)">
                            <button type="button" (click)="rowCoverInput.click()" [disabled]="isSubmitting || uploadingRowIds.has(row.rowId)" class="rounded-lg border border-slate-200 px-2.5 py-2 text-[0.68rem] font-black text-slate-600 disabled:opacity-50">
                              {{ currentLang === 'ar' ? 'رفع الغلاف' : 'Upload cover' }}
                            </button>
                          </div>
                          @if (row.coverImageUrl) {
                            <div class="flex items-center gap-2">
                              <img [src]="row.coverImageUrl" alt="Brand cover" class="h-10 w-16 rounded-lg border border-slate-200 bg-white object-cover">
                              <button type="button" (click)="row.coverImageUrl = null" [disabled]="isSubmitting" class="text-[0.68rem] font-black text-rose-600">
                                {{ currentLang === 'ar' ? 'إزالة' : 'Remove' }}
                              </button>
                            </div>
                          }
                        </div>
                      </td>
                      <td class="py-2.5">
                        <label class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 text-[0.7rem] font-black text-slate-700">
                          <input type="checkbox" [(ngModel)]="row.isActive" [disabled]="isSubmitting">
                          <span>{{ getStatusLabel(row.isActive) }}</span>
                        </label>
                      </td>
                      @if (stage === 'done') {
                        <td class="py-2.5">
                          @if (resultMap[row.rowId]) {
                            <div>
                              <span class="rounded-full px-3 py-1 text-[0.68rem] font-black"
                                [ngClass]="resultMap[row.rowId].status === 'Succeeded' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                                {{ resultMap[row.rowId].status }}
                              </span>
                              @if (resultMap[row.rowId].errorMessage) {
                                <div class="mt-2 max-w-[220px] text-[0.72rem] font-bold text-rose-600">{{ resultMap[row.rowId].errorMessage }}</div>
                              }
                            </div>
                          }
                        </td>
                      }
                      <td class="py-2.5 text-end">
                        @if (!isSubmitting) {
                          <div class="flex justify-end gap-2">
                            <button type="button" (click)="duplicateRow(row)" class="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[0.68rem] font-black text-slate-600">
                              {{ currentLang === 'ar' ? 'نسخ' : 'Duplicate' }}
                            </button>
                            <button type="button" (click)="removeRow(row.rowId)" class="rounded-lg border border-rose-200 px-2.5 py-1.5 text-[0.68rem] font-black text-rose-600">
                              {{ currentLang === 'ar' ? 'حذف' : 'Remove' }}
                            </button>
                          </div>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="max-w-full rounded-[24px] border border-slate-200/70 bg-white px-5 py-3 shadow-sm">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-2 text-xs font-black text-slate-600">
                  <span>{{ currentLang === 'ar' ? 'الصفوف' : 'Rows' }}: {{ rows.length }}</span>
                  <span>•</span>
                  <span>{{ currentLang === 'ar' ? 'الصالحة' : 'Valid' }}: {{ submittableRows.length }}</span>
                  <span>•</span>
                  <span>{{ currentLang === 'ar' ? 'الصفحة' : 'Page' }} {{ currentPage }} / {{ totalPages }}</span>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <button type="button" (click)="previousPage()" [disabled]="currentPage === 1 || isSubmitting" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.7rem] font-black text-slate-700 disabled:opacity-40">‹</button>
                  <button type="button" (click)="nextPage()" [disabled]="currentPage === totalPages || isSubmitting" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.7rem] font-black text-slate-700 disabled:opacity-40">›</button>
                  <button type="button" (click)="goBack()" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.7rem] font-black text-slate-700">
                    {{ currentLang === 'ar' ? 'رجوع' : 'Back' }}
                  </button>
                  @if (stage === 'review') {
                    <button type="button" (click)="submit()" [disabled]="submittableRows.length === 0 || isSubmitting" class="rounded-xl bg-zadna-primary px-4 py-2 text-[0.72rem] font-black text-white shadow-lg shadow-zadna-primary/20 disabled:opacity-40">
                      {{ currentLang === 'ar' ? 'إرسال الرفع الجماعي' : 'Submit bulk upload' }}
                    </button>
                  } @else if (stage === 'done') {
                    <button type="button" (click)="goBack()" class="rounded-xl bg-zadna-primary px-4 py-2 text-[0.72rem] font-black text-white shadow-lg shadow-zadna-primary/20">
                      {{ currentLang === 'ar' ? 'العودة للقائمة' : 'Back to list' }}
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class BulkBrandsPageComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  leafCategories: Category[] = [];
  rows: BulkBrandDraft[] = [];
  submittedRowIds: string[] = [];
  operation: AdminBrandBulkOperation | null = null;
  resultItems: AdminBrandBulkOperationItem[] = [];
  isLoading = true;
  isSubmitting = false;
  isUploadingDefaultLogo = false;
  isUploadingDefaultCover = false;
  stage: 'review' | 'done' = 'review';
  processedRows = 0;
  succeededRows = 0;
  failedRows = 0;
  currentPage = 1;
  readonly pageSize = 25;
  readonly uploadingRowIds = new Set<string>();
  private pollingSubscription?: Subscription;

  defaults: Pick<BulkBrandDraft, 'categoryId' | 'logoUrl' | 'coverImageUrl' | 'isActive'> = {
    categoryId: null,
    logoUrl: null,
    coverImageUrl: null,
    isActive: true
  };

  constructor(
    private readonly catalogService: CatalogService,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  get currentLang(): string {
    return this.translate.currentLang || 'ar';
  }

  get pagedRows(): BulkBrandDraft[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.rows.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.rows.length / this.pageSize));
  }

  get selectedCount(): number {
    return this.rows.filter((row) => row.selected).length;
  }

  get allRowsSelected(): boolean {
    return this.rows.length > 0 && this.rows.every((row) => row.selected);
  }

  get invalidRowsCount(): number {
    return this.rows.filter((row) => !!this.getRowError(row)).length;
  }

  get submittableRows(): BulkBrandDraft[] {
    return this.rows.filter((row) => !this.getRowError(row));
  }

  get resultMap(): Record<string, AdminBrandBulkOperationItem> {
    return this.resultItems.reduce<Record<string, AdminBrandBulkOperationItem>>((acc, item) => {
      const rowId = this.submittedRowIds[item.rowNumber - 1];
      if (rowId) {
        acc[rowId] = item;
      }
      return acc;
    }, {});
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  submit(): void {
    if (!this.submittableRows.length || this.isSubmitting) {
      return;
    }

    this.stage = 'review';
    this.isSubmitting = true;
    this.operation = null;
    this.resultItems = [];
    this.processedRows = 0;
    this.succeededRows = 0;
    this.failedRows = 0;
    this.pollingSubscription?.unsubscribe();

    const payload = this.submittableRows.map((row) => ({ ...row }));
    this.submittedRowIds = payload.map((row) => row.rowId);

    this.catalogService.createBrandsBulk(payload).subscribe({
      next: (operation) => {
        this.operation = operation;
        this.processedRows = operation.processedRows;
        this.succeededRows = operation.succeededRows;
        this.failedRows = operation.failedRows;
        this.startPolling(operation.id);
      },
      error: (error) => {
        const errorMessage = error?.error?.message || error?.message || (this.currentLang === 'ar' ? 'فشل بدء الرفع الجماعي.' : 'Failed to start bulk upload.');
        this.isSubmitting = false;
        this.processedRows = payload.length;
        this.failedRows = payload.length;
        this.stage = 'done';
        this.resultItems = payload.map((row, index) => ({
          id: `failed-${index + 1}`,
          rowNumber: index + 1,
          nameAr: row.nameAr,
          nameEn: row.nameEn,
          logoUrl: row.logoUrl || null,
          coverImageUrl: row.coverImageUrl || null,
          categoryId: row.categoryId!,
          isActive: row.isActive,
          status: 'Failed',
          errorMessage,
          createdBrandId: null
        }));
      }
    });
  }

  onDefaultsLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.isUploadingDefaultLogo = true;
    this.catalogService.uploadFile(file, 'brands').subscribe({
      next: (result) => {
        this.defaults.logoUrl = result.url;
        this.isUploadingDefaultLogo = false;
        input.value = '';
      },
      error: () => {
        this.isUploadingDefaultLogo = false;
        input.value = '';
      }
    });
  }

  onDefaultsCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.isUploadingDefaultCover = true;
    this.catalogService.uploadFile(file, 'brands').subscribe({
      next: (result) => {
        this.defaults.coverImageUrl = result.url;
        this.isUploadingDefaultCover = false;
        input.value = '';
      },
      error: () => {
        this.isUploadingDefaultCover = false;
        input.value = '';
      }
    });
  }

  onRowLogoSelected(row: BulkBrandDraft, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.uploadingRowIds.add(row.rowId);
    this.catalogService.uploadFile(file, 'brands').subscribe({
      next: (result) => {
        row.logoUrl = result.url;
        this.uploadingRowIds.delete(row.rowId);
        input.value = '';
      },
      error: () => {
        this.uploadingRowIds.delete(row.rowId);
        input.value = '';
      }
    });
  }

  onRowCoverSelected(row: BulkBrandDraft, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.uploadingRowIds.add(row.rowId);
    this.catalogService.uploadFile(file, 'brands').subscribe({
      next: (result) => {
        row.coverImageUrl = result.url;
        this.uploadingRowIds.delete(row.rowId);
        input.value = '';
      },
      error: () => {
        this.uploadingRowIds.delete(row.rowId);
        input.value = '';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/catalog/brands']);
  }

  addRows(count: number): void {
    this.rows = [...this.rows, ...Array.from({ length: count }, () => this.createEmptyRow())];
  }

  duplicateRow(row: BulkBrandDraft): void {
    this.rows = [...this.rows, { ...row, rowId: this.createRowId(), selected: false }];
  }

  duplicateSelectedRows(): void {
    const selected = this.rows.filter((row) => row.selected);
    if (!selected.length) return;
    this.rows = [...this.rows, ...selected.map((row) => ({ ...row, rowId: this.createRowId(), selected: false }))];
  }

  removeRow(rowId: string): void {
    this.rows = this.rows.filter((row) => row.rowId !== rowId);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  removeSelectedRows(): void {
    this.rows = this.rows.filter((row) => !row.selected);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  toggleAllRows(checked: boolean): void {
    this.rows.forEach((row) => (row.selected = checked));
  }

  applyDefaultsToSelected(): void {
    this.rows.filter((row) => row.selected).forEach((row) => this.applyDefaults(row));
  }

  applyDefaultsToAll(): void {
    this.rows.forEach((row) => this.applyDefaults(row));
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  getCategoryLabel(category: Category): string {
    return this.currentLang === 'ar' ? (category.nameAr || category.nameEn) : (category.nameEn || category.nameAr);
  }

  getRowError(row: BulkBrandDraft): string | null {
    if (!row.nameAr?.trim()) {
      return this.currentLang === 'ar' ? 'الاسم العربي مطلوب.' : 'Arabic name is required.';
    }

    if (!row.nameEn?.trim()) {
      return this.currentLang === 'ar' ? 'الاسم الإنجليزي مطلوب.' : 'English name is required.';
    }

    if (!row.categoryId) {
      return this.currentLang === 'ar' ? 'التصنيف مطلوب.' : 'Category is required.';
    }

    if ((row.logoUrl || '').trim().length > 2000) {
      return this.currentLang === 'ar' ? 'رابط الشعار طويل جدًا.' : 'Logo URL is too long.';
    }

    if ((row.coverImageUrl || '').trim().length > 2000) {
      return this.currentLang === 'ar' ? 'رابط صورة الغلاف طويل جدًا.' : 'Cover image URL is too long.';
    }

    return null;
  }

  private loadCategories(): void {
    this.catalogService.getCategories(undefined, true).subscribe({
      next: (categories) => {
        this.categories = Array.isArray(categories) ? categories : [];
        this.leafCategories = this.flattenLeafCategories(this.categories);
        this.addRows(25);
        this.isLoading = false;
      },
      error: () => {
        this.categories = [];
        this.leafCategories = [];
        this.addRows(25);
        this.isLoading = false;
      }
    });
  }

  private flattenLeafCategories(categories: Category[]): Category[] {
    const subCategories: Category[] = [];

    for (const category of categories) {
      const children = category.subCategories ?? [];

      for (const child of children) {
        if (child.parentCategoryId) {
          subCategories.push(child);
        }
      }

      if (children.length > 0) {
        subCategories.push(...this.flattenLeafCategories(children));
      }
    }

    return subCategories;
  }

  private applyDefaults(row: BulkBrandDraft): void {
    row.categoryId = this.defaults.categoryId;
    row.logoUrl = this.defaults.logoUrl;
    row.coverImageUrl = this.defaults.coverImageUrl;
    row.isActive = this.defaults.isActive;
  }

  private createEmptyRow(): BulkBrandDraft {
    return {
      rowId: this.createRowId(),
      nameAr: '',
      nameEn: '',
      categoryId: this.defaults.categoryId,
      logoUrl: this.defaults.logoUrl,
      coverImageUrl: this.defaults.coverImageUrl,
      isActive: this.defaults.isActive,
      selected: false
    };
  }

  private createRowId(): string {
    return `brand-row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private startPolling(operationId: string): void {
    this.pollingSubscription = interval(1200)
      .pipe(switchMap(() => this.catalogService.getBrandsBulkOperation(operationId)))
      .subscribe({
        next: (operation) => {
          this.operation = operation;
          this.processedRows = operation.processedRows;
          this.succeededRows = operation.succeededRows;
          this.failedRows = operation.failedRows;

          if (operation.status === 'Completed' || operation.status === 'CompletedWithErrors' || operation.status === 'Failed') {
            this.isSubmitting = false;
            this.stage = 'done';
            this.pollingSubscription?.unsubscribe();
            this.catalogService.getBrandsBulkOperationItems(operationId).subscribe({
              next: (items) => {
                this.resultItems = items;
              },
              error: () => {
                this.resultItems = [];
              }
            });
          }
        },
        error: () => {
          this.isSubmitting = false;
          this.stage = 'done';
          this.pollingSubscription?.unsubscribe();
        }
      });
  }

  getStatusLabel(isActive: boolean): string {
    if (this.currentLang === 'ar') {
      return isActive ? 'نشط' : 'غير نشط';
    }

    return isActive ? 'Active' : 'Inactive';
  }
}
