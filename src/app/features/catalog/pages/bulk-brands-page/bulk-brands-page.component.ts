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
              @if (lastSuccessMessage) {
                <div class="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-700">
                  {{ lastSuccessMessage }}
                </div>
              }
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
                    <div class="space-y-1">
                      <span class="text-[0.72rem] font-black text-slate-500">{{ currentLang === 'ar' ? 'التصنيف الافتراضي' : 'Default category' }}</span>
                      <div class="rounded-xl border border-slate-200 bg-white p-2">
                        @if (selectedDefaultCategories.length) {
                          <div class="mb-2 flex flex-wrap gap-1.5">
                            @for (category of selectedDefaultCategories; track category.id) {
                              <button type="button" (click)="toggleDefaultCategory(category.id, false)" class="inline-flex max-w-full items-center gap-1 rounded-full bg-zadna-primary/10 px-2 py-1 text-[0.65rem] font-black text-zadna-primary">
                                <span class="truncate">{{ getCategoryLabel(category) }}</span>
                                <span class="material-symbols-outlined text-[13px]">close</span>
                              </button>
                            }
                          </div>
                        }
                        <button type="button" (click)="toggleDefaultCategoryDropdown()" class="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 px-2.5 text-start text-[0.7rem] font-black text-slate-700">
                          <span class="truncate">{{ getDefaultCategorySummary() }}</span>
                          <span class="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
                        </button>
                        @if (isDefaultCategoryDropdownOpen()) {
                          <div class="mt-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                            <label class="flex h-9 items-center gap-2 rounded-md border border-slate-200 px-2">
                              <span class="material-symbols-outlined text-[16px] text-slate-400">search</span>
                              <input [(ngModel)]="defaultCategorySearch" type="search" class="min-w-0 flex-1 border-0 bg-transparent text-[0.68rem] font-bold outline-none" [placeholder]="currentLang === 'ar' ? 'ابحث عن تصنيف' : 'Search category'">
                            </label>
                            <div class="mt-2 max-h-36 overflow-y-auto rounded-md border border-slate-100">
                              @for (category of getFilteredDefaultCategories(); track category.id) {
                                <label class="flex cursor-pointer items-start gap-2 border-b border-slate-50 px-2 py-1.5 last:border-b-0 hover:bg-slate-50">
                                  <input type="checkbox" class="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-zadna-primary focus:ring-zadna-primary" [checked]="isDefaultCategorySelected(category.id)" (change)="toggleDefaultCategory(category.id, $any($event.target).checked)">
                                  <span class="min-w-0 flex-1 text-[0.68rem] font-bold leading-4 text-slate-700">{{ getCategoryLabel(category) }}</span>
                                </label>
                              } @empty {
                                <div class="px-2 py-3 text-center text-[0.68rem] font-bold text-slate-400">{{ currentLang === 'ar' ? 'لا توجد نتائج' : 'No results' }}</div>
                              }
                            </div>
                          </div>
                        }
                      </div>
                    </div>

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
              <table class="min-w-[1660px] w-full table-fixed border-separate border-spacing-x-2 border-spacing-y-0">
                <thead>
                  <tr class="border-b border-slate-100 text-[0.62rem] uppercase tracking-[0.1em] text-slate-400">
                    <th class="w-10 px-1 pb-3 text-start"><input type="checkbox" [checked]="allRowsSelected" (change)="toggleAllRows($any($event.target).checked)"></th>
                    <th class="w-10 px-1 pb-3 text-start">#</th>
                    <th class="w-44 px-2 pb-3 text-start">{{ currentLang === 'ar' ? 'الاسم عربي' : 'Arabic name' }}</th>
                    <th class="w-44 px-2 pb-3 text-start">{{ currentLang === 'ar' ? 'الاسم إنجليزي' : 'English name' }}</th>
                    <th class="w-64 px-2 pb-3 text-start">{{ currentLang === 'ar' ? 'التصنيف' : 'Category' }}</th>
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
                        <div class="rounded-lg border border-slate-200 bg-white p-2" [class.opacity-60]="isSubmitting">
                          @if (getSelectedCategories(row).length) {
                            <div class="mb-2 flex flex-wrap gap-1.5">
                              @for (category of getSelectedCategories(row); track category.id) {
                                <button type="button" (click)="removeRowCategory(row, category.id)" [disabled]="isSubmitting" class="inline-flex max-w-full items-center gap-1 rounded-full bg-zadna-primary/10 px-2 py-1 text-[0.62rem] font-black text-zadna-primary disabled:cursor-not-allowed">
                                  <span class="truncate">{{ getCategoryLabel(category) }}</span>
                                  <span class="material-symbols-outlined text-[12px]">close</span>
                                </button>
                              }
                            </div>
                          }
                          <button type="button" (click)="toggleRowCategoryDropdown(row)" [disabled]="isSubmitting" class="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-slate-200 px-2 text-start text-[0.66rem] font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
                            <span class="truncate">{{ getRowCategorySummary(row) }}</span>
                            <span class="material-symbols-outlined text-[17px] text-slate-400">expand_more</span>
                          </button>
                          @if (isRowCategoryDropdownOpen(row)) {
                            <div class="mt-2 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
                              <label class="flex h-8 items-center gap-2 rounded-md border border-slate-200 px-2">
                                <span class="material-symbols-outlined text-[15px] text-slate-400">search</span>
                                <input [(ngModel)]="rowCategorySearch[row.rowId]" type="search" class="min-w-0 flex-1 border-0 bg-transparent text-[0.66rem] font-bold outline-none" [placeholder]="currentLang === 'ar' ? 'ابحث عن تصنيف' : 'Search category'">
                              </label>
                              <div class="mt-2 max-h-36 overflow-y-auto rounded-md border border-slate-100">
                                @for (category of getFilteredRowCategories(row); track category.id) {
                                  <label class="flex cursor-pointer items-start gap-2 border-b border-slate-50 px-2 py-1.5 last:border-b-0 hover:bg-slate-50">
                                    <input type="checkbox" class="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-zadna-primary focus:ring-zadna-primary" [disabled]="isSubmitting" [checked]="isRowCategorySelected(row, category.id)" (change)="toggleRowCategory(row, category.id, $any($event.target).checked)">
                                    <span class="min-w-0 flex-1 text-[0.66rem] font-bold leading-4 text-slate-700">{{ getCategoryLabel(category) }}</span>
                                  </label>
                                } @empty {
                                  <div class="px-2 py-3 text-center text-[0.66rem] font-bold text-slate-400">{{ currentLang === 'ar' ? 'لا توجد نتائج' : 'No results' }}</div>
                                }
                              </div>
                            </div>
                          }
                        </div>
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
  lastSuccessMessage = '';
  defaultCategorySearch = '';
  rowCategorySearch: Record<string, string> = {};
  openCategoryDropdown: 'defaults' | string | null = null;
  readonly pageSize = 25;
  readonly uploadingRowIds = new Set<string>();
  private pollingSubscription?: Subscription;

  defaults: Pick<BulkBrandDraft, 'categoryId' | 'categoryIds' | 'logoUrl' | 'coverImageUrl' | 'isActive'> = {
    categoryId: null,
    categoryIds: [],
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
    this.lastSuccessMessage = '';
    this.operation = null;
    this.resultItems = [];
    this.processedRows = 0;
    this.succeededRows = 0;
    this.failedRows = 0;
    this.pollingSubscription?.unsubscribe();

    const payload = this.submittableRows.map((row) => ({
      ...row,
      categoryIds: [...this.getRowCategoryIds(row)],
      categoryId: this.getRowCategoryIds(row)[0] ?? null
    }));
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
          categoryIds: row.categoryIds,
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
    this.rows = [...this.rows, { ...row, categoryIds: [...this.getRowCategoryIds(row)], rowId: this.createRowId(), selected: false }];
  }

  duplicateSelectedRows(): void {
    const selected = this.rows.filter((row) => row.selected);
    if (!selected.length) return;
    this.rows = [...this.rows, ...selected.map((row) => ({ ...row, categoryIds: [...this.getRowCategoryIds(row)], rowId: this.createRowId(), selected: false }))];
  }

  removeRow(rowId: string): void {
    this.rows = this.rows.filter((row) => row.rowId !== rowId);
    delete this.rowCategorySearch[rowId];
    if (this.openCategoryDropdown === rowId) {
      this.openCategoryDropdown = null;
    }
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  removeSelectedRows(): void {
    const removedRowIds = this.rows.filter((row) => row.selected).map((row) => row.rowId);
    this.rows = this.rows.filter((row) => !row.selected);
    removedRowIds.forEach((rowId) => delete this.rowCategorySearch[rowId]);
    if (this.openCategoryDropdown && removedRowIds.includes(this.openCategoryDropdown)) {
      this.openCategoryDropdown = null;
    }
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

  get selectedDefaultCategories(): Category[] {
    const selectedIds = new Set(this.getDefaultCategoryIds());
    return this.leafCategories.filter((category) => selectedIds.has(category.id));
  }

  getDefaultCategorySummary(): string {
    return this.getCategorySelectionSummary(this.selectedDefaultCategories);
  }

  toggleDefaultCategoryDropdown(): void {
    this.openCategoryDropdown = this.openCategoryDropdown === 'defaults' ? null : 'defaults';
  }

  isDefaultCategoryDropdownOpen(): boolean {
    return this.openCategoryDropdown === 'defaults';
  }

  getFilteredDefaultCategories(): Category[] {
    return this.filterCategories(this.defaultCategorySearch);
  }

  isDefaultCategorySelected(categoryId: string): boolean {
    return this.getDefaultCategoryIds().includes(categoryId);
  }

  toggleDefaultCategory(categoryId: string, checked: boolean): void {
    const selectedIds = new Set(this.getDefaultCategoryIds());
    if (checked) {
      selectedIds.add(categoryId);
    } else {
      selectedIds.delete(categoryId);
    }

    const nextIds = this.sortCategoryIds([...selectedIds]);
    this.defaults.categoryIds = nextIds;
    this.defaults.categoryId = nextIds[0] ?? null;
  }

  getSelectedCategories(row: BulkBrandDraft): Category[] {
    const selectedIds = new Set(this.getRowCategoryIds(row));
    return this.leafCategories.filter((category) => selectedIds.has(category.id));
  }

  getRowCategorySummary(row: BulkBrandDraft): string {
    return this.getCategorySelectionSummary(this.getSelectedCategories(row));
  }

  toggleRowCategoryDropdown(row: BulkBrandDraft): void {
    if (this.isSubmitting) {
      return;
    }

    this.rowCategorySearch[row.rowId] ??= '';
    this.openCategoryDropdown = this.openCategoryDropdown === row.rowId ? null : row.rowId;
  }

  isRowCategoryDropdownOpen(row: BulkBrandDraft): boolean {
    return this.openCategoryDropdown === row.rowId;
  }

  getFilteredRowCategories(row: BulkBrandDraft): Category[] {
    return this.filterCategories(this.rowCategorySearch[row.rowId] ?? '');
  }

  isRowCategorySelected(row: BulkBrandDraft, categoryId: string): boolean {
    return this.getRowCategoryIds(row).includes(categoryId);
  }

  toggleRowCategory(row: BulkBrandDraft, categoryId: string, checked: boolean): void {
    const selectedIds = new Set(this.getRowCategoryIds(row));
    if (checked) {
      selectedIds.add(categoryId);
    } else {
      selectedIds.delete(categoryId);
    }

    const nextIds = this.sortCategoryIds([...selectedIds]);
    row.categoryIds = nextIds;
    row.categoryId = nextIds[0] ?? null;
  }

  removeRowCategory(row: BulkBrandDraft, categoryId: string): void {
    this.toggleRowCategory(row, categoryId, false);
  }

  getRowError(row: BulkBrandDraft): string | null {
    if (!row.nameAr?.trim()) {
      return this.currentLang === 'ar' ? 'الاسم العربي مطلوب.' : 'Arabic name is required.';
    }

    if (!row.nameEn?.trim()) {
      return this.currentLang === 'ar' ? 'الاسم الإنجليزي مطلوب.' : 'English name is required.';
    }

    if (!this.getRowCategoryIds(row).length) {
      return this.currentLang === 'ar' ? 'التصنيف مطلوب.' : 'Category is required.';
    }

    if ((row.logoUrl || '').trim().length > 1000) {
      return this.currentLang === 'ar' ? 'رابط الشعار طويل جدًا.' : 'Logo URL is too long.';
    }

    if ((row.coverImageUrl || '').trim().length > 1000) {
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
    row.categoryIds = [...this.getDefaultCategoryIds()];
    row.categoryId = row.categoryIds[0] ?? null;
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
      categoryIds: [...this.getDefaultCategoryIds()],
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
            this.pollingSubscription?.unsubscribe();

            if (operation.status === 'Completed') {
              this.resetDraftsAfterSuccess(operation);
              return;
            }

            this.stage = 'done';
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

  private resetDraftsAfterSuccess(operation: AdminBrandBulkOperation): void {
    this.lastSuccessMessage = this.currentLang === 'ar'
      ? `تمت إضافة ${operation.succeededRows} علامة تجارية بنجاح، وتم تفريغ الحقول.`
      : `${operation.succeededRows} brands were added successfully. The form has been cleared.`;
    this.stage = 'review';
    this.operation = null;
    this.resultItems = [];
    this.submittedRowIds = [];
    this.processedRows = 0;
    this.succeededRows = 0;
    this.failedRows = 0;
    this.currentPage = 1;
    this.defaults = {
      categoryId: null,
      categoryIds: [],
      logoUrl: null,
      coverImageUrl: null,
      isActive: true
    };
    this.rows = Array.from({ length: 25 }, () => this.createEmptyRow());
  }

  getStatusLabel(isActive: boolean): string {
    if (this.currentLang === 'ar') {
      return isActive ? 'نشط' : 'غير نشط';
    }

    return isActive ? 'Active' : 'Inactive';
  }

  private getCategorySelectionSummary(categories: Category[]): string {
    if (!categories.length) {
      return this.currentLang === 'ar' ? 'اختر التصنيفات' : 'Select categories';
    }

    if (categories.length === 1) {
      return this.getCategoryLabel(categories[0]);
    }

    return this.currentLang === 'ar'
      ? `${categories.length} تصنيفات محددة`
      : `${categories.length} categories selected`;
  }

  private filterCategories(searchTerm: string): Category[] {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
    if (!normalizedSearch) {
      return this.leafCategories;
    }

    return this.leafCategories.filter((category) => {
      const nameAr = (category.nameAr || '').toLocaleLowerCase();
      const nameEn = (category.nameEn || '').toLocaleLowerCase();
      return nameAr.includes(normalizedSearch) || nameEn.includes(normalizedSearch);
    });
  }

  private getDefaultCategoryIds(): string[] {
    return this.sortCategoryIds(this.defaults.categoryIds?.length ? this.defaults.categoryIds : (this.defaults.categoryId ? [this.defaults.categoryId] : []));
  }

  private getRowCategoryIds(row: BulkBrandDraft): string[] {
    return this.sortCategoryIds(row.categoryIds?.length ? row.categoryIds : (row.categoryId ? [row.categoryId] : []));
  }

  private sortCategoryIds(categoryIds: string[]): string[] {
    const selectedIds = new Set(categoryIds.filter(Boolean));
    return this.leafCategories
      .map((category) => category.id)
      .filter((categoryId) => selectedIds.has(categoryId));
  }
}

