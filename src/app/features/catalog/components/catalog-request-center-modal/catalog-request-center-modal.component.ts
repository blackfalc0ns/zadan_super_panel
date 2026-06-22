import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Category, CategoryRequestKind, CatalogRequestType, ProductRequest, ProductRequestStatus } from '@catalog/models/catalog.domain.models';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { AppButtonComponent } from '@shared/components/ui/button/button.component';
import { ModalShellComponent } from '@shared/components/ui/modal-shell/modal-shell.component';
import { StatusPillComponent, StatusPillVariant } from '@shared/components/ui/status-pill/status-pill.component';
import { ToastService } from '@shared/services/toast.service';
import { describeApiError } from '@shared/utils/api-error.util';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-catalog-request-center-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AppButtonComponent,
    ModalShellComponent,
    StatusPillComponent
  ],
  template: `
    <app-modal-shell
      *ngIf="isOpen"
      [dir]="isRtl ? 'rtl' : 'ltr'"
      [title]="translateKey(titleKey)"
      [subtitle]="translateKey('CATALOG.REQUESTS_MODAL_SUBTITLE')"
      [shouldTranslate]="false"
      [icon]="'assignment'"
      [maxWidthClass]="'max-w-6xl'"
      [panelClass]="'min-h-[78vh]'"
      [showFooter]="false"
      (close)="handleClose()">
      <div modal-body class="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <section class="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/70 p-4">
          <div class="mb-4 flex flex-wrap items-center gap-2">
            <button
              *ngFor="let option of statusOptions"
              type="button"
              (click)="applyStatusFilter(option.value)"
              class="rounded-full px-4 py-2 text-[11px] font-black transition-all"
              [ngClass]="selectedStatus === option.value ? 'bg-zadna-primary text-white shadow-lg shadow-zadna-primary/20' : 'bg-white text-slate-500 hover:bg-slate-100'">
              {{ option.label | translate }}
            </button>
          </div>

          <div *ngIf="isLoading" class="space-y-3">
            <div *ngFor="let item of [1,2,3,4]" class="admin-skeleton-card space-y-3">
              <span class="admin-skeleton admin-skeleton-line lg w-4/5"></span>
              <span class="admin-skeleton admin-skeleton-line sm w-1/2"></span>
            </div>
          </div>

          <div *ngIf="!isLoading && !requests.length" class="rounded-[1.25rem] border border-dashed border-slate-200 bg-white px-5 py-10 text-center">
            <p class="text-sm font-black text-slate-700">{{ translateKey('CATALOG.REQUESTS_EMPTY_TITLE') }}</p>
            <p class="mt-2 text-xs font-medium leading-6 text-slate-400">{{ translateKey('CATALOG.REQUESTS_EMPTY_DESC') }}</p>
          </div>

          <div *ngIf="!isLoading && requests.length" class="space-y-3">
            <button
              *ngFor="let request of requests"
              type="button"
              (click)="selectRequest(request)"
              class="w-full rounded-[1.25rem] border px-4 py-4 text-start transition-all"
              [ngClass]="selectedRequest?.id === request.id ? 'border-zadna-primary bg-white shadow-[0_10px_30px_-12px_rgba(18,124,140,0.35)]' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-[13px] font-black text-slate-900">
                    {{ activeLang === 'ar' ? request.suggestedNameAr : request.suggestedNameEn }}
                  </p>
                  <p class="mt-1 truncate text-[11px] font-bold text-slate-400">
                    {{ request.vendorName || request.vendorId }}
                  </p>
                </div>
                <app-status-pill
                  [label]="getStatusMap(request.status).label"
                  [variant]="getStatusMap(request.status).variant"
                  size="sm">
                </app-status-pill>
              </div>
              <div class="mt-3 flex items-center justify-between gap-3 text-[10px] font-bold text-slate-400">
                <span>{{ getRequestTypeLabel(request.requestType) | translate }}</span>
                <span>{{ request.createdAtUtc | date: 'mediumDate' }}</span>
              </div>
            </button>
          </div>
        </section>

        <section class="rounded-[1.5rem] border border-slate-200/70 bg-white p-5">
          <ng-container *ngIf="selectedRequest as request; else noSelectionTpl">
            <div class="flex flex-col gap-5">
              <div class="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
                <div class="flex items-start gap-4">
                  <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.25rem] bg-slate-100">
                    <img *ngIf="request.imageUrl; else requestFallbackIcon" [src]="request.imageUrl" class="h-full w-full object-cover" alt="">
                    <ng-template #requestFallbackIcon>
                      <span class="material-symbols-outlined text-[32px] text-slate-300">{{ getRequestIcon(request.requestType) }}</span>
                    </ng-template>
                  </div>
                  <div class="min-w-0">
                    <div class="mb-2 flex flex-wrap items-center gap-2">
                      <app-status-pill [label]="getStatusMap(request.status).label" [variant]="getStatusMap(request.status).variant" size="sm"></app-status-pill>
                      <span class="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {{ getRequestTypeLabel(request.requestType) | translate }}
                      </span>
                    </div>
                    <h3 class="text-lg font-black text-slate-900">{{ activeLang === 'ar' ? request.suggestedNameAr : request.suggestedNameEn }}</h3>
                    <p class="mt-1 text-sm font-medium text-slate-500">{{ activeLang === 'ar' ? request.suggestedNameEn : request.suggestedNameAr }}</p>
                    <p class="mt-3 text-xs font-bold text-slate-400">{{ 'CATALOG.SUBMITTED_BY' | translate }}: {{ request.vendorName || request.vendorId }}</p>
                  </div>
                </div>

                <div *ngIf="request.status === 'Pending' && !showRejectForm" class="flex flex-wrap items-center gap-2">
                  <app-button variant="outline" size="sm" customClass="!rounded-xl !border-rose-200 !text-rose-600 hover:!bg-rose-50" [disabled]="isSubmitting" (btnClick)="startReject()">
                    {{ 'CATALOG.REJECT' | translate }}
                  </app-button>
                  <app-button variant="primary" size="sm" customClass="!rounded-xl" [isLoading]="isSubmitting && pendingAction === 'approve'" [disabled]="isSubmitting" (btnClick)="approveSelected()">
                    {{ 'CATALOG.APPROVE' | translate }}
                  </app-button>
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div class="rounded-[1.25rem] border border-slate-200/70 bg-slate-50/70 p-4">
                  <p class="mb-3 text-[11px] font-black uppercase tracking-widest text-slate-400">{{ 'CATALOG.PRODUCT_INFO' | translate }}</p>
                  <div class="space-y-3">
                    <div>
                      <p class="text-[11px] font-bold text-slate-400">{{ 'CATALOG.NAME_AR' | translate }}</p>
                      <p class="text-sm font-black text-slate-800">{{ request.suggestedNameAr || '---' }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] font-bold text-slate-400">{{ 'CATALOG.NAME_EN' | translate }}</p>
                      <p class="text-sm font-black text-slate-800">{{ request.suggestedNameEn || '---' }}</p>
                    </div>
                    <div *ngIf="request.requestType === 'product'">
                      <p class="text-[11px] font-bold text-slate-400">{{ 'CATALOG.DESCRIPTION_AR' | translate }}</p>
                      <p class="text-sm font-medium leading-6 text-slate-700">{{ request.suggestedDescriptionAr || '---' }}</p>
                    </div>
                    <div *ngIf="request.requestType === 'product'">
                      <p class="text-[11px] font-bold text-slate-400">{{ 'CATALOG.DESCRIPTION_EN' | translate }}</p>
                      <p class="text-sm font-medium leading-6 text-slate-700">{{ request.suggestedDescriptionEn || '---' }}</p>
                    </div>
                  </div>
                </div>

                <div class="rounded-[1.25rem] border border-slate-200/70 bg-slate-50/70 p-4">
                  <p class="mb-3 text-[11px] font-black uppercase tracking-widest text-slate-400">{{ 'CATALOG.REQUEST_METADATA' | translate }}</p>
                  <div class="space-y-3">
                    <div>
                      <p class="text-[11px] font-bold text-slate-400">{{ 'CATALOG.VENDOR' | translate }}</p>
                      <p class="text-sm font-black text-slate-800">{{ request.vendorName || '---' }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] font-bold text-slate-400">{{ 'CATALOG.DATE_SUBMITTED' | translate }}</p>
                      <p class="text-sm font-black text-slate-800">{{ request.createdAtUtc | date: 'medium' }}</p>
                    </div>
                    <div *ngIf="request.reviewedAtUtc">
                      <p class="text-[11px] font-bold text-slate-400">{{ 'CATALOG.REVIEWED_AT' | translate }}</p>
                      <p class="text-sm font-black text-slate-800">{{ request.reviewedAtUtc | date: 'medium' }}</p>
                    </div>
                    <div *ngIf="request.reviewedBy">
                      <p class="text-[11px] font-bold text-slate-400">{{ 'CATALOG.REVIEWED_BY' | translate }}</p>
                      <p class="text-sm font-black text-slate-800">{{ request.reviewedBy }}</p>
                    </div>
                  </div>
                </div>

                <div class="rounded-[1.25rem] border border-slate-200/70 bg-white p-4 md:col-span-2">
                  <p class="mb-3 text-[11px] font-black uppercase tracking-widest text-slate-400">{{ 'CATALOG.CLASSIFICATION' | translate }}</p>
                  <div class="grid gap-3 md:grid-cols-3">
                    <div *ngIf="getRequestedPath(request) || getApprovedPath(request)">
                      <p class="text-[11px] font-bold text-slate-400">{{ 'CATALOG.CATEGORY' | translate }}</p>
                      <p class="text-sm font-black text-slate-800">{{ getRequestedPath(request) || getApprovedPath(request) || '---' }}</p>
                    </div>
                    <div *ngIf="request.requestKind || request.requestedLevelKey">
                      <p class="text-[11px] font-bold text-slate-400">{{ 'CATALOG.REQUEST_KIND' | translate }}</p>
                      <p class="text-sm font-black text-slate-800">{{ getRequestKindTranslateKey(resolveRequestKind(request)) | translate }}</p>
                    </div>
                    <div *ngIf="request.suggestedBrandName || request.suggestedBrandNameEn">
                      <p class="text-[11px] font-bold text-slate-400">{{ 'CATALOG.BRAND' | translate }}</p>
                      <p class="text-sm font-black text-slate-800">{{ activeLang === 'ar' ? (request.suggestedBrandName || '---') : (request.suggestedBrandNameEn || request.suggestedBrandName || '---') }}</p>
                    </div>
                    <div *ngIf="request.unitNameAr || request.unitNameEn">
                      <p class="text-[11px] font-bold text-slate-400">{{ 'CATALOG.UNIT' | translate }}</p>
                      <p class="text-sm font-black text-slate-800">{{ activeLang === 'ar' ? (request.unitNameAr || '---') : (request.unitNameEn || request.unitNameAr || '---') }}</p>
                    </div>
                    <div *ngIf="request.packageTypeNameAr || request.packageTypeNameEn">
                      <p class="text-[11px] font-bold text-slate-400">{{ 'CATALOG.PACKAGE_TYPE' | translate }}</p>
                      <p class="text-sm font-black text-slate-800">{{ activeLang === 'ar' ? (request.packageTypeNameAr || '---') : (request.packageTypeNameEn || request.packageTypeNameAr || '---') }}</p>
                    </div>
                    <div *ngIf="request.measurementValue !== null && request.measurementValue !== undefined">
                      <p class="text-[11px] font-bold text-slate-400">{{ 'CATALOG.MEASUREMENT_VALUE' | translate }}</p>
                      <p class="text-sm font-black text-slate-800">{{ request.measurementValue }}</p>
                    </div>
                    <div *ngIf="getRequestSizePreview(request)">
                      <p class="text-[11px] font-bold text-slate-400">{{ 'CATALOG.DISPLAY_SIZE' | translate }}</p>
                      <p class="text-sm font-black text-slate-800">{{ getRequestSizePreview(request) }}</p>
                    </div>
                    <div *ngIf="request.displayOrder !== null && request.displayOrder !== undefined">
                      <p class="text-[11px] font-bold text-slate-400">{{ 'CATALOG.DISPLAY_ORDER' | translate }}</p>
                      <p class="text-sm font-black text-slate-800">{{ request.displayOrder }}</p>
                    </div>
                  </div>
                </div>

                <div *ngIf="getRequestImages(request).length" class="rounded-[1.25rem] border border-slate-200/70 bg-white p-4 md:col-span-2">
                  <p class="mb-3 text-[11px] font-black uppercase tracking-widest text-slate-400">{{ 'CATALOG.PRODUCT_IMAGES' | translate }}</p>
                  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    <a
                      *ngFor="let imageUrl of getRequestImages(request); let index = index"
                      [href]="imageUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="group overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-50">
                      <img [src]="imageUrl" class="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105" alt="">
                      <div class="border-t border-slate-100 px-2 py-1.5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {{ index === 0 ? ('CATALOG.PRIMARY_IMAGE' | translate) : ('CATALOG.IMAGE' | translate) + ' ' + (index + 1) }}
                      </div>
                    </a>
                  </div>
                </div>

                <div *ngIf="isCategoryRequest(request)" class="rounded-[1.25rem] border border-cyan-100 bg-cyan-50/60 p-4 md:col-span-2">
                  <div class="flex flex-col gap-4">
                    <div>
                      <p class="text-[11px] font-black uppercase tracking-widest text-cyan-700">{{ 'CATALOG.FINAL_PLACEMENT' | translate }}</p>
                      <p class="mt-2 text-sm font-medium text-cyan-900">{{ categoryPlacementPreview || getRequestedPath(request) || '---' }}</p>
                    </div>

                    <div *ngIf="request.status === 'Pending'" class="grid gap-3 md:grid-cols-2">
                      <select [(ngModel)]="approvalTargetLevel" (ngModelChange)="onApprovalTargetLevelChanged()" [ngModelOptions]="{ standalone: true }" class="h-11 w-full rounded-xl border border-cyan-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none md:col-span-2">
                        <option *ngFor="let requestKind of categoryRequestKindOptions" [ngValue]="requestKind">{{ getRequestKindTranslateKey(requestKind) | translate }}</option>
                      </select>

                      <select *ngIf="requiresApprovalActivitySelection" [(ngModel)]="approvalActivityId" (ngModelChange)="onApprovalActivityChanged()" [ngModelOptions]="{ standalone: true }" class="h-11 w-full rounded-xl border border-cyan-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none">
                        <option [ngValue]="null">{{ 'CATALOG.SELECT_ACTIVITY' | translate }}</option>
                        <option *ngFor="let category of activityOptions" [ngValue]="category.id">{{ getCategoryOptionLabel(category) }}</option>
                      </select>

                      <select *ngIf="requiresApprovalSubActivitySelection" [(ngModel)]="approvalSubActivityId" (ngModelChange)="onApprovalSubActivityChanged()" [disabled]="!approvalActivityId" [ngModelOptions]="{ standalone: true }" class="h-11 w-full rounded-xl border border-cyan-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">
                        <option [ngValue]="null">{{ 'CATALOG.SELECT_SUB_ACTIVITY_OPTIONAL' | translate }}</option>
                        <option *ngFor="let category of approvalSubActivityOptions" [ngValue]="category.id">{{ getCategoryOptionLabel(category) }}</option>
                      </select>

                      <select *ngIf="requiresApprovalCategorySelection" [(ngModel)]="approvalCategoryId" [ngModelOptions]="{ standalone: true }" class="h-11 w-full rounded-xl border border-cyan-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none">
                        <option [ngValue]="null">{{ 'CATALOG.SELECT_PARENT_CATEGORY' | translate }}</option>
                        <option *ngFor="let category of approvalCategoryOptions" [ngValue]="category.id">{{ getCategoryOptionLabel(category) }}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div *ngIf="request.adminNotes" class="rounded-[1.25rem] border border-rose-100 bg-rose-50/70 p-4 md:col-span-2">
                  <p class="mb-2 text-[11px] font-black uppercase tracking-widest text-rose-400">{{ 'CATALOG.ADMIN_NOTES' | translate }}</p>
                  <p class="text-sm font-bold leading-6 text-rose-700">{{ request.adminNotes }}</p>
                </div>

                <div *ngIf="showRejectForm" class="overflow-hidden rounded-[1.25rem] border border-rose-200 bg-gradient-to-br from-rose-50/70 to-white shadow-[0_8px_30px_-12px_rgba(244,63,94,0.25)] md:col-span-2">
                  <div class="flex items-start gap-3 border-b border-rose-100 bg-rose-50/80 px-4 py-3.5">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 shadow-sm">
                      <span class="material-symbols-outlined text-[20px]">block</span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-black text-rose-950">{{ rejectFormTitleKey | translate }}</p>
                      <p class="mt-0.5 text-xs font-medium leading-5 text-rose-600">{{ 'CATALOG.REJECTION_REASON_HINT' | translate }}</p>
                    </div>
                    <button
                      type="button"
                      (click)="cancelReject()"
                      [disabled]="isSubmitting"
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-400 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40">
                      <span class="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  <div class="space-y-3 p-4">
                    <label class="block text-[11px] font-black uppercase tracking-widest text-rose-400">
                      {{ 'CATALOG.REJECTION_REASON' | translate }}
                      <span class="text-rose-500">*</span>
                    </label>
                    <textarea
                      [(ngModel)]="rejectionNotes"
                      [ngModelOptions]="{ standalone: true }"
                      rows="4"
                      class="w-full resize-none rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-400/10"
                      [placeholder]="'CATALOG.REJECTION_REASON_PLACEHOLDER' | translate">
                    </textarea>

                    <div class="flex flex-wrap items-center justify-end gap-3 pt-1">
                      <button
                        type="button"
                        (click)="cancelReject()"
                        [disabled]="isSubmitting"
                        class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40">
                        {{ 'COMMON.CANCEL' | translate }}
                      </button>
                      <button
                        type="button"
                        (click)="confirmReject()"
                        [disabled]="!rejectionNotes.trim() || isSubmitting"
                        class="inline-flex h-10 min-w-[140px] items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-200 disabled:text-rose-50 disabled:shadow-none">
                        <span *ngIf="isSubmitting && pendingAction === 'reject'" class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                        <span *ngIf="!(isSubmitting && pendingAction === 'reject')" class="material-symbols-outlined text-[16px]">block</span>
                        {{ 'CATALOG.CONFIRM_REJECTION' | translate }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>

          <ng-template #noSelectionTpl>
            <div class="flex min-h-[420px] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/60">
              <div class="max-w-sm text-center">
                <p class="text-base font-black text-slate-800">{{ translateKey('CATALOG.REQUESTS_SELECT_TITLE') }}</p>
                <p class="mt-2 text-sm font-medium leading-6 text-slate-400">{{ translateKey('CATALOG.REQUESTS_SELECT_DESC') }}</p>
              </div>
            </div>
          </ng-template>
        </section>
      </div>
    </app-modal-shell>
  `
})
export class CatalogRequestCenterModalComponent implements OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toastService = inject(ToastService);
  private readonly fallbackTranslations: Record<string, { ar: string; en: string }> = {
    'CATALOG.REQUESTS_MODAL_SUBTITLE': {
      ar: 'راجع طلبات الإضافة المرسلة من التجار واعتمدها أو ارفضها من نفس الشاشة.',
      en: 'Review vendor-submitted addition requests and approve or reject them without leaving the current list.'
    },
    'CATALOG.PRODUCT_REQUESTS': { ar: 'طلبات إضافة المنتجات', en: 'Product Addition Requests' },
    'CATALOG.BRAND_REQUESTS': { ar: 'طلبات إضافة العلامات التجارية', en: 'Brand Addition Requests' },
    'CATALOG.CATEGORY_REQUESTS': { ar: 'طلبات إضافة التصنيفات', en: 'Category Addition Requests' },
    'CATALOG.REQUESTS_EMPTY_TITLE': { ar: 'لا توجد طلبات مطابقة', en: 'No matching requests' },
    'CATALOG.REQUESTS_EMPTY_DESC': { ar: 'جرّب تغيير حالة الطلبات أو عد لاحقًا عند وصول طلبات جديدة.', en: 'Try changing the status filter or check again when new requests arrive.' },
    'CATALOG.REQUESTS_SELECT_TITLE': { ar: 'اختر طلبًا لعرض التفاصيل', en: 'Select a request to preview its details' },
    'CATALOG.REQUESTS_SELECT_DESC': { ar: 'حدد طلبًا من القائمة الجانبية لعرض البيانات الكاملة واتخاذ الإجراء المناسب.', en: 'Choose a request from the side list to inspect the full data and take action.' }
  };

  @Input() isOpen = false;
  @Input() requestType: CatalogRequestType = 'product';
  @Input() initialRequestId: string | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() refreshed = new EventEmitter<void>();

  requests: ProductRequest[] = [];
  selectedRequest: ProductRequest | null = null;
  selectedStatus: 'all' | ProductRequestStatus = 'Pending';
  isLoading = false;
  isSubmitting = false;
  showRejectForm = false;
  rejectionNotes = '';
  pendingAction: 'approve' | 'reject' | null = null;
  categories: Category[] = [];
  flatCategories: Category[] = [];
  readonly categoryRequestKindOptions: CategoryRequestKind[] = ['category', 'sub_category'];
  approvalTargetLevel: CategoryRequestKind = 'category';
  approvalActivityId: string | null = null;
  approvalSubActivityId: string | null = null;
  approvalCategoryId: string | null = null;

  readonly statusOptions: Array<{ value: 'all' | ProductRequestStatus; label: string }> = [
    { value: 'Pending', label: 'CATALOG.STATUS_PENDING' },
    { value: 'Approved', label: 'CATALOG.STATUS_APPROVED' },
    { value: 'Rejected', label: 'CATALOG.STATUS_REJECTED' },
    { value: 'all', label: 'COMMON.ALL' }
  ];

  readonly statusMap: Record<ProductRequestStatus, { label: string; variant: StatusPillVariant }> = {
    Pending: { label: 'CATALOG.STATUS_PENDING', variant: 'warning' },
    Approved: { label: 'CATALOG.STATUS_APPROVED', variant: 'success' },
    Rejected: { label: 'CATALOG.STATUS_REJECTED', variant: 'danger' }
  };

  constructor(
    private readonly catalogService: CatalogService,
    private readonly translate: TranslateService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['isOpen'] && this.isOpen)
      || (changes['requestType'] && this.isOpen)
      || (changes['initialRequestId'] && this.isOpen)
    ) {
      this.loadRequests();
      this.loadCategoriesIfNeeded();
    }
  }

  get isRtl(): boolean {
    return this.translate.currentLang === 'ar';
  }

  get activeLang(): string {
    return this.translate.currentLang || 'ar';
  }

  get titleKey(): string {
    switch (this.requestType) {
      case 'brand':
        return 'CATALOG.BRAND_REQUESTS';
      case 'category':
        return 'CATALOG.CATEGORY_REQUESTS';
      default:
        return 'CATALOG.PRODUCT_REQUESTS';
    }
  }

  get rejectFormTitleKey(): string {
    switch (this.requestType) {
      case 'brand':
        return 'CATALOG.REJECT_BRAND_REQUEST';
      case 'category':
        return 'CATALOG.REJECT_CATEGORY_REQUEST';
      default:
        return 'CATALOG.REJECT_REQUEST';
    }
  }

  get activityOptions(): Category[] {
    return this.flatCategories.filter(category => (category.level ?? 0) === 0);
  }

  get approvalSubActivityOptions(): Category[] {
    return this.approvalActivityId
      ? this.flatCategories.filter(category => category.parentCategoryId === this.approvalActivityId && (category.level ?? 0) === 1)
      : [];
  }

  get approvalCategoryOptions(): Category[] {
    return this.flatCategories.filter(category => (category.level ?? 0) === 2);
  }

  get requiresApprovalActivitySelection(): boolean {
    return this.approvalTargetLevel === 'category';
  }

  get requiresApprovalSubActivitySelection(): boolean {
    return this.approvalTargetLevel === 'category';
  }

  get requiresApprovalCategorySelection(): boolean {
    return this.approvalTargetLevel === 'sub_category';
  }

  get categoryPlacementPreview(): string {
    if (!this.selectedRequest || !this.isCategoryRequest(this.selectedRequest)) {
      return '';
    }

    const localizedName = this.activeLang === 'ar' ? this.selectedRequest.suggestedNameAr : this.selectedRequest.suggestedNameEn;
    const parentId = this.resolveApprovedParentCategoryId();
    const parent = parentId ? this.flatCategories.find(category => category.id === parentId) || null : null;
    const segments = parent ? this.getCategoryPathLabel(parent).split(' > ').filter(Boolean) : [];

    if (localizedName) {
      segments.push(localizedName);
    }

    return segments.join(' > ');
  }

  getStatusMap(status: ProductRequestStatus): { label: string; variant: StatusPillVariant } {
    return this.statusMap[status] ?? this.statusMap.Pending;
  }

  getRequestTypeLabel(type: CatalogRequestType): string {
    switch (type) {
      case 'brand':
        return 'CATALOG.BRAND_REQUEST_LABEL';
      case 'category':
        return 'CATALOG.CATEGORY_REQUEST_LABEL';
      default:
        return 'CATALOG.PRODUCT_REQUEST_LABEL';
    }
  }

  getRequestIcon(type: CatalogRequestType): string {
    switch (type) {
      case 'brand':
        return 'workspace_premium';
      case 'category':
        return 'category';
      default:
        return 'inventory_2';
    }
  }

  translateKey(key: string): string {
    const translated = this.translate.instant(key);
    if (translated && translated !== key) {
      return translated;
    }

    const fallback = this.fallbackTranslations[key];
    if (!fallback) {
      return key;
    }

    return this.activeLang === 'ar' ? fallback.ar : fallback.en;
  }

  applyStatusFilter(status: 'all' | ProductRequestStatus): void {
    if (this.selectedStatus === status) {
      return;
    }

    this.selectedStatus = status;
    this.loadRequests();
  }

  selectRequest(request: ProductRequest): void {
    this.selectedRequest = request;
    this.showRejectForm = false;
    this.rejectionNotes = '';
    this.catalogService.getCatalogRequestById(request.id, this.requestType).subscribe({
      next: detail => {
        this.cdr.markForCheck();
        this.selectedRequest = detail;
        this.resetApprovalPlacement(detail);
      }
    });
  }

  approveSelected(): void {
    if (!this.selectedRequest || this.isSubmitting) {
      return;
    }

    this.pendingAction = 'approve';
    this.isSubmitting = true;
    this.reviewRequest(this.selectedRequest, 'Approved');
  }

  startReject(): void {
    this.showRejectForm = true;
    this.rejectionNotes = this.selectedRequest?.adminNotes || '';
  }

  cancelReject(): void {
    this.showRejectForm = false;
    this.rejectionNotes = '';
  }

  confirmReject(): void {
    if (!this.selectedRequest || !this.rejectionNotes.trim() || this.isSubmitting) {
      return;
    }

    this.pendingAction = 'reject';
    this.isSubmitting = true;
    this.reviewRequest(this.selectedRequest, 'Rejected', this.rejectionNotes.trim());
  }

  handleClose(): void {
    this.requests = [];
    this.selectedRequest = null;
    this.showRejectForm = false;
    this.rejectionNotes = '';
    this.pendingAction = null;
    this.isSubmitting = false;
    this.close.emit();
  }

  onApprovalTargetLevelChanged(): void {
    this.approvalActivityId = null;
    this.approvalSubActivityId = null;
    this.approvalCategoryId = null;
  }

  onApprovalActivityChanged(): void {
    this.approvalSubActivityId = null;
  }

  onApprovalSubActivityChanged(): void {
    return;
  }

  getCategoryPathLabel(category: Category | null): string {
    if (!category) {
      return '';
    }

    const segments: string[] = [];
    let current: Category | undefined = category;

    while (current) {
      segments.unshift(this.activeLang === 'ar' ? current.nameAr : current.nameEn);
      const parentId: string | null | undefined = current.parentCategoryId;
      current = parentId ? this.flatCategories.find(item => item.id === parentId) : undefined;
    }

    return segments.join(' > ');
  }

  getCategoryOptionLabel(category: Category | null): string {
    if (!category) {
      return '';
    }

    return this.activeLang === 'ar' ? category.nameAr : category.nameEn;
  }

  getRequestKindTranslateKey(requestKind: CategoryRequestKind | string | null | undefined): string {
    return requestKind === 'sub_category'
      ? 'CATALOG.REQUEST_KIND_SUB_CATEGORY'
      : 'CATALOG.REQUEST_KIND_CATEGORY';
  }

  getRequestedPath(request: ProductRequest): string | undefined {
    return this.activeLang === 'ar'
      ? request.requestedPathAr || request.categoryPathAr || undefined
      : request.requestedPathEn || request.categoryPathEn || undefined;
  }

  getApprovedPath(request: ProductRequest): string | undefined {
    return this.activeLang === 'ar'
      ? request.approvedPathAr || request.categoryPathAr || undefined
      : request.approvedPathEn || request.categoryPathEn || undefined;
  }

  isCategoryRequest(request: ProductRequest | null): boolean {
    return request?.requestType === 'category';
  }

  getRequestImages(request: ProductRequest | null): string[] {
    if (!request) {
      return [];
    }

    const urls = request.imageUrls?.length
      ? request.imageUrls
      : (request.imageUrl ? [request.imageUrl] : []);

    return urls.filter(Boolean);
  }

  getRequestSizePreview(request: ProductRequest | null): string {
    if (!request) {
      return '';
    }

    const packageLabel = this.activeLang === 'ar'
      ? (request.packageTypeNameAr || '')
      : (request.packageTypeNameEn || request.packageTypeNameAr || '');
    const unitLabel = this.activeLang === 'ar'
      ? (request.unitNameAr || '')
      : (request.unitNameEn || request.unitNameAr || '');
    const valueLabel = request.measurementValue !== null && request.measurementValue !== undefined
      ? `${request.measurementValue}`
      : '';

    return [packageLabel, valueLabel, unitLabel].filter(Boolean).join(' ').trim();
  }

  private loadRequests(): void {
    this.isLoading = true;
    this.requests = [];
    this.selectedRequest = null;
    this.showRejectForm = false;
    this.rejectionNotes = '';

    this.catalogService.getCatalogRequests({
      type: this.requestType,
      status: this.selectedStatus
    }).subscribe({
      next: requests => {
        this.cdr.markForCheck();
        this.requests = requests;
        const preferredRequest = this.initialRequestId
          ? requests.find((request) => request.id === this.initialRequestId) ?? null
          : null;
        this.selectedRequest = preferredRequest ?? requests[0] ?? null;
        if (this.selectedRequest) {
          this.selectRequest(this.selectedRequest);
        }
        this.isLoading = false;
      },
      error: () => {
        this.cdr.markForCheck();
        this.isLoading = false;
      }
    });
  }

  private loadCategoriesIfNeeded(): void {
    if (this.requestType !== 'category' || this.flatCategories.length > 0) {
      return;
    }

    this.catalogService.getCategories(undefined, true).subscribe(categories => {
      this.cdr.markForCheck();
      this.categories = categories;
      this.flatCategories = this.flattenCategories(categories);
    });
  }

  private resetApprovalPlacement(request: ProductRequest): void {
    if (!this.isCategoryRequest(request)) {
      return;
    }

    const requestedKind = this.resolveRequestKind(request);
    this.approvalTargetLevel = requestedKind;
    this.approvalActivityId = null;
    this.approvalSubActivityId = null;
    this.approvalCategoryId = null;

    const requestedParent = this.findParentCategoryForRequest(request);
    if (!requestedParent) {
      return;
    }

    if (requestedKind === 'sub_category') {
      this.approvalCategoryId = requestedParent.id;
      this.approvalSubActivityId = requestedParent.parentCategoryId || null;
      const subActivity = this.approvalSubActivityId ? this.flatCategories.find(category => category.id === this.approvalSubActivityId) : null;
      this.approvalActivityId = subActivity?.parentCategoryId || null;
    } else if ((requestedParent.level ?? 0) === 0) {
      this.approvalActivityId = requestedParent.id;
    } else if ((requestedParent.level ?? 0) === 1) {
      this.approvalSubActivityId = requestedParent.id;
      this.approvalActivityId = requestedParent.parentCategoryId || null;
    }
  }

  private reviewRequest(request: ProductRequest, status: 'Approved' | 'Rejected', notes?: string): void {
    const request$ = this.requestType === 'brand'
      ? this.catalogService.reviewBrandRequest(request.id, status, notes)
      : this.requestType === 'category'
        ? this.catalogService.reviewCategoryRequest(
            request.id,
            status,
            notes,
            status === 'Approved' ? this.approvalTargetLevel : null,
            status === 'Approved' ? this.resolveApprovedParentCategoryId() : null)
        : this.catalogService.reviewProductRequest(request.id, status, notes);

    request$.subscribe({
      next: () => {
        this.cdr.markForCheck();
        this.isSubmitting = false;
        this.pendingAction = null;
        this.showRejectForm = false;
        this.rejectionNotes = '';
        this.toastService.success(
          this.translate.instant(this.getReviewSuccessKey(status)),
          this.translate.instant('CATALOG.REVIEW_SUCCESS_TITLE')
        );
        this.loadRequests();
        this.refreshed.emit();
      },
      error: (error) => {
        this.cdr.markForCheck();
        this.isSubmitting = false;
        this.pendingAction = null;
        this.toastService.error(
          describeApiError(error, this.translate, {
            fallbackKey: 'CATALOG.REVIEW_FAILED',
            codePrefix: 'CATALOG.ERROR_CODES'
          }),
          this.translate.instant('CATALOG.REVIEW_FAILED_TITLE')
        );
      }
    });
  }

  private getReviewSuccessKey(status: 'Approved' | 'Rejected'): string {
    const approved = status === 'Approved';

    if (this.requestType === 'brand') {
      return approved ? 'CATALOG.BRAND_REQUEST_APPROVED_SUCCESS' : 'CATALOG.BRAND_REQUEST_REJECTED_SUCCESS';
    }

    if (this.requestType === 'category') {
      return approved ? 'CATALOG.CATEGORY_REQUEST_APPROVED_SUCCESS' : 'CATALOG.CATEGORY_REQUEST_REJECTED_SUCCESS';
    }

    return approved ? 'CATALOG.REQUEST_APPROVED_SUCCESS' : 'CATALOG.REQUEST_REJECTED_SUCCESS';
  }

  private resolveApprovedParentCategoryId(): string | null {
    if (this.approvalTargetLevel === 'sub_category') {
      return this.approvalCategoryId;
    }

    return this.approvalSubActivityId || this.approvalActivityId;
  }

  private findParentCategoryForRequest(request: ProductRequest): Category | null {
    return this.findParentByPath(request.requestedPathAr || request.requestedPathEn);
  }

  resolveRequestKind(request: ProductRequest): CategoryRequestKind {
    return request.requestKind === 'sub_category' || request.requestedLevelKey === 'sub_category'
      ? 'sub_category'
      : 'category';
  }

  private findParentByPath(path?: string): Category | null {
    if (!path) {
      return null;
    }

    const segments = path.split(' > ').filter(Boolean);
    if (segments.length <= 1) {
      return null;
    }

    const parentPath = segments.slice(0, -1).join(' > ');
    return this.flatCategories.find(category =>
      this.getCategoryPathLabel(category) === parentPath) || null;
  }
  private flattenCategories(categories: Category[]): Category[] {
    return categories.flatMap(category => [
      category,
      ...(category.subCategories ? this.flattenCategories(category.subCategories) : [])
    ]);
  }
}
