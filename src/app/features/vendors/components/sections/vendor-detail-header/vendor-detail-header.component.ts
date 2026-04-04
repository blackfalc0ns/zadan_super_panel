import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DetailTabNavItem, DetailTabsNavComponent } from '@shared/components/ui/detail-tabs-nav/detail-tabs-nav.component';
import { VendorDetail } from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

interface Tab {
  id: string;
  labelKey: string;
  active: boolean;
}

@Component({
  selector: 'app-vendor-detail-header',
  standalone: true,
  imports: [CommonModule, TranslateModule, DetailTabsNavComponent],
  templateUrl: './vendor-detail-header.component.html',
  styleUrls: ['./vendor-detail-header.component.scss']
})
export class VendorDetailHeaderComponent implements OnChanges {
  @Output() tabChanged = new EventEmitter<string>();
  @Input() activeTab = 'overview';

  currentLang = 'ar';
  isRTL = true;

  title = '';
  vendorId = 'VND-9928';
  registrationDate = '';
  category = '';
  statusLabelKey = 'VENDORS.STATUS.PENDING';
  verificationLabelKey = 'VENDORS.STATUS.PENDING';

  tabs: Tab[] = [
    { id: 'overview', labelKey: 'VENDOR_DETAIL.TAB_OVERVIEW', active: true },
    { id: 'data', labelKey: 'VENDOR_DETAIL.TAB_BASIC_DATA', active: false },
    { id: 'analytics', labelKey: 'VENDOR_DETAIL.TAB_ANALYTICS', active: false },
    { id: 'products', labelKey: 'VENDOR_DETAIL.TAB_PRODUCTS', active: false },
    { id: 'orders', labelKey: 'VENDOR_DETAIL.TAB_ORDERS', active: false },
    { id: 'finance', labelKey: 'VENDOR_DETAIL.TAB_FINANCE', active: false },
    { id: 'compliance', labelKey: 'VENDOR_DETAIL.TAB_COMPLIANCE', active: false },
    { id: 'logs', labelKey: 'VENDOR_DETAIL.TAB_LOGS', active: false },
    { id: 'settings', labelKey: 'VENDOR_DETAIL.TAB_SETTINGS', active: false }
  ];

  private vendor: VendorDetail | null = null;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly translate: TranslateService,
    private readonly vendorDetailFacade: VendorDetailFacade
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';
    this.updateHeaderContent();

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
        this.updateHeaderContent();
      });

    this.vendorDetailFacade.vendor$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendor) => {
        this.vendor = vendor;
        this.updateHeaderContent();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeTab']?.currentValue) {
      this.tabs.forEach((tab) => {
        tab.active = tab.id === changes['activeTab'].currentValue;
      });
    }
  }

  onTabClick(tabId: string): void {
    this.tabs.forEach((tab) => {
      tab.active = tab.id === tabId;
    });
    this.tabChanged.emit(tabId);
  }

  onShare(): void {
    if (typeof window === 'undefined') {
      return;
    }

    void navigator.clipboard?.writeText(window.location.href);
  }

  onPrint(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.print();
  }

  onQuickContact(): void {
    if (typeof window === 'undefined' || !this.vendor) {
      return;
    }

    const email = this.vendor.ownerEmail || this.vendor.contactEmail;
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  }

  get navTabs(): DetailTabNavItem[] {
    return this.tabs.map((tab) => ({
      id: tab.id,
      labelKey: tab.labelKey
    }));
  }

  private updateHeaderContent(): void {
    this.title = this.vendor
      ? (this.currentLang === 'ar' ? this.vendor.businessNameAr : this.vendor.businessNameEn)
      : this.translate.instant('VENDOR_DETAIL.HEADER_TITLE');
    this.vendorId = this.vendor?.id ?? 'VND-9928';
    this.registrationDate = this.vendor?.createdAtUtc
      ? new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).format(new Date(this.vendor.createdAtUtc))
      : this.translate.instant('VENDOR_DETAIL.REGISTERED_SINCE');
    this.category = this.vendor?.businessType ?? this.translate.instant('VENDOR_DETAIL.CATEGORY_VALUE');
    this.statusLabelKey = this.resolveStatusLabelKey(this.vendor);
    this.verificationLabelKey = this.resolveVerificationLabelKey(this.vendor);
  }

  private resolveStatusLabelKey(vendor: VendorDetail | null): string {
    const map: Record<string, string> = {
      Active: 'COMMON.ACTIVE',
      Pending: 'VENDORS.STATUS.PENDING',
      Suspended: 'VENDORS.STATUS.SUSPENDED',
      Rejected: 'VENDORS.STATUS.REJECTED'
    };

    return map[vendor?.status ?? ''] ?? 'VENDORS.STATUS.PENDING';
  }

  private resolveVerificationLabelKey(vendor: VendorDetail | null): string {
    const map: Record<string, string> = {
      Verified: 'VENDOR_DETAIL.STATUS_VERIFIED',
      Pending: 'VENDORS.STATUS.PENDING',
      Unverified: 'VENDOR_REVIEW.STATUS.UNVERIFIED'
    };

    return map[vendor?.verificationStatus ?? ''] ?? 'VENDORS.STATUS.PENDING';
  }
}
