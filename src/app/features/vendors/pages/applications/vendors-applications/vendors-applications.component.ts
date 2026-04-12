import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VendorService } from '@vendors/services/vendor.api.service';
import { Vendor, VendorStatus, VendorReviewState } from '@vendors/models/vendors.domain.models';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '@shared/components/ui/data-table/data-table.component';
import { StatusPillComponent } from '@shared/components/ui/status-pill/status-pill.component';

@Component({
  selector: 'app-vendors-applications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    AppPageHeaderComponent,
    DataTableComponent,
    StatusPillComponent
  ],
  template: `
    <div class="space-y-6 animate-in fade-in duration-500">
      <app-page-header
        [title]="'VENDORS.APPLICATIONS_TITLE' | translate"
        [subtitle]="'VENDORS.APPLICATIONS_DESC' | translate"
        [breadcrumbs]="[
          { label: 'VENDORS.TITLE' | translate, url: '/vendors' },
          { label: 'VENDORS.APPLICATIONS' | translate }
        ]"
      >
      </app-page-header>

      <div class="rounded-[32px] border border-slate-200/60 bg-white/50 p-2 shadow-sm backdrop-blur-xl">
        <app-data-table
          [data]="applications"
          [columns]="columns"
          [clickableRows]="true"
          (rowClick)="viewDetails($event)"
          [isLoading]="loading"
          emptyStateTitle="VENDORS.NO_APPLICATIONS"
          emptyStateMessage="VENDORS.NO_APPLICATIONS_DESC"
        >
          <ng-template #customColumn let-item let-column="column">
            <ng-container [ngSwitch]="column.key">
              
              <!-- Business Name Column -->
              <div *ngSwitchCase="'businessNameAr'" class="flex items-center gap-4 py-1">
                <div class="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-zadna-primary/5 border border-zadna-primary/10 flex items-center justify-center text-zadna-primary font-black text-lg">
                  {{ item.businessNameAr?.charAt(0) || 'V' }}
                </div>
                <div class="min-w-0">
                  <p class="truncate text-[0.85rem] font-black text-slate-900">
                    {{ currentLang === 'ar' ? item.businessNameAr : item.businessNameEn }}
                  </p>
                  <p class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest truncate">
                    {{ item.id }}
                  </p>
                </div>
              </div>

              <!-- Owner Column -->
              <div *ngSwitchCase="'ownerName'" class="flex flex-col">
                <span class="text-[0.82rem] font-black text-slate-800">{{ item.ownerName }}</span>
                <span class="text-[0.62rem] font-bold text-slate-400">{{ item.contactEmail }}</span>
              </div>

              <!-- Review State Column -->
              <div *ngSwitchCase="'reviewState'">
                <app-status-pill 
                  [label]="getReviewStateLabel(item.reviewState)"
                  [variant]="getReviewStateVariant(item.reviewState)"
                  size="sm"
                ></app-status-pill>
              </div>

              <!-- Date Column -->
              <div *ngSwitchCase="'createdAtUtc'">
                <span class="text-[0.75rem] font-black text-slate-500">{{ item.createdAtUtc | date:'mediumDate' }}</span>
              </div>

            </ng-container>
          </ng-template>
        </app-data-table>
      </div>
    </div>
  `
})
export class VendorsApplicationsComponent implements OnInit {
  applications: Vendor[] = [];
  loading = true;
  currentLang = 'ar';

  columns: TableColumn[] = [
    { key: 'businessNameAr', title: 'VENDORS.BUSINESS_NAME', type: 'custom', width: '35%' },
    { key: 'ownerName', title: 'VENDORS.OWNER', type: 'custom', width: '25%' },
    { key: 'reviewState', title: 'VENDORS.REVIEW_STATUS', type: 'custom', width: '20%' },
    { key: 'createdAtUtc', title: 'VENDORS.SUBMITTED_DATE', type: 'custom', width: '20%' }
  ];

  constructor(
    private vendorService: VendorService,
    private translate: TranslateService,
    private router: Router
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.translate.onLangChange.subscribe(e => this.currentLang = e.lang);
  }

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    // status=Pending will give us the ones needing review
    this.vendorService.getVendors(1, 50, undefined, VendorStatus.Pending).subscribe({
      next: (data) => {
        this.applications = data.items;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getReviewStateLabel(state: VendorReviewState): string {
    const map: Record<string, string> = {
      submitted: 'VENDORS.REVIEW_STATE.SUBMITTED',
      under_review: 'VENDORS.REVIEW_STATE.UNDER_REVIEW',
      changes_requested: 'VENDORS.REVIEW_STATE.CHANGES_REQUESTED',
      awaiting_submission: 'VENDORS.REVIEW_STATE.AWAITING',
      rejected: 'COMMON.REJECTED'
    };
    return map[state] || 'COMMON.PENDING';
  }

  getReviewStateVariant(state: VendorReviewState): any {
    switch (state) {
      case 'submitted': return 'warning';
      case 'under_review': return 'info';
      case 'changes_requested': return 'warning';
      case 'verified': return 'success';
      case 'rejected': return 'danger';
      default: return 'neutral';
    }
  }

  viewDetails(vendor: Vendor): void {
    this.router.navigate(['/vendors/view', vendor.id]);
  }
}
