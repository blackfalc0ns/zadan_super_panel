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
import { DeleteConfirmationModalComponent } from '@shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { AppButtonComponent } from '@shared/components/ui/button/button.component';
import { DataTableComponent, TableColumn } from '@shared/components/ui/data-table/data-table.component';
import { AppInputComponent } from '@shared/components/ui/form-controls/input/input.component';
import { StatusPillComponent } from '@shared/components/ui/status-pill/status-pill.component';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-marketing-featured-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AppButtonComponent,
    AppInputComponent,
    StatusPillComponent,
    DeleteConfirmationModalComponent,
    FeaturedPlacementFormModalComponent,
    DataTableComponent
  ],
  template: `
    <div class="space-y-6">
      
      <!-- Action Bar -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="max-w-[24rem] w-full">
          <app-input
            [(ngModel)]="searchTerm"
            [placeholder]="'بحث في المنتجات...'"
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
            (click)="loadPlacements()"
            [disabled]="loading"
            class="h-11 px-4 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-bold flex items-center gap-2 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
            <span class="material-symbols-outlined text-[18px]" [class.animate-spin]="loading">refresh</span>
            تحديث
          </button>

          <button
            type="button"
            (click)="openCreate()"
            class="h-11 px-5 rounded-2xl bg-zadna-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-zadna-primary/90 hover:shadow-lg hover:shadow-zadna-primary/20 transition-all">
            <span class="material-symbols-outlined text-[18px]">add</span>
            إضافة منتج مميز
          </button>
        </div>
      </div>

      <div *ngIf="error" class="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
        {{ error }}
      </div>

      <!-- Data Table -->
      <app-data-table
        [data]="filteredPlacements"
        [columns]="tableColumns"
        [isLoading]="loading"
        [emptyStateTitle]="'لا توجد منتجات مميزة'"
        [emptyStateMessage]="'لم يتم تخصيص أي منتج كمنتج مميز. يمكنك إضافة منتج للترويج له في الصفحة الرئيسية.'"
        [containerClass]="'bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/70 shadow-sm'">

          <ng-template #customColumn let-placement let-column="column">
            <ng-container *ngIf="column.key === 'target'">
              <div class="flex items-center gap-3 text-start">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.1rem] bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
                  <span class="material-symbols-outlined text-[20px]">star</span>
                </div>
                <div class="min-w-0">
                  <div class="truncate text-[13px] font-black text-slate-900">
                    {{ placement.displayNameAr || placement.displayNameEn || '--' }}
                  </div>
                  <div class="mt-1 flex items-center gap-1.5 truncate text-[11px] font-bold text-slate-400">
                    <span class="material-symbols-outlined text-[12px]">fingerprint</span>
                    {{ placement.vendorProductId || placement.masterProductId || '--' }}
                  </div>
                </div>
              </div>
            </ng-container>

            <ng-container *ngIf="column.key === 'placementType'">
              <div class="flex justify-center">
                <app-status-pill
                  [label]="placement.placementType === 'VendorProduct' ? 'منتج متجر' : 'منتج رئيسي'"
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
              <div class="flex items-center gap-2">
                 <span class="material-symbols-outlined text-[14px] text-slate-400">calendar_month</span>
                 <span class="text-[11px] font-bold text-slate-600" dir="ltr">
                   {{ formatDateRangeLabel(placement) }}
                 </span>
              </div>
            </ng-container>

            <ng-container *ngIf="column.key === 'isActive'">
              <div class="flex justify-start">
                <app-status-pill
                  [label]="placement.isActive ? 'نشط' : 'غير نشط'"
                  [variant]="placement.isActive ? 'success' : 'neutral'"
                  size="sm">
                </app-status-pill>
              </div>
            </ng-container>

            <ng-container *ngIf="column.key === 'note'">
              <span class="text-[11px] font-bold text-slate-500 truncate block max-w-[200px]" [title]="placement.note || ''">
                {{ placement.note || '--' }}
              </span>
            </ng-container>

            <ng-container *ngIf="column.key === 'actions'">
              <div class="flex justify-end gap-1.5" (click)="$event.stopPropagation()">
                <button
                  type="button"
                  class="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-zadna-primary/10 hover:text-zadna-primary transition-colors"
                  (click)="openEdit(placement.id)"
                  title="تعديل">
                  <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>

                <button
                  type="button"
                  class="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  [ngClass]="placement.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'"
                  (click)="toggleStatus(placement)"
                  [title]="placement.isActive ? 'إيقاف' : 'تفعيل'">
                  <span class="material-symbols-outlined text-[18px]">
                    {{ placement.isActive ? 'pause' : 'play_arrow' }}
                  </span>
                </button>

                <button
                  type="button"
                  class="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                  (click)="promptDelete(placement)"
                  title="حذف">
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </ng-container>
          </ng-template>
      </app-data-table>
    </div>

    <app-featured-placement-form-modal [isOpen]="isModalOpen" [isSaving]="saving" [placement]="selectedPlacement" (close)="closeModal()" (save)="savePlacement($event)"></app-featured-placement-form-modal>

    <app-delete-confirmation-modal
      [isOpen]="deleteTarget !== null"
      [isLoading]="deleting"
      [title]="'حذف المنتج المميز'"
      [message]="'هل أنت متأكد من رغبتك في إزالة هذا المنتج من قائمة المنتجات المميزة؟ لا يمكن التراجع عن هذا الإجراء.'"
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
    { key: 'target', title: 'المنتج المستهدف', type: 'custom', width: '20rem', align: 'left' },
    { key: 'placementType', title: 'النوع', type: 'custom', width: '8rem', align: 'center' },
    { key: 'displayOrder', title: 'الترتيب', type: 'custom', width: '6rem', align: 'center' },
    { key: 'schedule', title: 'تاريخ العرض', type: 'custom', width: '13rem', align: 'left' },
    { key: 'isActive', title: 'الحالة', type: 'custom', width: '7rem', align: 'left' },
    { key: 'note', title: 'ملاحظات إضافية', type: 'custom', width: '12rem', align: 'left' },
    { key: 'actions', title: 'إجراءات', type: 'custom', width: '10rem', align: 'right' }
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
        this.toastService.error(describeApiError(error), 'المنتجات المميزة');
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
          this.selectedPlacement ? 'تم تحديث المنتج المميز' : 'تم إضافة منتج مميز جديد',
          'التسويق'
        );
      },
      error: (error) => {
        this.saving = false;
        this.toastService.error(describeApiError(error), 'المنتجات المميزة');
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
          placement.isActive ? 'تم إيقاف عرض المنتج' : 'تم تفعيل عرض المنتج',
          'التسويق'
        );
        this.loadPlacements();
      },
      error: (error) => this.toastService.error(describeApiError(error), 'المنتجات المميزة')
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
        this.toastService.success('تم حذف المنتج المميز', 'التسويق');
        this.loadPlacements();
      },
      error: (error) => {
        this.deleting = false;
        this.toastService.error(describeApiError(error), 'المنتجات المميزة');
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
