import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { RefundCase, RefundStatus } from '../../models/finance.models';
import { FinanceStatusBadgeComponent } from '../../components/finance-status-badge/finance-status-badge.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { getFinanceLocale } from '../../utils/finance-i18n.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-financial-refunds',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterLink,
    FinanceStatusBadgeComponent,
    AppButtonComponent,
    AppCardComponent,
    AppPageHeaderComponent,
    InlineBannerComponent
  ],
  templateUrl: './financial-refunds.component.html'
})
export class FinancialRefundsComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly financeService = inject(FinanceService);
  private readonly translate = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  refunds: RefundCase[] = [];
  loadError = false;
  selectedStatus: 'all' | RefundStatus = 'all';
  searchQuery = '';

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const entityType = params.get('entityType');
      const entityId = params.get('entityId');
      const orderId = params.get('orderId');
      this.loadRefunds({
        entityType: entityType === 'vendor' || entityType === 'driver' ? entityType : undefined,
        entityId: entityId ?? undefined,
        orderId: orderId ?? undefined
      });
    });
  }

  loadRefunds(filter: { entityType?: 'vendor' | 'driver'; entityId?: string; orderId?: string } = {}): void {
    this.loadError = false;
    this.financeService.getRefundCases({
      vendorId: filter.entityType === 'vendor' ? filter.entityId : undefined,
      entityType: filter.entityType,
      entityId: filter.entityType === 'driver' ? filter.entityId : undefined,
      orderId: filter.orderId
    }).pipe(take(1)).subscribe({
      next: (items) => {
        this.refunds = items;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadError = true;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredRefunds(): RefundCase[] {
    return this.refunds.filter((item) => {
      if (this.selectedStatus !== 'all' && item.status !== this.selectedStatus) {
        return false;
      }
      if (!this.searchQuery.trim()) {
        return true;
      }
      const query = this.searchQuery.toLowerCase();
      return [item.caseRef, item.orderRef, item.vendorName, item.driverName, item.reason]
        .some((value) => (value ?? '').toLowerCase().includes(query));
    });
  }

  openInDisputes(refund: RefundCase): void {
    void this.router.navigate(['/disputes'], {
      queryParams: {
        type: 'return_request',
        search: refund.orderRef || refund.orderId,
        focus: refund.id
      }
    });
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString(getFinanceLocale(this.translate.currentLang), {
      timeZone: 'Asia/Riyadh',
      calendar: 'gregory'
    });
  }

  formatNumber(value: number): string {
    return value.toLocaleString(getFinanceLocale(this.translate.currentLang), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  trackById(_: number, refund: RefundCase): string {
    return refund.id;
  }
}
