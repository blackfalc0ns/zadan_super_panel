import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { DataTableComponent, TableColumn } from '../../../shared/components/ui/data-table/data-table.component';
import { InlineBannerComponent } from '../../../shared/components/ui/inline-banner/inline-banner.component';
import { KeyValueGridComponent, KeyValueGridItem } from '../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { KpiCardsComponent, KPICard } from '../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { AppPageHeaderComponent } from '../../../shared/components/ui/page-header/page-header.component';
import { SectionHeaderComponent } from '../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../shared/components/ui/status-pill/status-pill.component';
import { CUSTOMER_DETAIL_RECORDS, getCustomerDetailById } from '../customers.mock';
import { CustomerDetailRecord, CustomerRecentOrder } from '../customers.models';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AppPageHeaderComponent,
    KpiCardsComponent,
    SectionHeaderComponent,
    StatusPillComponent,
    KeyValueGridComponent,
    DataTableComponent,
    InlineBannerComponent
  ],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent implements OnInit {
  customer: CustomerDetailRecord | null = null;
  quickNote = '';
  isFlaggedForReview = false;

  readonly recentOrdersColumns: TableColumn[] = [
    { key: 'id', title: 'CUSTOMERS.DETAIL.ORDERS_TABLE.ORDER_ID', width: '26%', align: 'left', type: 'custom' },
    { key: 'date', title: 'CUSTOMERS.DETAIL.ORDERS_TABLE.DATE', width: '22%', align: 'left', type: 'custom' },
    { key: 'total', title: 'CUSTOMERS.DETAIL.ORDERS_TABLE.AMOUNT', width: '22%', align: 'left', type: 'custom' },
    { key: 'status', title: 'CUSTOMERS.DETAIL.ORDERS_TABLE.STATUS', width: '22%', align: 'left', type: 'custom' },
    { key: 'open', title: '', width: '8%', align: 'center', type: 'custom' }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.customer = getCustomerDetailById(id) ?? CUSTOMER_DETAIL_RECORDS[0];
      this.isFlaggedForReview = this.customer?.risk === 'high' || this.customer?.risk === 'critical';
    });
  }

  get kpiCards(): KPICard[] {
    if (!this.customer) {
      return [];
    }

    return [
      {
        id: 'orders',
        title: 'CUSTOMERS.DETAIL.METRICS.TOTAL_ORDERS',
        value: this.customer.totalOrders,
        icon: '<span class="material-symbols-outlined text-[20px]">shopping_bag</span>',
        color: '#127c8c'
      },
      {
        id: 'spent',
        title: 'CUSTOMERS.DETAIL.METRICS.TOTAL_SPENT',
        value: `${this.customer.totalSpent.toLocaleString('en-US')} ${'ر.س'}`,
        icon: '<span class="material-symbols-outlined text-[20px]">payments</span>',
        color: '#0f766e'
      },
      {
        id: 'last-order',
        title: 'CUSTOMERS.DETAIL.METRICS.LAST_ORDER',
        value: this.customer.lastOrderAt,
        icon: '<span class="material-symbols-outlined text-[20px]">schedule</span>',
        color: '#64748b'
      },
      {
        id: 'complaints',
        title: 'CUSTOMERS.DETAIL.METRICS.COMPLAINTS',
        value: this.customer.disputesCount,
        icon: '<span class="material-symbols-outlined text-[20px]">support_agent</span>',
        color: '#f59e0b'
      },
      {
        id: 'refunds',
        title: 'CUSTOMERS.DETAIL.METRICS.REFUNDS',
        value: this.customer.refundsCount,
        icon: '<span class="material-symbols-outlined text-[20px]">keyboard_return</span>',
        color: '#ef4444'
      },
      {
        id: 'risk-score',
        title: 'CUSTOMERS.DETAIL.METRICS.RISK_SCORE',
        value: `${this.customer.riskScore}%`,
        icon: '<span class="material-symbols-outlined text-[20px]">verified_user</span>',
        color: '#127c8c',
        trend: {
          value: this.translate.instant(this.customer.riskSummary),
          label: this.translate.instant(this.customer.riskSummary),
          isPositive: this.customer.risk === 'low' || this.customer.risk === 'medium'
        }
      }
    ];
  }

  get profileItems(): KeyValueGridItem[] {
    if (!this.customer) {
      return [];
    }

    return [
      {
        label: 'CUSTOMERS.DETAIL.PROFILE_FIELDS.FULL_NAME',
        value: this.customer.name,
        translateValue: false
      },
      {
        label: 'CUSTOMERS.DETAIL.PROFILE_FIELDS.PHONE',
        value: this.customer.phone,
        translateValue: false,
        valueDir: 'ltr'
      },
      {
        label: 'CUSTOMERS.DETAIL.PROFILE_FIELDS.EMAIL',
        value: this.customer.email,
        translateValue: false,
        valueDir: 'ltr'
      },
      {
        label: 'CUSTOMERS.DETAIL.PROFILE_FIELDS.CITY',
        value: this.customer.city,
        translateValue: false
      },
      {
        label: 'CUSTOMERS.DETAIL.PROFILE_FIELDS.LANGUAGE',
        value: this.customer.preferredLanguageLabel,
        translateValue: false
      },
      {
        label: 'CUSTOMERS.DETAIL.PROFILE_FIELDS.LAST_SEEN',
        value: this.customer.lastSeenAt,
        translateValue: false
      }
    ];
  }

  get behaviorItems(): KeyValueGridItem[] {
    if (!this.customer) {
      return [];
    }

    return [
      {
        label: 'CUSTOMERS.DETAIL.BEHAVIOR_FIELDS.REFUND_RISK',
        value: this.customer.riskSummary,
        translateValue: true,
        valueTone: this.customer.risk === 'critical' || this.customer.risk === 'high' ? 'danger' : 'accent'
      },
      {
        label: 'CUSTOMERS.DETAIL.BEHAVIOR_FIELDS.SUSPICIOUS_LOGINS',
        value: this.customer.suspiciousLoginAttempts,
        translateValue: false
      },
      {
        label: 'CUSTOMERS.DETAIL.BEHAVIOR_FIELDS.PAYMENT_FAILURES',
        value: this.customer.repeatedPaymentFailureRate,
        translateValue: false,
        valueDir: 'ltr'
      },
      {
        label: 'CUSTOMERS.DETAIL.BEHAVIOR_FIELDS.COMPLAINT_FREQUENCY',
        value: this.customer.complaintRateLabel,
        translateValue: false
      }
    ];
  }

  get statusVariant(): StatusPillVariant {
    if (!this.customer) {
      return 'neutral';
    }

    const map: Record<string, StatusPillVariant> = {
      active: 'success',
      low_activity: 'warning',
      restricted: 'paused',
      dormant: 'neutral'
    };

    return map[this.customer.status] ?? 'neutral';
  }

  get riskVariant(): StatusPillVariant {
    if (!this.customer) {
      return 'neutral';
    }

    if (this.customer.risk === 'critical' || this.customer.risk === 'high') {
      return 'high-risk';
    }

    if (this.customer.risk === 'medium') {
      return 'warning';
    }

    return 'success';
  }

  get verificationVariant(): StatusPillVariant {
    return this.customer?.isVerified ? 'success' : 'warning';
  }

  get recentOrders(): CustomerRecentOrder[] {
    return this.customer?.recentOrders ?? [];
  }

  openOrdersList(): void {
    this.router.navigate(['/orders']);
  }

  openCasesList(): void {
    this.router.navigate(['/disputes']);
  }

  toggleReviewFlag(): void {
    this.isFlaggedForReview = !this.isFlaggedForReview;
  }

  addQuickNote(): void {
    const note = this.quickNote.trim();

    if (!note || !this.customer) {
      return;
    }

    this.customer.internalNotes = [
      {
        author: 'Admin User',
        role: this.customer.accountManager,
        createdAt: '2026/03/23 04:00 PM',
        message: note
      },
      ...this.customer.internalNotes
    ];
    this.quickNote = '';
  }

  openOrder(order: CustomerRecentOrder): void {
    this.router.navigate(['/orders', order.id]);
  }

  getOrderStatusVariant(status: CustomerRecentOrder['status']): StatusPillVariant {
    const map: Record<CustomerRecentOrder['status'], StatusPillVariant> = {
      DELIVERED: 'success',
      REFUNDED: 'danger',
      PROCESSING: 'warning'
    };

    return map[status];
  }

  getOrderStatusLabel(status: CustomerRecentOrder['status']): string {
    return `CUSTOMERS.DETAIL.ORDER_STATUS.${status}`;
  }
}
