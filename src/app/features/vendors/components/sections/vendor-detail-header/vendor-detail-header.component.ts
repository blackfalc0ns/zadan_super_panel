import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, OnChanges, SimpleChanges, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { DetailTabNavItem, DetailTabsNavComponent } from '@shared/components/ui/detail-tabs-nav/detail-tabs-nav.component';
import { ToastService } from '@shared/services/toast.service';
import { VendorDetail } from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

interface Tab {
  id: string;
  labelKey: string;
  active: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-vendor-detail-header',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, DetailTabsNavComponent, HasPermissionDirective],
  templateUrl: './vendor-detail-header.component.html',
  styleUrls: ['./vendor-detail-header.component.scss']
})
export class VendorDetailHeaderComponent implements OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);
  @Input() activeTab = 'overview';

  currentLang = 'ar';
  isRTL = true;

  title = '';
  vendorId = '';
  registrationDate = '';
  cityLabel = '';
  statusLabelKey = 'VENDORS.STATUS.PENDING';
  verificationLabelKey = 'VENDORS.STATUS.PENDING';
  performanceRating = 0;
  riskLevelLabelKey = 'VENDORS.RISK_LEVEL.LOW';
  reviewStateLabelKey = 'VENDOR_REVIEW.STATE.UNKNOWN';
  isSendingTestNotification = false;
  isMessageComposerOpen = false;
  messageTitleAr = '';
  messageTitleEn = '';
  messageBodyAr = '';
  messageBodyEn = '';
  messageSendInbox = true;
  messageSendPush = true;
  messageSendEmail = true;

  tabs: Tab[] = [
    { id: 'overview', labelKey: 'VENDOR_DETAIL.TAB_OVERVIEW', active: true },
    { id: 'data', labelKey: 'VENDOR_DETAIL.TAB_BASIC_DATA', active: false },
    { id: 'analytics', labelKey: 'VENDOR_DETAIL.TAB_ANALYTICS', active: false },
    { id: 'products', labelKey: 'VENDOR_DETAIL.TAB_PRODUCTS', active: false },
    { id: 'orders', labelKey: 'VENDOR_DETAIL.TAB_ORDERS', active: false },
    { id: 'disputes', labelKey: 'VENDOR_DETAIL.TAB_DISPUTES', active: false },
    { id: 'finance', labelKey: 'VENDOR_DETAIL.TAB_FINANCE', active: false },
    { id: 'compliance', labelKey: 'VENDOR_DETAIL.TAB_COMPLIANCE', active: false },
    { id: 'logs', labelKey: 'VENDOR_DETAIL.TAB_LOGS', active: false },
    { id: 'settings', labelKey: 'VENDOR_DETAIL.TAB_SETTINGS', active: false }
  ];

  vendor: VendorDetail | null = null;
  isWorkspaceLoading = false;
  routeVendorId = '';
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly translate: TranslateService,
    private readonly vendorDetailFacade: VendorDetailFacade,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';
    this.updateHeaderContent();

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
      this.cdr.markForCheck();
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
        this.updateHeaderContent();
      });

    this.vendorDetailFacade.vendor$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendor) => {
      this.cdr.markForCheck();
        this.vendor = vendor;
        this.updateHeaderContent();
      });

    this.vendorDetailFacade.isVendorWorkspaceLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => {
        this.isWorkspaceLoading = loading;
        this.cdr.markForCheck();
      });

    this.vendorDetailFacade.vendorId$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendorId) => {
        this.routeVendorId = vendorId ?? '';
        this.cdr.markForCheck();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeTab']?.currentValue) {
      this.tabs.forEach((tab) => {
        tab.active = tab.id === changes['activeTab'].currentValue;
      });
    }
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

  openAccessDirectory(): void {
    if (!this.vendor) {
      return;
    }

    this.router.navigate(['/admin-users'], {
      queryParams: {
        audience: 'vendor_network',
        panel: 'vendor_panel',
        vendor: this.vendor.id
      }
    });
  }

  openEmailRouting(): void {
    if (!this.vendor) {
      return;
    }

    this.router.navigate(['/email-center'], {
      queryParams: {
        audience: 'vendor_network',
        vendor: this.vendor.id,
        entityId: this.vendor.id
      }
    });
  }

  sendTestNotification(): void {
    if (!this.vendor || this.isSendingTestNotification) {
      return;
    }

    const displayName = this.getDisplayStoreName(this.vendor);

    this.isSendingTestNotification = true;
    this.vendorDetailFacade.sendVendorMessageRequest({
      titleAr: 'إشعار اختبار من الأدمن',
      titleEn: 'Admin test notification',
      bodyAr: `هذا إشعار تجريبي للمتجر ${displayName} للتأكد من وصول الإشعارات في لوحة التاجر.`,
      bodyEn: `This is a test notification for ${displayName} to verify delivery in the vendor panel.`,
      type: 'vendor_admin_test',
      targetUrl: '/alerts',
      sendInbox: true,
      sendPush: true,
      sendEmail: true
    }).subscribe({
      next: (response) => {
        this.cdr.markForCheck();
        this.isSendingTestNotification = false;
        this.showTestNotificationResult(response);
      },
      error: (error) => {
        this.cdr.markForCheck();
        this.isSendingTestNotification = false;
        this.toastService.error(
          this.resolveApiError(error),
          this.notificationToastTitle
        );
      }
    });
  }

  openMessageComposer(): void {
    if (!this.vendor || this.isSendingTestNotification) {
      return;
    }

    const displayName = this.getDisplayStoreName(this.vendor);
    this.messageTitleAr = 'رسالة من إدارة زدنا';
    this.messageTitleEn = 'Message from Zadana admin';
    this.messageBodyAr = `مرحبًا ${displayName}، يوجد تحديث مهم من فريق الإدارة.`;
    this.messageBodyEn = `Hello ${displayName}, there is an important update from the admin team.`;
    this.messageSendInbox = true;
    this.messageSendPush = true;
    this.messageSendEmail = true;
    this.isMessageComposerOpen = true;
  }

  closeMessageComposer(): void {
    if (!this.isSendingTestNotification) {
      this.isMessageComposerOpen = false;
    }
  }

  sendVendorMessage(): void {
    if (!this.vendor || this.isSendingTestNotification) {
      return;
    }

    this.isSendingTestNotification = true;
    this.vendorDetailFacade.sendVendorMessageRequest({
      titleAr: this.messageTitleAr,
      titleEn: this.messageTitleEn,
      bodyAr: this.messageBodyAr,
      bodyEn: this.messageBodyEn,
      type: 'vendor_admin_message',
      targetUrl: '/alerts',
      sendInbox: this.messageSendInbox,
      sendPush: this.messageSendPush,
      sendEmail: this.messageSendEmail
    }).subscribe({
      next: (response) => {
        this.cdr.markForCheck();
        this.isSendingTestNotification = false;
        this.isMessageComposerOpen = false;
        this.showTestNotificationResult(response);
      },
      error: (error) => {
        this.cdr.markForCheck();
        this.isSendingTestNotification = false;
        this.toastService.error(
          this.resolveApiError(error),
          this.notificationToastTitle
        );
      }
    });
  }

  get navTabs(): DetailTabNavItem[] {
    return this.tabs.map((tab) => ({
      id: tab.id,
      labelKey: tab.labelKey,
      route: tab.id
    }));
  }

  get sendTestNotificationLabel(): string {
    return this.translate.instant('VENDOR_DETAIL.MESSAGE_COMPOSER.SEND_TEST_NOTIFICATION');
  }

  get sendingTestNotificationLabel(): string {
    return this.translate.instant('VENDOR_DETAIL.MESSAGE_COMPOSER.SENDING');
  }

  get notificationToastTitle(): string {
    return this.translate.instant('VENDOR_DETAIL.MESSAGE_COMPOSER.TOAST_TITLE');
  }


  private updateHeaderContent(): void {
    this.title = this.vendor
      ? this.getDisplayStoreName(this.vendor)
      : this.translate.instant('VENDOR_DETAIL.HEADER_TITLE');
    this.vendorId = this.vendor?.id ?? '';
    this.registrationDate = this.formatRegistrationDate(this.vendor?.createdAtUtc);
    this.cityLabel = this.getLocalizedCity(this.vendor?.city) || this.translate.instant('VENDOR_DETAIL.CITY_NOT_SET');
    this.statusLabelKey = this.resolveStatusLabelKey(this.vendor);
    this.verificationLabelKey = this.resolveVerificationLabelKey(this.vendor);
    this.riskLevelLabelKey = this.resolveRiskLevelLabelKey(this.vendor);
    this.reviewStateLabelKey = this.resolveReviewStateLabelKey(this.vendor);
    this.performanceRating = this.vendor?.performanceRating ?? 0;
  }

  resolveRiskLevelLabelKey(vendor: VendorDetail | null): string {
    const map: Record<string, string> = {
      Low: 'VENDORS.RISK_LEVEL.LOW',
      Medium: 'VENDORS.RISK_LEVEL.MEDIUM',
      High: 'VENDORS.RISK_LEVEL.HIGH',
      Critical: 'VENDORS.RISK_LEVEL.CRITICAL'
    };
    return map[vendor?.riskLevel ?? ''] ?? 'VENDORS.RISK_LEVEL.LOW';
  }

  resolveReviewStateLabelKey(vendor: VendorDetail | null): string {
    const map: Record<string, string> = {
      'awaiting_submission': 'VENDOR_REVIEW.STATE.AWAITING_SUBMISSION',
      'submitted': 'VENDOR_REVIEW.STATE.SUBMITTED',
      'under_review': 'VENDOR_REVIEW.STATE.UNDER_REVIEW',
      'changes_requested': 'VENDOR_REVIEW.STATE.CHANGES_REQUESTED',
      'verified': 'VENDOR_REVIEW.STATE.VERIFIED',
      'rejected': 'VENDOR_REVIEW.STATE.REJECTED',
      'suspended': 'VENDOR_REVIEW.STATE.SUSPENDED'
    };
    return map[vendor?.reviewState ?? ''] ?? 'VENDOR_REVIEW.STATE.UNKNOWN';
  }

  private getDisplayStoreName(vendor: VendorDetail): string {
    const preferred = this.currentLang === 'ar' ? vendor.businessNameAr : vendor.businessNameEn;
    const alternate = this.currentLang === 'ar' ? vendor.businessNameEn : vendor.businessNameAr;
    return preferred?.trim() || alternate?.trim() || vendor.ownerName?.trim() || vendor.contactEmail?.trim() || this.translate.instant('VENDOR_DETAIL.HEADER_TITLE');
  }

  private getLocalizedCity(city?: string | null): string {
    if (!city?.trim()) {
      return '';
    }

    const clean = city.trim();
    const key = `COMMON.CITIES.${clean.toUpperCase()}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : clean;
  }

  private formatRegistrationDate(value?: string | null): string {
    const parsed = this.parseUtcDate(value);
    if (!parsed) {
      return this.translate.instant('VENDOR_DETAIL.REGISTERED_SINCE');
    }

    return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(parsed);
  }

  private parseUtcDate(value?: string | null): Date | null {
    if (!value?.trim()) {
      return null;
    }

    const trimmed = value.trim();
    const normalized = /(?:Z|[+-]\d{2}:\d{2})$/i.test(trimmed) ? trimmed : `${trimmed}Z`;
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
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

  private showTestNotificationResult(response: {
    message?: string | null;
    pushSent?: boolean;
    pushAttempted?: boolean;
    pushSkipped?: boolean;
    pushReason?: string | null;
  }): void {
    if (response.pushSent) {
      this.toastService.success(
        this.translate.instant('VENDOR_DETAIL.MESSAGE_COMPOSER.TOAST_PUSH_SENT'),
        this.notificationToastTitle
      );
      return;
    }

    if (response.pushAttempted && !response.pushSent) {
      this.toastService.warning(
        response.pushReason?.trim() || this.translate.instant('VENDOR_DETAIL.MESSAGE_COMPOSER.TOAST_PUSH_FAILED'),
        this.notificationToastTitle
      );
      return;
    }

    if (response.pushSkipped) {
      this.toastService.info(
        response.pushReason?.trim() || this.translate.instant('VENDOR_DETAIL.MESSAGE_COMPOSER.TOAST_PUSH_SKIPPED'),
        this.notificationToastTitle
      );
      return;
    }

    this.toastService.success(
      response.message?.trim() || this.translate.instant('VENDOR_DETAIL.MESSAGE_COMPOSER.TOAST_CREATED'),
      this.notificationToastTitle
    );
  }

  private resolveApiError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail ?? error.error?.title ?? error.error?.message;
      if (typeof detail === 'string' && detail.trim()) {
        return detail.trim();
      }

      if (typeof error.message === 'string' && error.message.trim()) {
        return error.message.trim();
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message.trim();
    }

    return this.translate.instant('VENDOR_DETAIL.MESSAGE_COMPOSER.ERROR_SEND_FAILED');
  }
}


