import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, forkJoin, interval, switchMap } from 'rxjs';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import {
  AdminMasterProductBulkOperation,
  AdminMasterProductBulkOperationItem,
  Brand,
  BulkMasterProductDraft,
  CatalogUnit,
  Category,
  MasterProduct
} from '../../models/catalog.domain.models';
import { CatalogService } from '../../services/catalog.api.service';

type BulkStage = 'review' | 'submitting' | 'done';

@Component({
  selector: 'app-bulk-master-products-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SearchableSelectComponent],
  template: `
    <div
      [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'"
      [ngClass]="embedded
        ? 'fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm'
        : 'flex w-full max-w-full flex-col gap-4 overflow-x-hidden pb-4'">
      <div
        [ngClass]="embedded
          ? 'flex h-full max-h-[94vh] w-full max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[26px] bg-white shadow-2xl shadow-slate-900/20 2xl:max-w-[90rem]'
          : 'flex w-full max-w-full flex-col overflow-visible rounded-none border-0 bg-transparent shadow-none'">
        @if (embedded) {
        <div class="border-b border-slate-100 px-5 py-4">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <h2 class="text-lg font-black text-slate-900">
                {{ currentLang === 'ar' ? 'Ø¥Ø¶Ø§ÙØ© Ø¬Ù…Ø§Ø¹ÙŠØ© Ù„Ø¨Ù†Ùƒ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª' : 'Bulk Create Product Bank Items' }}
              </h2>
              <p class="mt-1 max-w-3xl text-xs font-bold leading-5 text-slate-500">
                {{ currentLang === 'ar' ? 'Ø£Ø¶Ù Ø¹Ø¯Ø¯Ù‹Ø§ ÙƒØ¨ÙŠØ±Ù‹Ø§ Ù…Ù† Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ù…Ø¹ ØªÙˆÙ„ÙŠØ¯ ØªÙ„Ù‚Ø§Ø¦ÙŠ Ù„Ù„Ù€ slug ÙˆØ§Ù„Ø¨Ø§Ø±ÙƒÙˆØ¯ Ø¹Ù†Ø¯ Ø§Ù„Ø­Ø§Ø¬Ø©.' : 'Create many master products with automatic slug and barcode generation when needed.' }}
              </p>
            </div>
            @if (embedded) {
              <button
                type="button"
                (click)="onClose()"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200">
                <span class="text-base font-black">Ã—</span>
              </button>
            }
          </div>
        </div>
        }

        <div [ngClass]="embedded ? 'border-b border-slate-100 bg-slate-50/70 px-5 py-3' : 'mb-6 max-w-full rounded-[24px] border border-slate-200/70 bg-white px-5 py-4 shadow-sm'">
          <div class="grid gap-4 2xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
            <div class="rounded-[20px] border border-slate-200 bg-white p-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <h3 class="text-xs font-black text-slate-900">{{ currentLang === 'ar' ? 'Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø³Ø±ÙŠØ¹Ø©' : 'Quick actions' }}</h3>
                <div class="flex flex-wrap gap-2">
                  <button type="button" (click)="addRows(25)" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.7rem] font-black text-slate-700">
                    {{ currentLang === 'ar' ? 'Ø¥Ø¶Ø§ÙØ© 25 ØµÙ' : 'Add 25 rows' }}
                  </button>
                  <button type="button" (click)="addRows(100)" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.7rem] font-black text-slate-700">
                    {{ currentLang === 'ar' ? 'Ø¥Ø¶Ø§ÙØ© 100 ØµÙ' : 'Add 100 rows' }}
                  </button>
                  <button type="button" (click)="duplicateSelectedRows()" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.7rem] font-black text-slate-700">
                    {{ currentLang === 'ar' ? 'Ù†Ø³Ø® Ø§Ù„Ù…Ø­Ø¯Ø¯' : 'Duplicate selected' }}
                  </button>
                  <button type="button" (click)="removeSelectedRows()" class="rounded-xl border border-rose-200 px-3 py-1.5 text-[0.7rem] font-black text-rose-600">
                    {{ currentLang === 'ar' ? 'Ø­Ø°Ù Ø§Ù„Ù…Ø­Ø¯Ø¯' : 'Remove selected' }}
                  </button>
                </div>
              </div>

              <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label class="space-y-1">
                  <span class="text-[0.72rem] font-black text-slate-500">{{ 'MASTER_PRODUCTS.MASTER_CATEGORY_LABEL' | translate }}</span>
                  <app-searchable-select [(ngModel)]="defaults.categoryId" (selectionChange)="onDefaultsCategoryChanged($event)" [options]="leafCategoryOptions" [placeholder]="'MASTER_PRODUCTS.SELECT_CATEGORY_PLACEHOLDER' | translate"></app-searchable-select>
                </label>
                <label class="space-y-1">
                  <span class="text-[0.72rem] font-black text-slate-500">{{ 'MASTER_PRODUCTS.ASSIGNED_BRAND_LABEL' | translate }}</span>
                  <app-searchable-select [(ngModel)]="defaults.brandId" [isDisabled]="!defaults.categoryId" [options]="getBrandOptionsForCategory(defaults.categoryId)" [placeholder]="'MASTER_PRODUCTS.GENERIC_WHITE_LABEL' | translate"></app-searchable-select>
                </label>
                <label class="space-y-1">
                  <span class="text-[0.72rem] font-black text-slate-500">{{ 'MASTER_PRODUCTS.UNIT_LABEL' | translate }}</span>
                  <app-searchable-select [(ngModel)]="defaults.unitId" [options]="unitSelectOptions" [placeholder]="'MASTER_PRODUCTS.STANDARD_UNIT' | translate"></app-searchable-select>
                </label>
                <label class="space-y-1">
                  <span class="text-[0.72rem] font-black text-slate-500">{{ currentLang === 'ar' ? 'Ø§Ù„Ø­Ø§Ù„Ø©' : 'Status' }}</span>
                  <app-searchable-select [(ngModel)]="defaults.status" [options]="statusSelectOptions" [placeholder]="currentLang === 'ar' ? 'الحالة' : 'Status'"></app-searchable-select>
                </label>
              </div>

              <div class="mt-4 space-y-2">
                <div class="flex items-center gap-2">
                  <input #defaultImagesInput type="file" accept="image/*" multiple class="hidden" (change)="onDefaultImagesSelected($event)">
                  <button type="button" (click)="defaultImagesInput.click()" [disabled]="isUploadingDefaultImages" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.7rem] font-black text-slate-700 disabled:opacity-50">
                    {{ currentLang === 'ar' ? 'Ø±ÙØ¹ ØµÙˆØ± Ø§ÙØªØ±Ø§Ø¶ÙŠØ©' : 'Upload default images' }}
                  </button>
                  @if (defaults.images?.length) {
                    <span class="text-[0.72rem] font-black text-slate-500">
                      {{ currentLang === 'ar' ? 'Ø¹Ø¯Ø¯ Ø§Ù„ØµÙˆØ±' : 'Images' }}: {{ defaults.images?.length }}
                    </span>
                  }
                </div>
                @if (defaults.images?.length) {
                  <div class="flex flex-wrap gap-2">
                    @for (image of defaults.images; track image.url; let imageIndex = $index) {
                      <div class="relative">
                        <img [src]="image.url" alt="Default product image" class="h-12 w-12 rounded-lg border border-slate-200 bg-white object-cover">
                        <button type="button" (click)="removeDefaultImage(imageIndex)" class="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">Ã—</button>
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="mt-4 flex flex-wrap items-center gap-3">
                <button type="button" (click)="applyDefaultsToSelected()" class="rounded-xl bg-zadna-primary px-3 py-1.5 text-[0.7rem] font-black text-white shadow-lg shadow-zadna-primary/20">
                  {{ currentLang === 'ar' ? 'ØªØ·Ø¨ÙŠÙ‚ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø­Ø¯Ø¯' : 'Apply to selected' }}
                </button>
                <button type="button" (click)="applyDefaultsToAll()" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.7rem] font-black text-slate-700">
                  {{ currentLang === 'ar' ? 'ØªØ·Ø¨ÙŠÙ‚ Ø¹Ù„Ù‰ Ø§Ù„ÙƒÙ„' : 'Apply to all' }}
                </button>
              </div>
            </div>

            <div class="rounded-[20px] border border-slate-200 bg-white p-4">
              <h3 class="text-xs font-black text-slate-900">{{ currentLang === 'ar' ? 'Ù…Ù„Ø®Øµ' : 'Summary' }}</h3>
              <div class="mt-3 grid gap-2.5 sm:grid-cols-2">
                <div class="rounded-xl bg-slate-50 p-2.5">
                  <div class="text-[0.72rem] font-black text-slate-500">{{ currentLang === 'ar' ? 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ØµÙÙˆÙ' : 'Rows' }}</div>
                  <div class="mt-1 text-lg font-black text-slate-900">{{ rows.length }}</div>
                </div>
                <div class="rounded-xl bg-slate-50 p-2.5">
                  <div class="text-[0.72rem] font-black text-slate-500">{{ currentLang === 'ar' ? 'Ø§Ù„Ù…Ø­Ø¯Ø¯' : 'Selected' }}</div>
                  <div class="mt-1 text-lg font-black text-slate-900">{{ selectedCount }}</div>
                </div>
                <div class="rounded-xl bg-emerald-50 p-2.5">
                  <div class="text-[0.72rem] font-black text-emerald-600">{{ currentLang === 'ar' ? 'Ø§Ù„ØµØ§Ù„Ø­Ø© Ù„Ù„Ø¥Ø±Ø³Ø§Ù„' : 'Ready to submit' }}</div>
                  <div class="mt-1 text-lg font-black text-emerald-700">{{ submittableRows.length }}</div>
                </div>
                <div class="rounded-xl bg-rose-50 p-2.5">
                  <div class="text-[0.72rem] font-black text-rose-600">{{ currentLang === 'ar' ? 'Ø¨Ù‡Ø§ Ø£Ø®Ø·Ø§Ø¡' : 'With errors' }}</div>
                  <div class="mt-1 text-lg font-black text-rose-700">{{ invalidRowsCount }}</div>
                </div>
              </div>

              @if (stage === 'done' && operation) {
                <div class="mt-4 rounded-2xl bg-slate-50 p-4">
                  <div class="text-sm font-black text-slate-900">{{ operation.status }}</div>
                  <div class="mt-2 text-xs font-bold text-slate-500">{{ operation.processedRows }} / {{ operation.totalRows }}</div>
                  <div class="mt-1 text-xs font-bold text-emerald-600">{{ currentLang === 'ar' ? 'Ù†Ø¬Ø­' : 'Succeeded' }}: {{ operation.succeededRows }}</div>
                  <div class="text-xs font-bold text-rose-600">{{ currentLang === 'ar' ? 'ÙØ´Ù„' : 'Failed' }}: {{ operation.failedRows }}</div>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <button type="button" (click)="copyErrors()" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.72rem] font-black text-slate-700">
                      {{ currentLang === 'ar' ? 'Ù†Ø³Ø® Ø§Ù„Ø£Ø®Ø·Ø§Ø¡' : 'Copy errors' }}
                    </button>
                    <button type="button" (click)="downloadErrors()" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.72rem] font-black text-slate-700">
                      {{ currentLang === 'ar' ? 'ØªÙ†Ø²ÙŠÙ„ Ø§Ù„Ø£Ø®Ø·Ø§Ø¡' : 'Download errors' }}
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <div [ngClass]="embedded ? 'flex-1 overflow-auto px-5 py-4' : 'mt-2 max-w-full overflow-x-auto overflow-y-hidden rounded-[24px] border border-slate-200/70 bg-white px-4 py-4 shadow-sm md:px-5'">
          <table class="min-w-[1260px] w-full table-fixed border-separate border-spacing-x-2 border-spacing-y-0">
            <thead>
              <tr class="border-b border-slate-100 text-[0.62rem] uppercase tracking-[0.1em] text-slate-400">
                <th class="w-10 px-1 pb-3 text-start"><input type="checkbox" [checked]="allRowsSelected" (change)="toggleAllRows($any($event.target).checked)"></th>
                <th class="w-10 px-1 pb-3 text-start">#</th>
                <th class="w-36 px-2 pb-3 text-start">{{ 'MASTER_PRODUCTS.NAME_AR_LABEL' | translate }}</th>
                <th class="w-36 px-2 pb-3 text-start">{{ 'MASTER_PRODUCTS.NAME_EN_LABEL' | translate }}</th>
                <th class="w-32 px-2 pb-3 text-start">{{ currentLang === 'ar' ? 'Ø§Ù„ØµÙˆØ±' : 'Images' }}</th>
                <th class="w-32 px-2 pb-3 text-start">{{ 'MASTER_PRODUCTS.MASTER_CATEGORY_LABEL' | translate }}</th>
                <th class="w-24 px-2 pb-3 text-start">{{ 'MASTER_PRODUCTS.ASSIGNED_BRAND_LABEL' | translate }}</th>
                <th class="w-24 px-2 pb-3 text-start">{{ 'MASTER_PRODUCTS.UNIT_LABEL' | translate }}</th>
                <th class="w-24 px-2 pb-3 text-start">{{ currentLang === 'ar' ? 'Ø§Ù„Ø­Ø§Ù„Ø©' : 'Status' }}</th>
                <th class="w-36 px-2 pb-3 text-start">{{ 'MASTER_PRODUCTS.DESC_AR_LABEL' | translate }}</th>
                <th class="w-36 px-2 pb-3 text-start">{{ 'MASTER_PRODUCTS.DESC_EN_LABEL' | translate }}</th>
                @if (stage === 'done') {
                  <th class="w-40 px-2 pb-3 text-start">{{ currentLang === 'ar' ? 'Ø§Ù„Ù†ØªÙŠØ¬Ø©' : 'Result' }}</th>
                }
                <th class="w-32 px-2 pb-3 text-end">{{ currentLang === 'ar' ? 'Ø¥Ø¬Ø±Ø§Ø¡' : 'Action' }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              @for (row of pagedRows; track row.rowId; let visibleIndex = $index) {
                <tr class="align-top">
                  <td class="py-2.5"><input type="checkbox" [(ngModel)]="row.selected"></td>
                  <td class="py-2.5 text-xs font-black text-slate-500">{{ ((currentPage - 1) * pageSize) + visibleIndex + 1 }}</td>
                  <td class="py-2.5">
                    <div class="space-y-1">
                      <input type="text" [(ngModel)]="row.nameAr" [disabled]="stage !== 'review'" class="h-9 w-full rounded-lg border border-slate-200 px-2.5 text-xs font-bold">
                      @if (stage === 'review' && getRowError(row)) {
                        <div class="text-[0.68rem] font-bold leading-4 text-rose-600">{{ getRowError(row) }}</div>
                      }
                    </div>
                  </td>
                  <td class="py-2.5">
                    <input type="text" [(ngModel)]="row.nameEn" [disabled]="stage !== 'review'" (blur)="ensureGeneratedValues(row)" class="h-9 w-full rounded-lg border border-slate-200 px-2.5 text-xs font-bold">
                  </td>
                  <td class="py-2.5">
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <input #rowImagesInput type="file" accept="image/*" multiple class="hidden" (change)="onRowImagesSelected(row, $event)">
                        <button
                          type="button"
                          (click)="rowImagesInput.click()"
                          [disabled]="stage !== 'review' || uploadingRowIds.has(row.rowId)"
                          class="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[0.68rem] font-black text-slate-600 disabled:opacity-50">
                          {{ currentLang === 'ar' ? 'Ø±ÙØ¹ ØµÙˆØ±' : 'Upload images' }}
                        </button>
                        @if (row.images?.length) {
                          <span class="text-[0.68rem] font-bold text-slate-500">
                            {{ currentLang === 'ar' ? 'Ø§Ù„Ø¹Ø¯Ø¯' : 'Count' }}: {{ row.images?.length }}
                          </span>
                        }
                      </div>
                      @if (row.images?.length) {
                        <div class="flex flex-wrap gap-2">
                          @for (image of row.images; track image.url; let imageIndex = $index) {
                            <div class="relative">
                              <img [src]="image.url" alt="Product image" class="h-11 w-11 rounded-lg border border-slate-200 bg-white object-cover">
                              @if (image.isPrimary) {
                                <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-zadna-primary px-1.5 py-0.5 text-[9px] font-black text-white">
                                  {{ currentLang === 'ar' ? 'Ø±Ø¦ÙŠØ³ÙŠØ©' : 'Primary' }}
                                </span>
                              }
                              <button
                                type="button"
                                (click)="removeRowImage(row, imageIndex)"
                                [disabled]="stage !== 'review'"
                                class="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white disabled:opacity-50">
                                Ã—
                              </button>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  </td>
                  <td class="py-2.5">
                    <app-searchable-select [(ngModel)]="row.categoryId" (selectionChange)="onRowCategoryChanged(row, $event)" [isDisabled]="stage !== 'review'" [options]="leafCategoryOptions" [placeholder]="'MASTER_PRODUCTS.SELECT_CATEGORY_PLACEHOLDER' | translate"></app-searchable-select>
                  </td>
                  <td class="py-2.5">
                    <app-searchable-select [(ngModel)]="row.brandId" [isDisabled]="stage !== 'review' || !row.categoryId" [options]="getBrandOptionsForCategory(row.categoryId)" [placeholder]="'MASTER_PRODUCTS.GENERIC_WHITE_LABEL' | translate"></app-searchable-select>
                  </td>
                  <td class="py-2.5">
                    <app-searchable-select [(ngModel)]="row.unitId" [isDisabled]="stage !== 'review'" [options]="unitSelectOptions" [placeholder]="'MASTER_PRODUCTS.STANDARD_UNIT' | translate"></app-searchable-select>
                  </td>
                  <td class="py-2.5">
                    <app-searchable-select [(ngModel)]="row.status" [isDisabled]="stage !== 'review'" [options]="statusSelectOptions" [placeholder]="currentLang === 'ar' ? 'الحالة' : 'Status'"></app-searchable-select>
                  </td>
                  <td class="py-2.5"><textarea [(ngModel)]="row.descriptionAr" [disabled]="stage !== 'review'" rows="2" class="w-full resize-none rounded-lg border border-slate-200 px-2.5 py-2 text-[0.7rem] font-bold"></textarea></td>
                  <td class="py-2.5"><textarea [(ngModel)]="row.descriptionEn" [disabled]="stage !== 'review'" rows="2" class="w-full resize-none rounded-lg border border-slate-200 px-2.5 py-2 text-[0.7rem] font-bold"></textarea></td>
                  @if (stage === 'done') {
                    <td class="py-2.5">
                      @if (resultMap[row.rowId]) {
                        <div>
                          <span
                            class="rounded-full px-3 py-1 text-[0.68rem] font-black"
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
                  <td class="w-32 px-2 py-2.5 text-end">
                    @if (stage === 'review') {
                      <div class="flex flex-nowrap justify-end gap-2 whitespace-nowrap">
                        <button type="button" (click)="duplicateRow(row)" class="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[0.68rem] font-black text-slate-600">
                          {{ currentLang === 'ar' ? 'Ù†Ø³Ø®' : 'Duplicate' }}
                        </button>
                        <button type="button" (click)="removeRow(row.rowId)" class="shrink-0 rounded-lg border border-rose-200 px-2.5 py-1.5 text-[0.68rem] font-black text-rose-600">
                          {{ currentLang === 'ar' ? 'Ø­Ø°Ù' : 'Remove' }}
                        </button>
                      </div>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div [ngClass]="embedded ? 'border-t border-slate-100 px-5 py-3' : 'max-w-full rounded-[24px] border border-slate-200/70 bg-white px-5 py-3 shadow-sm'">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2 text-xs font-black text-slate-600">
              <span>{{ currentLang === 'ar' ? 'Ø§Ù„ØµÙÙˆÙ' : 'Rows' }}: {{ rows.length }}</span>
              <span>â€¢</span>
              <span>{{ currentLang === 'ar' ? 'Ø§Ù„ØµØ§Ù„Ø­Ø©' : 'Valid' }}: {{ submittableRows.length }}</span>
              <span>â€¢</span>
              <span>{{ currentLang === 'ar' ? 'Ø§Ù„ØµÙØ­Ø©' : 'Page' }} {{ currentPage }} / {{ totalPages }}</span>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" (click)="previousPage()" [disabled]="currentPage === 1" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.7rem] font-black text-slate-700 disabled:opacity-40">â€¹</button>
              <button type="button" (click)="nextPage()" [disabled]="currentPage === totalPages" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.7rem] font-black text-slate-700 disabled:opacity-40">â€º</button>
              <button type="button" (click)="onClose()" class="rounded-xl border border-slate-200 px-3 py-1.5 text-[0.7rem] font-black text-slate-700">
                {{ currentLang === 'ar' ? (embedded ? 'Ø¥ØºÙ„Ø§Ù‚' : 'Ø±Ø¬ÙˆØ¹') : (embedded ? 'Close' : 'Back') }}
              </button>
              @if (stage === 'review') {
                <button type="button" (click)="submit()" [disabled]="submittableRows.length === 0" class="rounded-xl bg-zadna-primary px-4 py-2 text-[0.72rem] font-black text-white shadow-lg shadow-zadna-primary/20 disabled:opacity-40">
                  {{ currentLang === 'ar' ? 'Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ø¬Ù…Ø§Ø¹ÙŠØ©' : 'Submit bulk create' }}
                </button>
              } @else if (stage === 'done') {
                <button type="button" (click)="emitCompleted()" class="rounded-xl bg-zadna-primary px-4 py-2 text-[0.72rem] font-black text-white shadow-lg shadow-zadna-primary/20">
                  {{ currentLang === 'ar' ? 'ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©' : 'Refresh list' }}
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BulkMasterProductsModalComponent implements OnInit, OnDestroy {
  @Input() categories: Category[] = [];
  @Input() brands: Brand[] = [];
  @Input() units: CatalogUnit[] = [];
  @Input() currentLang = 'ar';
  @Input() embedded = true;
  @Output() close = new EventEmitter<void>();
  @Output() completed = new EventEmitter<void>();

  rows: BulkMasterProductDraft[] = [];
  submittedRowIds: string[] = [];
  stage: BulkStage = 'review';
  operation: AdminMasterProductBulkOperation | null = null;
  resultItems: AdminMasterProductBulkOperationItem[] = [];
  pollSub?: Subscription;
  currentPage = 1;
  readonly pageSize = 25;
  readonly statusOptions: MasterProduct['status'][] = ['Draft', 'Active', 'Inactive', 'Discontinued'];
  isUploadingDefaultImages = false;
  readonly uploadingRowIds = new Set<string>();

  defaults: Pick<BulkMasterProductDraft, 'categoryId' | 'brandId' | 'unitId' | 'status' | 'images'> = {
    categoryId: null,
    brandId: null,
    unitId: null,
    status: 'Draft',
    images: []
  };

  constructor(private readonly catalogService: CatalogService) {}

  ngOnInit(): void {
    this.addRows(25);
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  get leafCategories(): Category[] {
    return this.flattenCategories(this.categories).filter((category) => !category.subCategories?.length && !!category.parentCategoryId);
  }

  get pagedRows(): BulkMasterProductDraft[] {
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
    return this.rows.filter((row) => !!this.validateRow(row)).length;
  }

  get submittableRows(): BulkMasterProductDraft[] {
    return this.rows.filter((row) => !this.validateRow(row));
  }

  get resultMap(): Record<string, AdminMasterProductBulkOperationItem> {
    return this.resultItems.reduce<Record<string, AdminMasterProductBulkOperationItem>>((acc, item) => {
      const rowId = this.submittedRowIds[item.rowNumber - 1];
      if (rowId) {
        acc[rowId] = item;
      }
      return acc;
    }, {});
  }

  get leafCategoryOptions(): SearchableSelectOption<string | null>[] {
    return [
      { value: null, labelKey: 'MASTER_PRODUCTS.SELECT_CATEGORY_PLACEHOLDER' },
      ...this.leafCategories.map((category) => ({
        value: category.id,
        label: this.getCategoryLabel(category.id)
      }))
    ];
  }

  get unitSelectOptions(): SearchableSelectOption<string | null>[] {
    return [
      { value: null, labelKey: 'MASTER_PRODUCTS.STANDARD_UNIT' },
      ...this.units.map((unit) => ({
        value: unit.id,
        label: this.currentLang === 'ar' ? unit.nameAr : unit.nameEn
      }))
    ];
  }

  get statusSelectOptions(): SearchableSelectOption<MasterProduct['status']>[] {
    return this.statusOptions.map((status) => ({
      value: status,
      label: this.getStatusLabel(status)
    }));
  }

  onClose(): void {
    this.close.emit();
  }

  emitCompleted(): void {
    this.completed.emit();
  }

  addRows(count: number): void {
    const nextRows = Array.from({ length: count }, () => this.createEmptyRow());
    this.rows = [...this.rows, ...nextRows];
  }

  duplicateRow(row: BulkMasterProductDraft): void {
    const duplicated = { ...row, rowId: this.createRowId(), selected: false };
    this.rows = [...this.rows, duplicated];
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
    this.rows.forEach((row) => row.selected = checked);
  }

  applyDefaultsToSelected(): void {
    this.rows.filter((row) => row.selected).forEach((row) => this.applyDefaults(row));
  }

  applyDefaultsToAll(): void {
    this.rows.forEach((row) => this.applyDefaults(row));
  }

  applyDefaults(row: BulkMasterProductDraft): void {
    row.categoryId = this.defaults.categoryId;
    row.brandId = this.defaults.brandId;
    row.unitId = this.defaults.unitId;
    row.status = this.defaults.status;
    row.images = (this.defaults.images || []).map((image) => ({ ...image }));
    this.ensureBrandMatchesCategory(row);
  }

  generateSlugsForSelected(): void {
    this.rows.filter((row) => row.selected).forEach((row) => {
      row.slug = this.generateSlug(row.nameEn || row.nameAr || `product-${row.rowId}`);
    });
  }

  generateBarcodesForSelected(): void {
    this.rows.filter((row) => row.selected && !row.barcode).forEach((row) => {
      row.barcode = this.generateBarcode();
    });
  }

  ensureGeneratedValues(row: BulkMasterProductDraft): void {
    if (!row.slug) {
      row.slug = this.generateSlug(row.nameEn || row.nameAr || `product-${row.rowId}`);
    }

    if (!row.barcode) {
      row.barcode = this.generateBarcode();
    }
  }

  getRowError(row: BulkMasterProductDraft): string | null {
    return this.validateRow(row);
  }

  validateRow(row: BulkMasterProductDraft): string | null {
    if (!row.nameAr?.trim()) {
      return this.currentLang === 'ar' ? 'Ø§Ù„Ø§Ø³Ù… Ø§Ù„Ø¹Ø±Ø¨ÙŠ Ù…Ø·Ù„ÙˆØ¨.' : 'Arabic name is required.';
    }

    if (!row.nameEn?.trim()) {
      return this.currentLang === 'ar' ? 'Ø§Ù„Ø§Ø³Ù… Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ Ù…Ø·Ù„ÙˆØ¨.' : 'English name is required.';
    }

    if (!row.categoryId) {
      return this.currentLang === 'ar' ? 'Ø§Ù„ØªØµÙ†ÙŠÙ Ù…Ø·Ù„ÙˆØ¨.' : 'Category is required.';
    }

    if ((row.slug || '').trim().length > 250) {
      return this.currentLang === 'ar' ? 'Ø§Ù„Ù€ slug ÙŠØ¬Ø¨ Ø£Ù„Ø§ ÙŠØªØ¬Ø§ÙˆØ² 250 Ø­Ø±ÙÙ‹Ø§.' : 'Slug must not exceed 250 characters.';
    }

    if ((row.barcode || '').trim().length > 100) {
      return this.currentLang === 'ar' ? 'Ø§Ù„Ø¨Ø§Ø±ÙƒÙˆØ¯ ÙŠØ¬Ø¨ Ø£Ù„Ø§ ÙŠØªØ¬Ø§ÙˆØ² 100 Ø­Ø±Ù.' : 'Barcode must not exceed 100 characters.';
    }

    return null;
  }

  submit(): void {
    if (!this.submittableRows.length) {
      return;
    }

    const payload = this.submittableRows.map((row) => {
      this.ensureGeneratedValues(row);
      return row;
    });

    this.submittedRowIds = payload.map((row) => row.rowId);
    this.stage = 'submitting';
    this.catalogService.createProductsBulk(payload).subscribe({
      next: (operation) => {
        this.operation = operation;
        this.startPolling(operation.id);
      },
      error: () => {
        this.stage = 'review';
      }
    });
  }

  onDefaultImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) {
      return;
    }

    this.isUploadingDefaultImages = true;
    forkJoin(files.map((file) => this.catalogService.uploadFile(file, 'products'))).subscribe({
      next: (results) => {
        this.defaults.images = this.mapUploadedImages(results.map((result) => result.url));
        this.isUploadingDefaultImages = false;
        input.value = '';
      },
      error: () => {
        this.isUploadingDefaultImages = false;
        input.value = '';
      }
    });
  }

  onRowImagesSelected(row: BulkMasterProductDraft, event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) {
      return;
    }

    this.uploadingRowIds.add(row.rowId);
    forkJoin(files.map((file) => this.catalogService.uploadFile(file, 'products'))).subscribe({
      next: (results) => {
        row.images = this.mapUploadedImages(results.map((result) => result.url));
        this.uploadingRowIds.delete(row.rowId);
        input.value = '';
      },
      error: () => {
        this.uploadingRowIds.delete(row.rowId);
        input.value = '';
      }
    });
  }

  removeDefaultImage(index: number): void {
    this.defaults.images = (this.defaults.images || [])
      .filter((_, imageIndex) => imageIndex !== index)
      .map((image, imageIndex) => ({ ...image, displayOrder: imageIndex + 1, isPrimary: imageIndex === 0 }));
  }

  removeRowImage(row: BulkMasterProductDraft, index: number): void {
    row.images = (row.images || [])
      .filter((_, imageIndex) => imageIndex !== index)
      .map((image, imageIndex) => ({ ...image, displayOrder: imageIndex + 1, isPrimary: imageIndex === 0 }));
  }

  startPolling(operationId: string): void {
    this.pollSub?.unsubscribe();
    this.pollSub = interval(2000)
      .pipe(switchMap(() => this.catalogService.getProductsBulkOperation(operationId)))
      .subscribe({
        next: (operation) => {
          this.operation = operation;
          if (operation.status !== 'Pending' && operation.status !== 'Processing') {
            this.catalogService.getProductsBulkOperationItems(operationId).subscribe({
              next: (items) => {
                this.resultItems = items;
                this.stage = 'done';
                this.pollSub?.unsubscribe();
              }
            });
          }
        }
      });
  }

  copyErrors(): void {
    const text = this.buildErrorText();
    if (text) {
      navigator.clipboard?.writeText(text);
    }
  }

  downloadErrors(): void {
    const text = this.buildErrorText();
    if (!text) return;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'bulk-master-product-errors.txt';
    anchor.click();
    URL.revokeObjectURL(url);
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

  getCategoryLabel(categoryId: string): string {
    const category = this.flattenCategories(this.categories).find((item) => item.id === categoryId);
    if (!category) return categoryId;
    return this.currentLang === 'ar' ? (category.nameAr || category.nameEn) : (category.nameEn || category.nameAr);
  }

  onDefaultsCategoryChanged(categoryId: string | null): void {
    this.defaults.categoryId = categoryId;
    const availableBrands = this.getAvailableBrandsForCategory(categoryId);
    const isCurrentBrandValid = availableBrands.some((brand) => brand.id === this.defaults.brandId);

    if (!isCurrentBrandValid) {
      this.defaults.brandId = null;
    }
  }

  onRowCategoryChanged(row: BulkMasterProductDraft, categoryId: string | null): void {
    row.categoryId = categoryId;
    this.ensureBrandMatchesCategory(row);
  }

  getAvailableBrandsForCategory(categoryId: string | null | undefined): Brand[] {
    if (!categoryId) {
      return [];
    }

    const ancestorIds = this.getAncestorCategoryIds(categoryId);
    const matchIds = new Set([categoryId, ...ancestorIds]);

    return this.brands.filter((brand) => !!brand.categoryId && matchIds.has(brand.categoryId));
  }

  getBrandOptionsForCategory(categoryId: string | null | undefined): SearchableSelectOption<string | null>[] {
    return [
      { value: null, labelKey: 'MASTER_PRODUCTS.GENERIC_WHITE_LABEL' },
      ...this.getAvailableBrandsForCategory(categoryId).map((brand) => ({
        value: brand.id,
        label: this.currentLang === 'ar' ? (brand.nameAr || brand.nameEn) : (brand.nameEn || brand.nameAr)
      }))
    ];
  }

  getStatusLabel(status: MasterProduct['status']): string {
    if (this.currentLang !== 'ar') {
      return status;
    }

    switch (status) {
      case 'Draft':
        return 'Ù…Ø³ÙˆØ¯Ø©';
      case 'Active':
        return 'Ù†Ø´Ø·';
      case 'Inactive':
        return 'ØºÙŠØ± Ù†Ø´Ø·';
      case 'Discontinued':
        return 'Ù…ØªÙˆÙ‚Ù';
      default:
        return status;
    }
  }

  private createEmptyRow(): BulkMasterProductDraft {
    return {
      rowId: this.createRowId(),
      nameAr: '',
      nameEn: '',
      slug: null,
      barcode: null,
      categoryId: this.defaults.categoryId,
      brandId: this.defaults.brandId,
      unitId: this.defaults.unitId,
      status: this.defaults.status,
      descriptionAr: null,
      descriptionEn: null,
      images: (this.defaults.images || []).map((image) => ({ ...image })),
      selected: false
    };
  }

  private createRowId(): string {
    return `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private flattenCategories(categories: Category[]): Category[] {
    return categories.flatMap((category) => [category, ...this.flattenCategories(category.subCategories ?? [])]);
  }

  private ensureBrandMatchesCategory(row: BulkMasterProductDraft): void {
    const availableBrands = this.getAvailableBrandsForCategory(row.categoryId);
    const isBrandValid = availableBrands.some((brand) => brand.id === row.brandId);

    if (!isBrandValid) {
      row.brandId = null;
    }
  }

  private getAncestorCategoryIds(categoryId: string): string[] {
    const ancestors: string[] = [];
    const categoryMap = this.buildCategoryMap();

    let currentId: string | null | undefined = categoryId;
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const category = categoryMap.get(currentId);
      if (category?.parentCategoryId) {
        ancestors.push(category.parentCategoryId);
        currentId = category.parentCategoryId;
      } else {
        break;
      }
    }

    return ancestors;
  }

  private buildCategoryMap(): Map<string, Category> {
    return this.flattenCategories(this.categories).reduce((map, category) => {
      map.set(category.id, category);
      return map;
    }, new Map<string, Category>());
  }

  private generateSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\u0600-\u06FFa-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  private generateBarcode(): string {
    return `MP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  }

  private buildErrorText(): string {
    return this.resultItems
      .filter((item) => !!item.errorMessage)
      .map((item) => `#${item.rowNumber} ${item.nameAr || item.nameEn}: ${item.errorMessage}`)
      .join('\n');
  }

  private mapUploadedImages(urls: string[]): NonNullable<BulkMasterProductDraft['images']> {
    return urls.map((url, index) => ({
      url,
      altText: null,
      displayOrder: index + 1,
      isPrimary: index === 0
    }));
  }
}

