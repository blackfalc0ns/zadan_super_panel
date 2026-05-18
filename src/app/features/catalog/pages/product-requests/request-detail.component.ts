import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { ProductRequest, ProductRequestStatus } from '@catalog/models/catalog.domain.models';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { AppButtonComponent } from '@shared/components/ui/button/button.component';
import { StatusPillComponent, StatusPillVariant } from '@shared/components/ui/status-pill/status-pill.component';
import { SectionHeaderComponent } from '@shared/components/ui/section-header/section-header.component';
import { KeyValueGridComponent, KeyValueGridItem } from '@shared/components/ui/key-value-grid/key-value-grid.component';
import { InlineBannerComponent } from '@shared/components/ui/inline-banner/inline-banner.component';

@Component({
  selector: 'app-product-request-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    TranslateModule, 
    AppPageHeaderComponent, 
    AppButtonComponent,
    StatusPillComponent,
    SectionHeaderComponent,
    KeyValueGridComponent,
    InlineBannerComponent
  ],
  template: `
    <div class="space-y-6 animate-in fade-in duration-500" *ngIf="request; else loadingTpl">
      <app-page-header
        [title]="(currentLang === 'ar' ? request.suggestedNameAr : request.suggestedNameEn)"
        [subtitle]="request.id + ' • ' + ((currentLang === 'ar' ? request.categoryPathAr : request.categoryPathEn) || '')"
        [showBack]="true"
        backUrl="/catalog/product-requests"
        [breadcrumbs]="[
          { label: 'CATALOG.TITLE', url: '/catalog' },
          { label: 'CATALOG.PRODUCT_REQUESTS', url: '/catalog/product-requests' },
          { label: request.id }
        ]"
        [showToolbar]="true"
      >
        <!-- Product Thumbnail in Header -->
        <div title-prefix class="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shadow-sm mr-2 transition-transform hover:scale-105">
           <img [src]="request.imageUrl || 'assets/images/placeholders/product.png'" class="h-full w-full object-cover">
        </div>

        <!-- Status Pill in Title Area -->
        <div title-extra class="flex items-center gap-2 ml-3">
          <app-status-pill 
            [label]="statusMap[request.status].label" 
            [variant]="statusMap[request.status].variant"
            size="sm"
          ></app-status-pill>
        </div>

        <div actions class="flex items-center gap-3">
          <ng-container *ngIf="request.status === 'Pending'">
            <app-button 
              variant="danger" 
              size="md"
              class="!rounded-2xl"
              (btnClick)="showRejectModal = true"
            >
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">block</span>
                <span class="text-[0.7rem] font-black uppercase tracking-wider">{{ 'CATALOG.REJECT' | translate }}</span>
              </div>
            </app-button>
            <app-button 
              variant="primary" 
              size="md"
              class="!rounded-2xl shadow-lg shadow-zadna-primary/20"
              [isLoading]="submitting"
              (btnClick)="approveRequest()"
            >
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">verified</span>
                <span class="text-[0.7rem] font-black uppercase tracking-wider">{{ 'CATALOG.APPROVE' | translate }}</span>
              </div>
            </app-button>
          </ng-container>

          <ng-container *ngIf="request.status !== 'Pending'">
            <div class="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400">
               <span class="material-symbols-outlined text-[18px]">history</span>
               <span class="text-[0.65rem] font-black uppercase tracking-[0.1em]">{{ 'CATALOG.REVIEWED' | translate }}</span>
            </div>
          </ng-container>
        </div>
      </app-page-header>

      <!-- Rejection Banner -->
      <app-inline-banner
        *ngIf="request.status === 'Rejected'"
        variant="critical"
        [title]="'CATALOG.REJECTED_REQUEST' | translate"
        [message]="request.adminNotes || ('CATALOG.NO_NOTES' | translate)"
        icon="report"
        class="block animate-in slide-in-from-top-4 duration-300"
      ></app-inline-banner>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Main Content (8 cols) -->
        <div class="lg:col-span-8 space-y-8">
          
          <!-- Product Information -->
          <div class="premium-card p-8">
            <app-section-header
              [title]="'CATALOG.PRODUCT_INFO' | translate"
              [description]="'CATALOG.PRODUCT_INFO_HINT' | translate"
              icon="inventory_2"
              class="mb-8"
            ></app-section-header>

            <app-key-value-grid 
              [items]="productInfoItems" 
              [columns]="2"
              class="mb-8"
            ></app-key-value-grid>





            
            <div class="h-px w-full bg-slate-100 my-8"></div>

            <app-section-header
              [title]="'CATALOG.CLASSIFICATION' | translate"
              [description]="'CATALOG.CLASSIFICATION_HINT' | translate"
              icon="category"
              [compact]="true"
              class="mb-6"
            ></app-section-header>

            <app-key-value-grid 
              [items]="classificationItems" 
              [columns]="2"
            ></app-key-value-grid>
          </div>

          <!-- Description / Rich Content -->
          <div class="premium-card p-8">
            <app-section-header
              [title]="'CATALOG.DESCRIPTION' | translate"
              icon="description"
              [compact]="true"
              class="mb-6"
            ></app-section-header>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-3">
                <label class="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.1em]">{{ 'CATALOG.DESCRIPTION_AR' | translate }}</label>
                <div class="p-5 rounded-[20px] bg-slate-50/50 border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed min-h-[100px]">
                  {{ request.suggestedDescriptionAr || '---' }}
                </div>
              </div>
              <div class="space-y-3">
                <label class="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.1em]">{{ 'CATALOG.DESCRIPTION_EN' | translate }}</label>
                <div class="p-5 rounded-[20px] bg-slate-50/50 border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed min-h-[100px]">
                  {{ request.suggestedDescriptionEn || '---' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Content (4 cols) -->
        <div class="lg:col-span-4 space-y-8">
          
          <!-- Image Card -->
          <div class="premium-card overflow-hidden">
            <div class="group relative aspect-square w-full overflow-hidden bg-slate-50">
              <img 
                [src]="request.imageUrl || 'assets/images/placeholders/product.png'" 
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <span class="text-white text-[0.7rem] font-black uppercase tracking-widest">{{ 'CATALOG.IMAGE_PREVIEW' | translate }}</span>
              </div>
            </div>
            <div class="p-6 border-t border-slate-100 bg-slate-50/30">
               <div class="flex items-center justify-between">
                  <span class="text-[0.7rem] font-bold text-slate-400 uppercase">{{ 'CATALOG.IMAGE_SOURCE' | translate }}</span>
                  <span class="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[0.6rem] font-black uppercase tracking-wider">{{ 'CATALOG.VENDOR_UPLOAD' | translate }}</span>
               </div>
            </div>
          </div>

          <!-- Vendor Card -->
          <div class="premium-card p-6">
            <app-section-header
              [title]="'CATALOG.REQUESTER_VENDOR' | translate"
              icon="storefront"
              [compact]="true"
              class="mb-6"
            ></app-section-header>

            <div class="flex items-center gap-4 p-4 rounded-2xl bg-zadna-primary/5 border border-zadna-primary/10">
              <div class="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-zadna-primary font-black text-xl">
                {{ request.vendorName?.charAt(0) || 'V' }}
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-black text-slate-900 truncate">{{ request.vendorName }}</h4>
                <p class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest truncate">{{ request.vendorId }}</p>
              </div>
            </div>

            <app-button 
              variant="outline" 
              class="w-full mt-6 !rounded-xl !py-2.5 !text-[0.75rem]"
              [routerLink]="['/vendors', 'view', request.vendorId]"
            >
              {{ 'CATALOG.VIEW_VENDOR_PROFILE' | translate }}
            </app-button>
          </div>

          <!-- Timeline / Metadata -->
          <div class="premium-card p-6">
            <h4 class="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">{{ 'CATALOG.REQUEST_METADATA' | translate }}</h4>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                <div class="flex-1">
                  <p class="text-[0.75rem] font-black text-slate-700">{{ 'CATALOG.SUBMITTED_DATE' | translate }}</p>
                  <p class="text-[0.7rem] font-medium text-slate-400">{{ request.createdAtUtc | date:'medium' }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3" *ngIf="request.status !== 'Pending'">
                <div class="h-2 w-2 rounded-full bg-zadna-primary mt-1.5 shrink-0"></div>
                <div class="flex-1">
                  <p class="text-[0.75rem] font-black text-slate-700">{{ (request.status === 'Approved' ? 'CATALOG.APPROVED_AT' : 'CATALOG.REJECTED_AT') | translate }}</p>
                  <p class="text-[0.7rem] font-medium text-slate-400">{{ request.reviewedAtUtc | date:'medium' }}</p>
                  <p class="text-[0.65rem] font-bold text-zadna-primary mt-0.5">{{ 'CATALOG.BY' | translate }}: {{ request.reviewedBy }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div *ngIf="showRejectModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
       <div class="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 border border-white/20 animate-in zoom-in-95 duration-300">
          <div class="h-16 w-16 rounded-[24px] bg-rose-50 text-rose-500 flex items-center justify-center mb-6">
            <span class="material-symbols-outlined text-[32px]">report</span>
          </div>
          <h3 class="text-2xl font-black text-slate-900 mb-2">{{ 'CATALOG.REJECT_REQUEST' | translate }}?</h3>
          <p class="text-[0.85rem] font-medium text-slate-500 mb-8 leading-relaxed">{{ 'CATALOG.REJECT_CONFIRM_MSG' | translate }}</p>
          
          <div class="space-y-2 mb-10">
             <label class="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest pl-1">{{ 'CATALOG.REJECTION_REASON' | translate }}</label>
             <textarea 
               [(ngModel)]="rejectionNotes"
               class="w-full rounded-[24px] border-slate-200 bg-slate-50/50 p-5 text-[0.85rem] font-bold text-slate-900 focus:border-zadna-primary focus:ring-8 focus:ring-zadna-primary/5 transition-all outline-none resize-none"
               rows="4"
               [placeholder]="'CATALOG.REJECTION_REASON_PLACEHOLDER' | translate"
             ></textarea>
          </div>

          <div class="flex gap-4">
             <app-button 
               variant="outline" 
               size="lg"
               class="flex-1 !rounded-2xl"
               (btnClick)="showRejectModal = false; rejectionNotes = ''"
             >
               {{ 'COMMON.CANCEL' | translate }}
             </app-button>
             <app-button 
                variant="danger" 
                size="lg"
                class="flex-1 !rounded-2xl shadow-xl shadow-rose-200"
                [isLoading]="submitting"
                [disabled]="!rejectionNotes.trim()"
                (btnClick)="rejectRequest()"
              >
                {{ 'CATALOG.CONFIRM_REJECTION' | translate }}
             </app-button>
          </div>
       </div>
    </div>

    <ng-template #loadingTpl>
      <div class="admin-skeleton-detail">
        <div class="admin-skeleton-detail-hero">
          <div class="space-y-3">
            <span class="admin-skeleton admin-skeleton-line lg w-72"></span>
            <span class="admin-skeleton admin-skeleton-line w-96 max-w-full"></span>
          </div>
          <span class="admin-skeleton admin-skeleton-chip"></span>
        </div>
        <div class="admin-skeleton-detail-grid">
          <div *ngFor="let item of [1,2,3,4,5,6]" class="admin-skeleton-card space-y-3">
            <span class="admin-skeleton admin-skeleton-line sm w-1/2"></span>
            <span class="admin-skeleton admin-skeleton-line lg w-4/5"></span>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; }
    .premium-card {
      @apply rounded-[32px] border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm;
    }
  `]
})
export class ProductRequestDetailComponent implements OnInit {
  request: ProductRequest | null = null;
  loading = true;
  submitting = false;
  currentLang = 'ar';
  
