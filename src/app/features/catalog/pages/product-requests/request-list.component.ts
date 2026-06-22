import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { ProductRequest, ProductRequestStatus } from '@catalog/models/catalog.domain.models';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '@shared/components/ui/data-table/data-table.component';
import { StatusPillComponent, StatusPillVariant } from '@shared/components/ui/status-pill/status-pill.component';
import { AppButtonComponent } from '@shared/components/ui/button/button.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-product-request-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    TranslateModule, 
    AppPageHeaderComponent, 
    DataTableComponent,
    StatusPillComponent,
    AppButtonComponent
  ],
  template: `
    <div class="mx-auto w-full max-w-[120rem] pb-10 animate-in fade-in duration-500">
      <app-page-header
        [title]="'CATALOG.PRODUCT_REQUESTS' | translate"
        [subtitle]="'CATALOG.PRODUCT_REQUESTS_DESC' | translate"
      >
        <div actions class="flex items-center gap-3">
          <div class="flex items-center rounded-2xl bg-white p-1 shadow-sm border border-slate-100">
             <button 
               (click)="filterByStatus('Pending')"
               [class]="getStatusFilterClass('Pending')"
               class="px-4 py-2 text-[0.72rem] font-black transition-all rounded-xl"
             >
               {{ 'CATALOG.STATUS_PENDING' | translate }}
             </button>
             <button 
               (click)="filterByStatus('Approved')"
               [class]="getStatusFilterClass('Approved')"
               class="px-4 py-2 text-[0.72rem] font-black transition-all rounded-xl"
             >
               {{ 'CATALOG.STATUS_APPROVED' | translate }}
             </button>
             <button 
               (click)="filterByStatus('Rejected')"
               [class]="getStatusFilterClass('Rejected')"
               class="px-4 py-2 text-[0.72rem] font-black transition-all rounded-xl"
             >
               {{ 'CATALOG.STATUS_REJECTED' | translate }}
             </button>
          </div>
        </div>
      </app-page-header>

      <div class="px-4 md:px-8 lg:px-10">
      <div class="rounded-[32px] border border-slate-200/60 bg-white/50 p-2 shadow-sm backdrop-blur-xl">
        <app-data-table
          [data]="requests"
          [columns]="columns"
          [clickableRows]="true"
          (rowClick)="viewRequest($event)"
          [isLoading]="loading"
        >
          <ng-template #customColumn let-item let-column="column">
            <ng-container [ngSwitch]="column.key">
              
              <!-- Product Column -->
              <div *ngSwitchCase="'suggestedNameAr'" class="flex items-center gap-4 py-1">
                <div class="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                  <img [src]="item.imageUrl || 'assets/images/placeholders/product.png'" class="h-full w-full object-cover">
                </div>
                <div class="min-w-0">
                  <p class="truncate text-[0.85rem] font-black text-slate-900">
                    {{ currentLang === 'ar' ? item.suggestedNameAr : item.suggestedNameEn }}
                  </p>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="text-[0.68rem] font-bold text-slate-400">
                      {{ (currentLang === 'ar' ? item.categoryPathAr : item.categoryPathEn) || '---' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Vendor Column -->
              <div *ngSwitchCase="'vendorName'" class="flex flex-col">
                <span class="text-[0.82rem] font-black text-slate-800">{{ item.vendorName }}</span>
                <span class="text-[0.62rem] font-bold text-slate-400 uppercase tracking-wider">{{ item.vendorId }}</span>
              </div>

              <!-- Date Column -->
              <div *ngSwitchCase="'createdAtUtc'">
                <span class="text-[0.75rem] font-black text-slate-500">{{ item.createdAtUtc | date:'mediumDate' }}</span>
              </div>

              <!-- Status Column -->
              <div *ngSwitchCase="'status'" class="flex items-center gap-3">
                <app-status-pill 
                  [label]="getStatusMap(item.status).label"
                  [variant]="getStatusMap(item.status).variant"
                  size="sm"
                ></app-status-pill>

                <!-- Status Dot for Quick Glance -->
                <div class="h-2 w-2 rounded-full" [ngClass]="{
                  'bg-amber-500': item.status === 'Pending',
                  'bg-emerald-500': item.status === 'Approved',
                  'bg-rose-500': item.status === 'Rejected'
                }"></div>
              </div>

              <!-- Actions Column -->
              <div *ngSwitchCase="'actions'" class="flex items-center gap-2 justify-end">
                <ng-container *ngIf="item.status === 'Pending'">
                  <app-button 
                    variant="outline" 
                    size="xs"
                    class="!rounded-lg"
                    (btnClick)="openRejectModal(item, $event)"
                  >
                    <span class="material-symbols-outlined text-[16px] text-rose-500">block</span>
                  </app-button>
                  <app-button 
                    variant="primary" 
                    size="xs"
                    class="!rounded-lg !bg-emerald-500 !border-emerald-500 shadow-sm shadow-emerald-500/20"
                    [isLoading]="submittingId === item.id"
                    (btnClick)="approveRequest(item, $event)"
                  >
                    <span class="material-symbols-outlined text-[16px] text-white">done</span>
                  </app-button>
                </ng-container>

                <app-button 
                  variant="ghost" 
                  size="xs"
                  class="!rounded-lg"
                  (btnClick)="viewRequest(item)"
                >
                  <span class="material-symbols-outlined text-[18px] text-slate-400">chevron_left</span>
                </app-button>
              </div>

            </ng-container>
          </ng-template>
        </app-data-table>
      </div>
      </div>
    </div>

    <!-- Quick Reject Modal (List View) -->
    <div *ngIf="selectedRequestForReject" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
       <div class="w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-8 border border-white/20 animate-in zoom-in-95 duration-300">
          <div class="h-12 w-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-5">
            <span class="material-symbols-outlined text-[24px]">report</span>
          </div>
          <h3 class="text-xl font-black text-slate-900 mb-2">{{ 'CATALOG.REJECT_REQUEST' | translate }}?</h3>
          <p class="text-[0.8rem] font-medium text-slate-500 mb-6">{{ selectedRequestForReject.suggestedNameAr }}</p>
          
          <div class="space-y-2 mb-8">
             <label class="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest pl-1">{{ 'CATALOG.REJECTION_REASON' | translate }}</label>
             <textarea 
               [(ngModel)]="rejectionNotes"
               class="w-full rounded-2xl border-slate-200 bg-slate-50/50 p-4 text-[0.8rem] font-bold text-slate-900 focus:border-zadna-primary focus:ring-4 focus:ring-zadna-primary/5 transition-all outline-none resize-none"
               rows="3"
               [placeholder]="'CATALOG.REJECTION_REASON_PLACEHOLDER' | translate"
             ></textarea>
          </div>

          <div class="flex gap-3">
             <app-button 
               variant="outline" 
               size="md"
               class="flex-1 !rounded-xl"
               (btnClick)="closeRejectModal()"
             >
               {{ 'COMMON.CANCEL' | translate }}
             </app-button>
             <app-button 
                variant="danger" 
                size="md"
                class="flex-1 !rounded-xl"
                [isLoading]="submittingId === selectedRequestForReject.id"
                [disabled]="!rejectionNotes.trim()"
                (btnClick)="confirmRejection()"
              >
                {{ 'CATALOG.CONFIRM_REJECTION' | translate }}
             </app-button>
          </div>
       </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ProductRequestListComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  requests: ProductRequest[] = [];
  loading = true;
  submittingId: string | null = null;
  currentLang = 'ar';
  currentStatusFilter: ProductRequestStatus | null = null;

  // Reject Modal State
  selectedRequestForReject: ProductRequest | null = null;
  rejectionNotes = '';

  columns: TableColumn[] = [
    { key: 'suggestedNameAr', title: 'CATALOG.PRODUCT', type: 'custom', width: '40%' },
    { key: 'vendorName', title: 'CATALOG.VENDOR', type: 'custom', width: '25%' },
    { key: 'createdAtUtc', title: 'CATALOG.DATE', type: 'custom', width: '15%' },
    { key: 'status', title: 'CATALOG.STATUS', type: 'custom', width: '15%' },
    { key: 'actions', title: '', type: 'custom', align: 'right', width: '120px' }
  ];

  statusMap: Record<ProductRequestStatus, { label: string, variant: StatusPillVariant }> = {
    'Pending': { label: 'CATALOG.STATUS_PENDING', variant: 'warning' },
    'Approved': { label: 'CATALOG.STATUS_APPROVED', variant: 'success' },
    'Rejected': { label: 'CATALOG.STATUS_REJECTED', variant: 'danger' }
  };

  getStatusMap(status: string): { label: string, variant: StatusPillVariant } {
    return this.statusMap[status as ProductRequestStatus] || this.statusMap['Pending'];
  }

  constructor(
    private catalogService: CatalogService,
    private translate: TranslateService,
    private router: Router
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.translate.onLangChange.subscribe(e => this.currentLang = e.lang);
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.catalogService.getProductRequests(this.currentStatusFilter || undefined).subscribe({
      next: (data) => {
        this.cdr.markForCheck();
        this.requests = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  filterByStatus(status: ProductRequestStatus): void {
    if (this.currentStatusFilter === status) {
      this.currentStatusFilter = null;
    } else {
      this.currentStatusFilter = status;
    }
    this.loadRequests();
  }

  getStatusFilterClass(status: ProductRequestStatus): string {
    return this.currentStatusFilter === status
      ? 'bg-zadna-primary text-white shadow-sm shadow-zadna-primary/20'
      : 'text-slate-500 hover:bg-slate-50';
  }

  viewRequest(req: ProductRequest): void {
    this.router.navigate(['/catalog/product-requests/view', req.id]);
  }

  approveRequest(req: ProductRequest, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (this.submittingId) return;

    this.submittingId = req.id;
    this.catalogService.reviewProductRequest(req.id, 'Approved').subscribe({
      next: () => {
        this.cdr.markForCheck();
        this.submittingId = null;
        this.loadRequests();
      },
      error: () => this.submittingId = null
    });
  }

  openRejectModal(req: ProductRequest, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.selectedRequestForReject = req;
    this.rejectionNotes = '';
  }

  closeRejectModal(): void {
    this.selectedRequestForReject = null;
    this.rejectionNotes = '';
  }

  confirmRejection(): void {
    if (!this.selectedRequestForReject || !this.rejectionNotes.trim() || this.submittingId) return;

    this.submittingId = this.selectedRequestForReject.id;
    this.catalogService.reviewProductRequest(this.selectedRequestForReject.id, 'Rejected', this.rejectionNotes).subscribe({
      next: () => {
        this.cdr.markForCheck();
        this.submittingId = null;
        this.closeRejectModal();
        this.loadRequests();
      },
      error: () => this.submittingId = null
    });
  }
}
