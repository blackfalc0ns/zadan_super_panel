import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  FeaturedPlacement,
  FeaturedPlacementPayload,
  FeaturedPlacementUpdatePayload
} from '@marketing/models/marketing.models';
import { MarketingApiService } from '@marketing/services/marketing.api.service';
import { describeApiError, formatDateRange, formatDateTime } from '@marketing/utils/marketing-date.utils';
import { FeaturedPlacementFormModalComponent } from '@marketing/components/featured-placement-form-modal/featured-placement-form-modal.component';
import { MarketingTabsInlineComponent } from '@marketing/components/marketing-tabs-inline/marketing-tabs-inline.component';
import { DeleteConfirmationModalComponent } from '@shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { AppButtonComponent } from '@shared/components/ui/button/button.component';
import { DataTableComponent, TableColumn } from '@shared/components/ui/data-table/data-table.component';
import { AppInputComponent } from '@shared/components/ui/form-controls/input/input.component';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { StatusPillComponent } from '@shared/components/ui/status-pill/status-pill.component';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-marketing-featured-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MarketingTabsInlineComponent,
    AppButtonComponent,
    AppInputComponent,
    AppPageHeaderComponent,
    StatusPillComponent,
    DeleteConfirmationModalComponent,
    FeaturedPlacementFormModalComponent,
    DataTableComponent
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        [title]="'MARKETING.TABS.FEATURED_PRODUCTS'"
        [subtitle]="'MARKETING.FEATURED.DESCRIPTION'"
        [showToolbar]="true"
        [breadcrumbs]="[
          { label: 'SIDEBAR.HOME', url: '/dashboard' },
          { label: 'SIDEBAR.MARKETING', url: '/marketing/featured-products' },
          { label: 'MARKETING.TABS.FEATURED_PRODUCTS' }
        ]">
        <span title-prefix class="material-symbols-outlined text-[28px] text-zadna-primary">star</span>

        <div actions class="flex flex-wrap items-center gap-3 animate-in slide-in-from-left-10 duration-700">
          <app-button
            variant="outline"
            size="sm"
            [isLoading]="loading"
            customClass="!rounded-[1.2rem]"
            (btnClick)="loadPlacements()">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">refresh</span>
              <span>{{ 'MARKETING.ACTIONS.REFRESH' | translate }}</span>
            </div>
          </app-button>

          <app-button
            variant="primary"
            size="sm"
            customClass="!rounded-[1.2rem] !shadow-lg !shadow-zadna-primary/20"
            (btnClick)="openCreate()">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">add</span>
              <span>{{ 'MARKETING.FEATURED.ACTIONS.CREATE' | translate }}</span>
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
            [customClass]="'bg-white/70 backdrop-blur-xl border border-slate-200/60 focus-within:bg-white focus-within:border-zadna-primary/50 focus-within:shadow-[0_8px_30px_-5px_rgba(18,124,140,0.15)] hover:bg-white/80 transition-all shadow-sm rounded-[1.5rem] overflow-hidden'">
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

      <app-data-table
        [data]="filteredPlacements"
        [columns]="tableColumns"
        [isLoading]="loading"
        [emptyStateTitle]="'MARKETING.FEATURED.MESSAGES.EMPTY_TITLE'"
        [emptyStateMessage]="'MARKETING.FEATURED.MESSAGES.EMPTY_SUBTITLE'"
        [containerClass]="'extraordinary-table-container bg-white/70 backdrop-blur-3xl rounded-[2rem] border border-slate-100/70'">

          <ng-template #customColumn let-placement let-column="column">
            <ng-container *ngIf="column.key === 'target'">
              <div class="flex items-center gap-3 text-start">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.1rem] bg-amber-100 text-amber-700 shadow-sm">
                  <span class="material-symbols-outlined text-[18px]">star</span>
                </div>
                <div class="min-w-0">
                  <div class="truncate text-[13px] font-black text-slate-900">
                    {{ placement.displayNameEn || placement.displayNameAr || '--' }}
                  </div>
                  <div class="mt-1 truncate text-[10px] font-bold text-slate-400">
                    {{ placement.vendorProductId || placement.masterProductId || '--' }}
                  </div>
                </div>
              </div>
            </ng-container>

            <ng-container *ngIf="column.key === 'placementType'">
              <div class="flex justify-center">
                <app-status-pill
                  [label]="placement.placementType === 'VendorProduct' ? 'MARKETING.FEATURED.TYPES.VENDOR_PRODUCT' : 'MARKETING.FEATURED.TYPES.MASTER_PRODUCT'"
                  [variant]="placement.placementType === 'VendorProduct' ? 'warning' : 'info'"
                  size="sm">
                </app-status-pill>
              </div>
            </ng-container>

            <ng-container *ngIf="column.key === 'displayOrder'">
              <span class="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                {{ placement.displayOrder }}
              </span>
            </ng-container>

            <ng-container *ngIf="column.key === 'schedule'">
              <span class="text-[11px] font-bold text-slate-500">
                {{ formatDateRangeLabel(placement) }}
              </span>
            </ng-container>

            <ng-container *ngIf="column.key === 'isActive'">
              <div class="flex justify-center">
                <app-status-pill
                  [label]="placement.isActive ? 'COMMON.ACTIVE' : 'COMMON.INACTIVE'"
                  [variant]="placement.isActive ? 'success' : 'neutral'"
                  size="sm">
                </app-status-pill>
              </div>
            </ng-container>

            <ng-container *ngIf="column.key === 'note'">
              <span class="text-[11px] font-bold text-slate-500">
                {{ placement.note || '--' }}
              </span>
            </ng-container>

            <ng-container *ngIf="column.key === 'updatedAtUtc'">
              <span class="text-[11px] font-bold text-slate-500">
                {{ formatDateTimeLabel(placement.updatedAtUtc) }}
              </span>
            </ng-container>

            <ng-container *ngIf="column.key === 'actions'">
              <div class="flex justify-end gap-1.5" (click)="$event.stopPropagation()">
                <button
                  type="button"
                  class="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-zadna-primary hover:text-white transition-all"
                  (click)="openEdit(placement.id)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>

                <button
                  type="button"
                  class="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center transition-all"
                  [ngClass]="placement.isActive ? 'hover:bg-amber-500 hover:text-white' : 'hover:bg-emerald-500 hover:text-white'"
                  (click)="toggleStatus(placement)">
                  <svg *ngIf="placement.isActive" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <svg *ngIf="!placement.isActive" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                <button
                  type="button"
                  class="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  (click)="promptDelete(placement)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </ng-container>
          </ng-template>

          <ng-template #mobileCard let-placement>
            <div class="space-y-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex items-center gap-3">
                  <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.1rem] bg-amber-100 text-amber-700">
                    <span class="material-symbols-outlined text-[18px]">star</span>
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-black text-slate-900">
                      {{ placement.displayNameEn || placement.displayNameAr || '--' }}
                    </p>
                    <p class="mt-0.5 truncate text-[11px] font-bold text-slate-400">
                      {{ placement.vendorProductId || placement.masterProductId || '--' }}
                    </p>
                  </div>
                </div>

                <app-status-pill
                  [label]="placement.isActive ? 'COMMON.ACTIVE' : 'COMMON.INACTIVE'"
                  [variant]="placement.isActive ? 'success' : 'neutral'"
                  size="sm">
                </app-status-pill>
              </div>

              <div class="grid grid-cols-2 gap-3 text-[11px] font-bold">
                <div class="rounded-2xl bg-slate-50 px-3 py-2.5">
                  <p class="mb-1 text-slate-400">{{ 'MARKETING.FEATURED.TABLE.TYPE' | translate }}</p>
                  <p class="text-slate-800">
                    {{
                      (placement.placementType === 'VendorProduct'
                        ? 'MARKETING.FEATURED.TYPES.VENDOR_PRODUCT'
                        : 'MARKETING.FEATURED.TYPES.MASTER_PRODUCT') | translate
                    }}
                  </p>
                </div>
                <div class="rounded-2xl bg-slate-50 px-3 py-2.5">
                  <p class="mb-1 text-slate-400">{{ 'COMMON.ORDER' | translate }}</p>
                  <p class="text-slate-800">{{ placement.displayOrder }}</p>
                </div>
                <div class="rounded-2xl bg-slate-50 px-3 py-2.5">
                  <p class="mb-1 text-slate-400">{{ 'MARKETING.FEATURED.TABLE.NOTE' | translate }}</p>
                  <p class="text-slate-800">{{ placement.note || '--' }}</p>
                </div>
                <div class="rounded-2xl bg-slate-50 px-3 py-2.5">
                  <p class="mb-1 text-slate-400">{{ 'MARKETING.COMMON.TABLE.SCHEDULE' | translate }}</p>
                  <p class="text-slate-800">{{ formatDateRangeLabel(placement) }}</p>
                </div>
              </div>

              <div class="flex gap-2 pt-1">
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-zadna-primary hover:text-white transition-all"
                  (click)="openEdit(placement.id)">
                  {{ 'COMMON.EDIT' | translate }}
                </button>
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all"
                  [ngClass]="placement.isActive ? 'bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white'"
                  (click)="toggleStatus(placement)">
                  {{ (placement.isActive ? 'MARKETING.ACTIONS.DEACTIVATE' : 'MARKETING.ACTIONS.ACTIVATE') | translate }}
                </button>
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 py-2.5 px-3 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-500 hover:text-white transition-all"
                  (click)="promptDelete(placement)">
                  {{ 'COMMON.DELETE' | translate }}
                </button>
              </div>
            </div>
          </ng-template>
      </app-data-table>
    </div>

    <app-featured-placement-form-modal [isOpen]="isModalOpen" [isSaving]="saving" [placement]="selectedPlacement" (close)="closeModal()" (save)="savePlacement($event)"></app-featured-placement-form-modal>

    <app-delete-confirmation-modal
      [isOpen]="deleteTarget !== null"
      [isLoading]="deleting"
      [title]="'MARKETING.FEATURED.MESSAGES.DELETE_TITLE'"
      [message]="'MARKETING.FEATURED.MESSAGES.DELETE_MESSAGE'"
      (close)="deleteTarget = null"
      (confirm)="confirmDelete()">
    </app-delete-confirmation-modal>
  `
})
export class MarketingFeaturedProductsComponent implements OnInit {
  placements: FeaturedPlacement[] = [];
  loading = false;
  saving = false;
  deleting = false;
  error = '';
  searchTerm = '';
  isModalOpen = false;
  selectedPlacement: FeaturedPlacement | null = null;
  deleteTarget: FeaturedPlacement | null = null;

  readonly tableColumns: TableColumn[] = [
    { key: 'target', title: 'MARKETING.FEATURED.TABLE.TARGET', type: 'custom', width: '18rem', align: 'left' },
    { key: 'placementType', title: 'MARKETING.FEATURED.TABLE.TYPE', type: 'custom', width: '10rem', align: 'center' },
    { key: 'displayOrder', title: 'COMMON.ORDER', type: 'custom', width: '7rem', align: 'center' },
    { key: 'schedule', title: 'MARKETING.COMMON.TABLE.SCHEDULE', type: 'custom', width: '11rem', align: 'center' },
    { key: 'isActive', title: 'COMMON.STATUS', type: 'custom', width: '8rem', align: 'center' },
    { key: 'note', title: 'MARKETING.FEATURED.TABLE.NOTE', type: 'custom', width: '14rem', align: 'left' },
    { key: 'updatedAtUtc', title: 'MARKETING.COMMON.TABLE.UPDATED', type: 'custom', width: '10rem', align: 'center' },
    { key: 'actions', title: 'COMMON.ACTIONS', type: 'custom', width: '10rem', align: 'right' }
  ];

  constructor(
    private readonly marketingApi: MarketingApiService,
    private readonly toastService: ToastService,
    readonly translateService: TranslateService
  ) {}

  get filteredPlacements(): FeaturedPlacement[] {
    const query = this.searchTerm.trim().toLocaleLowerCase();
    if (!query) {
      return this.placements;
    }

    return this.placements.filter((placement) =>
      [
        placement.displayNameAr,
        placement.displayNameEn,
        placement.vendorProductId,
        placement.masterProductId,
        placement.note,
        placement.placementType
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLocaleLowerCase().includes(query))
    );
  }
  ngOnInit(): void {
    this.loadPlacements();
  }

  loadPlacements(): void {
    this.loading = true;
    this.error = '';

    this.marketingApi.getFeaturedPlacements().subscribe({
      next: (placements) => {
        this.placements = [...placements].sort(
          (left, right) => left.displayOrder - right.displayOrder || right.updatedAtUtc.localeCompare(left.updatedAtUtc)
        );
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = describeApiError(error);
      }
    });
  }

  openCreate(): void {
    this.selectedPlacement = null;
    this.isModalOpen = true;
  }

  openEdit(id: string): void {
    this.saving = true;
    this.marketingApi.getFeaturedPlacementById(id).subscribe({
      next: (placement) => {
        this.selectedPlacement = placement;
        this.isModalOpen = true;
        this.saving = false;
      },
      error: (error) => {
        this.saving = false;
        this.toastService.error(describeApiError(error), this.translateService.instant('MARKETING.TABS.FEATURED_PRODUCTS'));
      }
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedPlacement = null;
  }

  savePlacement(payload: FeaturedPlacementUpdatePayload): void {
    this.saving = true;

    const request$ = this.selectedPlacement
      ? this.marketingApi.updateFeaturedPlacement(this.selectedPlacement.id, payload)
      : this.marketingApi.createFeaturedPlacement(toCreatePayload(payload));

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadPlacements();
        this.toastService.success(
          this.translateService.instant(this.selectedPlacement ? 'MARKETING.FEATURED.MESSAGES.UPDATED' : 'MARKETING.FEATURED.MESSAGES.CREATED'),
          this.translateService.instant('MARKETING.SHELL.TITLE')
        );
      },
      error: (error) => {
        this.saving = false;
        this.toastService.error(describeApiError(error), this.translateService.instant('MARKETING.TABS.FEATURED_PRODUCTS'));
      }
    });
  }

  toggleStatus(placement: FeaturedPlacement): void {
    const request$ = placement.isActive
      ? this.marketingApi.deactivateFeaturedPlacement(placement.id)
      : this.marketingApi.activateFeaturedPlacement(placement.id);

    request$.subscribe({
      next: () => {
        this.toastService.success(
          this.translateService.instant(placement.isActive ? 'MARKETING.FEATURED.MESSAGES.DEACTIVATED' : 'MARKETING.FEATURED.MESSAGES.ACTIVATED'),
          this.translateService.instant('MARKETING.SHELL.TITLE')
        );
        this.loadPlacements();
      },
      error: (error) => this.toastService.error(describeApiError(error), this.translateService.instant('MARKETING.TABS.FEATURED_PRODUCTS'))
    });
  }

  promptDelete(placement: FeaturedPlacement): void {
    this.deleteTarget = placement;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) {
      return;
    }

    this.deleting = true;
    this.marketingApi.deleteFeaturedPlacement(this.deleteTarget.id).subscribe({
      next: () => {
        this.deleting = false;
        this.deleteTarget = null;
        this.toastService.success(
          this.translateService.instant('MARKETING.FEATURED.MESSAGES.DELETED'),
          this.translateService.instant('MARKETING.SHELL.TITLE')
        );
        this.loadPlacements();
      },
      error: (error) => {
        this.deleting = false;
        this.toastService.error(describeApiError(error), this.translateService.instant('MARKETING.TABS.FEATURED_PRODUCTS'));
      }
    });
  }

  formatDateRangeLabel(placement: FeaturedPlacement): string {
    return formatDateRange(placement.startsAtUtc, placement.endsAtUtc);
  }

  formatDateTimeLabel(value: string): string {
    return formatDateTime(value);
  }
}

function toCreatePayload(payload: FeaturedPlacementUpdatePayload): FeaturedPlacementPayload {
  const { isActive: _, ...createPayload } = payload;
  return createPayload;
}