  showRejectModal = false;
  rejectionNotes = '';

  statusMap: Record<ProductRequestStatus, { label: string, variant: StatusPillVariant }> = {
    'Pending': { label: 'CATALOG.STATUS_PENDING', variant: 'warning' },
    'Approved': { label: 'CATALOG.STATUS_APPROVED', variant: 'success' },
    'Rejected': { label: 'CATALOG.STATUS_REJECTED', variant: 'danger' }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    private translate: TranslateService
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.translate.onLangChange.subscribe(e => this.currentLang = e.lang);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDetail(id);
    }
  }

  get productInfoItems(): KeyValueGridItem[] {
    if (!this.request) return [];
    return [
      { label: 'CATALOG.NAME_AR', value: this.request.suggestedNameAr },
      { label: 'CATALOG.NAME_EN', value: this.request.suggestedNameEn }
    ];
  }

  get classificationItems(): KeyValueGridItem[] {
    if (!this.request) return [];
    return [
      { label: 'CATALOG.CATEGORY', value: (this.currentLang === 'ar' ? this.request.categoryPathAr : this.request.categoryPathEn) || '---' },
      { label: 'CATALOG.BRAND', value: this.request.suggestedBrandName || '---' }
    ];
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.catalogService.getProductRequestById(id).subscribe({
      next: (data) => {
        this.request = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/catalog/product-requests']);
      }
    });
  }

  approveRequest(): void {
    if (!this.request || this.submitting) return;
    
    this.submitting = true;
    this.catalogService.reviewProductRequest(this.request.id, 'Approved').subscribe({
      next: () => {
        this.submitting = false;
        this.loadDetail(this.request!.id);
      },
      error: () => this.submitting = false
    });
  }

  rejectRequest(): void {
    if (!this.request || this.submitting || !this.rejectionNotes.trim()) return;
    
    this.submitting = true;
    this.catalogService.reviewProductRequest(this.request.id, 'Rejected', this.rejectionNotes).subscribe({
      next: () => {
        this.submitting = false;
        this.showRejectModal = false;
        this.rejectionNotes = '';
        this.loadDetail(this.request!.id);
      },
      error: () => this.submitting = false
    });
  }
}
