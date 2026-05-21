import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';

import {
  AdminDriverNotificationResponse,
  DriverService
} from '@drivers/services/drivers.api.service';
import {
  DriverDetailRecord,
  DriverDocumentRecord,
  DriverIncidentRecord,
  DriverTaskAssignment,
  DriverWorkflowActionId
} from '@drivers/models/drivers.models';
import { DriverLifecycleTabId, DriverPreviewType } from '@drivers/models/driver-view.types';
import { DriverDetailViewComponent } from '@drivers/components/driver-detail-view/driver-detail-view.component';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-driver-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule, DriverDetailViewComponent],
  templateUrl: './driver-detail.component.html'
})
export class DriverDetailComponent implements OnInit, OnDestroy {
  driverId: string | null = null;
  driver: DriverDetailRecord | null = null;
  isLoading = true;
  isMutating = false;
  isSendingTestNotification = false;
  error: string | null = null;
  activeTab: DriverLifecycleTabId = 'overview';
  quickNote = '';
  reviewerDecisionNote = '';
  internalReviewNote = '';
  selectedRejectionReason = '';
  showTestNotificationComposer = false;
  testNotificationTitle = '';
  testNotificationBody = '';
  testNotificationTargetUrl = '/notifications';
  testNotificationType = 'driver_test';
  testNotificationSendPush = true;
  previewType: DriverPreviewType | null = null;
  selectedTask: DriverTaskAssignment | null = null;
  selectedIncident: DriverIncidentRecord | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly driverService: DriverService,
    private readonly translate: TranslateService,
    private readonly toastService: ToastService
  ) {}

  get isRTL(): boolean {
    return this.translate.currentLang !== 'en';
  }

  ngOnInit(): void {
    // Read initial tab from query params synchronously to avoid flash of default tab
    const initialTab = this.route.snapshot.queryParamMap.get('tab') as DriverLifecycleTabId;
    if (initialTab) {
      this.activeTab = initialTab;
    }

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.driverId = params.get('id');
      if (this.driverId) {
        this.loadDriver(this.driverId);
      } else {
        this.error = this.t('DRIVERS.DETAIL.MESSAGES.INVALID_DRIVER_ID');
        this.isLoading = false;
      }
    });

    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const tab = params.get('tab') as DriverLifecycleTabId;
      if (tab) {
        this.activeTab = tab;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDriver(id: string, showLoading = true): void {
    if (showLoading) {
      this.isLoading = true;
    }
    this.error = null;

    this.driverService.getDriverDetailRecordById(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        if (data) {
          this.driver = data;
        } else {
          this.driver = null;
          this.error = this.t('DRIVERS.DETAIL.MESSAGES.DRIVER_NOT_FOUND');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load driver', err);
        this.driver = null;
        this.error = this.t('DRIVERS.DETAIL.MESSAGES.LOAD_DETAILS_FAILED');
        this.isLoading = false;
      }
    });
  }

  setTab(tab: DriverLifecycleTabId): void {
    this.activeTab = tab;
    // Update URL query param without blocking - use replaceUrl to avoid history entries
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true
    }).catch(() => {
      // Navigation might fail silently - tab is already set above
    });
  }

  goBack(): void {
    this.router.navigate(['/drivers']);
  }

  openTaskPreview(task: DriverTaskAssignment): void {
    this.selectedTask = task;
    this.selectedIncident = null;
    this.previewType = 'task';
  }

  openIncidentPreview(incident: DriverIncidentRecord): void {
    this.selectedIncident = incident;
    this.selectedTask = null;
    this.previewType = 'incident';
  }

  closePreview(): void {
    this.previewType = null;
    this.selectedTask = null;
    this.selectedIncident = null;
  }

  addQuickNote(): void {
    if (!this.driverId || this.isMutating) {
      return;
    }

    const message = this.quickNote.trim();
    if (!message) {
      this.toastService.warning(this.t('DRIVERS.DETAIL.MESSAGES.WRITE_NOTE_FIRST'));
      return;
    }

    this.runMutation(
      () => this.driverService.addDriverNote(this.driverId!, message),
      this.t('DRIVERS.DETAIL.MESSAGES.NOTE_ADDED'),
      () => {
        this.quickNote = '';
      }
    );
  }

  requestReviewAction(action: 'approve' | 'request-docs' | 'reject'): void {
    if (!this.driverId || this.isMutating) {
      return;
    }

    if (action === 'approve' && this.driver) {
      const approvalBlockerMessage = this.buildApprovalBlockerMessage(this.driver);
      if (approvalBlockerMessage) {
        this.toastService.warning(approvalBlockerMessage);
        return;
      }
    }

    this.runMutation(
      () => this.driverService.reviewDriver(this.driverId!, action, this.composeReviewNote()),
      this.getReviewSuccessMessage(action)
    );
  }

  approveDocument(document: DriverDocumentRecord): void {
    if (!this.driverId || this.isMutating || !document.documentType) {
      return;
    }

    this.runMutation(
      () => this.driverService.approveDriverDocument(this.driverId!, document.documentType!),
      this.t('DRIVERS.DETAIL.MESSAGES.DOCUMENT_APPROVED')
    );
  }

  rejectDocument(event: { document: DriverDocumentRecord; reason: string }): void {
    if (!this.driverId || this.isMutating || !event.document.documentType) {
      return;
    }

    this.runMutation(
      () => this.driverService.rejectDriverDocument(this.driverId!, event.document.documentType!, event.reason),
      this.t('DRIVERS.DETAIL.MESSAGES.DOCUMENT_REJECTED')
    );
  }

  toggleSuspension(): void {
    if (!this.driverId || !this.driver || this.isMutating) {
      return;
    }

    if (this.driver.status === 'Suspended' || this.driver.status === 'Banned') {
      this.runMutation(
        () => this.driver!.status === 'Banned'
          ? this.driverService.unbanDriver(this.driverId!)
          : this.driverService.reactivateDriver(this.driverId!),
        this.t('DRIVERS.DETAIL.MESSAGES.DRIVER_REACTIVATED')
      );
      return;
    }

    this.runMutation(
      () => this.driverService.suspendDriver(this.driverId!, this.composeReviewNote()),
      this.t('DRIVERS.DETAIL.MESSAGES.DRIVER_SUSPENDED')
    );
  }

  banDriver(): void {
    if (!this.driverId || !this.driver || this.isMutating) {
      return;
    }

    if (this.driver.status === 'Banned') {
      this.runMutation(
        () => this.driverService.unbanDriver(this.driverId!),
        this.t('DRIVERS.DETAIL.MESSAGES.DRIVER_REACTIVATED')
      );
      return;
    }

    this.runMutation(
      () => this.driverService.banDriver(this.driverId!, this.composeReviewNote()),
      this.t('DRIVERS.DETAIL.MESSAGES.DRIVER_BANNED')
    );
  }

  clearDriverRestrictions(): void {
    if (!this.driverId || !this.driver || this.isMutating) {
      return;
    }

    this.runMutation(
      () => this.driverService.clearDriverRestrictions(this.driverId!, this.composeReviewNote()),
      this.t('DRIVERS.DETAIL.MESSAGES.DRIVER_RESTRICTIONS_CLEARED')
    );
  }

  toggleLoginLock(): void {
    if (!this.driverId || !this.driver || this.isMutating) {
      return;
    }

    const isLocked = this.driver.isLoginLocked;
    this.runMutation(
      () => isLocked
        ? this.driverService.unlockDriverLogin(this.driverId!)
        : this.driverService.lockDriverLogin(this.driverId!, this.composeReviewNote()),
      this.getLoginLockSuccessMessage(isLocked ? 'unlock' : 'lock')
    );
  }

  updateLocationAccess(action: 'block' | 'unblock'): void {
    if (!this.driverId || !this.driver || this.isMutating) {
      return;
    }

    this.runMutation(
      () => action === 'unblock'
        ? this.driverService.unblockDriverLocationUpdates(this.driverId!)
        : this.driverService.blockDriverLocationUpdates(this.driverId!),
      this.getLocationAccessSuccessMessage(action)
    );
  }

  executeWorkflowAction(actionId: DriverWorkflowActionId): void {
    if (this.isMutating) {
      return;
    }

    switch (actionId) {
      case 'APPROVE_VERIFICATION':
        this.requestReviewAction('approve');
        break;
      case 'REQUEST_DOCUMENTS':
        this.requestReviewAction('request-docs');
        break;
      case 'REJECT_VERIFICATION':
        this.requestReviewAction('reject');
        break;
      case 'SUSPEND_DRIVER':
      case 'REACTIVATE_DRIVER':
        this.toggleSuspension();
        break;
      case 'BAN_DRIVER':
      case 'UNBAN_DRIVER':
        this.banDriver();
        break;
      case 'CLEAR_DRIVER_RESTRICTIONS':
        this.clearDriverRestrictions();
        break;
      default:
        this.openWorkflowContext(actionId);
        break;
    }
  }

  sendTestNotification(): void {
    if (!this.driverId || !this.driver || this.isSendingTestNotification) {
      return;
    }

    this.isSendingTestNotification = true;
    const driver = this.driver;
    const displayName = `${driver.firstName} ${driver.lastName}`.trim();

    this.driverService.sendTestNotification(this.driverId, {
      titleAr: 'إشعار تجريبي من الأدمن',
      titleEn: this.testNotificationTitle.trim() || 'Admin mobile test notification',
      bodyAr: `هذا إشعار تجريبي للمندوب ${displayName || driver.driverId} للتأكد من وصول إشعارات تطبيق المندوب.`,
      bodyEn: this.testNotificationBody.trim() || `This is a test mobile notification for ${displayName || driver.driverId}.`,
      type: this.testNotificationType.trim() || 'driver_test',
      targetUrl: this.testNotificationTargetUrl.trim() || null,
      sendPush: this.testNotificationSendPush
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isSendingTestNotification = false;
      })
    ).subscribe({
      next: (response) => {
        this.showNotificationResult(response);
      },
      error: (err) => {
        console.error('Driver test notification failed', err);
        this.toastService.error(
          this.describeApiError(err),
          this.t('DRIVERS.DETAIL.TEST_NOTIFICATION.TOAST_TITLE')
        );
      }
    });
  }

  toggleTestNotificationComposer(): void {
    this.showTestNotificationComposer = !this.showTestNotificationComposer;
  }

  private runMutation(
    requestFactory: () => ReturnType<DriverService['addDriverNote']>,
    successMessage: string,
    afterSuccess?: () => void
  ): void {
    if (!this.driverId) {
      return;
    }

    this.isMutating = true;
    requestFactory().pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isMutating = false;
      })
    ).subscribe({
      next: () => {
        afterSuccess?.();
        this.toastService.success(successMessage);
        this.loadDriver(this.driverId!, false);
      },
      error: (err) => {
        console.error('Driver mutation failed', err);
        this.toastService.error(this.describeApiError(err));
      }
    });
  }

  private composeReviewNote(): string | undefined {
    const parts = [
      this.selectedRejectionReason,
      this.reviewerDecisionNote,
      this.internalReviewNote
    ]
      .map((item) => item.trim())
      .filter(Boolean);

    return parts.length ? parts.join('\n') : undefined;
  }

  private openWorkflowContext(actionId: DriverWorkflowActionId): void {
    const action = this.driver?.workflow.actions.find((item) => item.id === actionId);
    if (action?.targetTab) {
      this.activeTab = action.targetTab;
    }

    this.toastService.info(this.t('DRIVERS.DETAIL.MESSAGES.OPENED_RELATED_SECTION'));
  }

  private getReviewSuccessMessage(action: 'approve' | 'request-docs' | 'reject'): string {
    switch (action) {
      case 'approve':
        return this.t('DRIVERS.DETAIL.MESSAGES.VERIFICATION_APPROVED');
      case 'request-docs':
        return this.t('DRIVERS.DETAIL.MESSAGES.DOCUMENT_REQUEST_SUBMITTED');
      case 'reject':
        return this.t('DRIVERS.DETAIL.MESSAGES.VERIFICATION_REJECTED');
    }
  }

  private getLocationAccessSuccessMessage(action: 'block' | 'unblock'): string {
    return this.t(action === 'unblock'
      ? 'DRIVERS.DETAIL.MESSAGES.LOCATION_UPDATES_UNBLOCKED'
      : 'DRIVERS.DETAIL.MESSAGES.LOCATION_UPDATES_BLOCKED');
  }

  private getLoginLockSuccessMessage(action: 'lock' | 'unlock'): string {
    return this.t(action === 'unlock'
      ? 'DRIVERS.DETAIL.MESSAGES.LOGIN_UNLOCKED'
      : 'DRIVERS.DETAIL.MESSAGES.LOGIN_LOCKED');
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }

  private buildApprovalBlockerMessage(driver: DriverDetailRecord): string | null {
    const invalidDocuments = driver.documents
      .filter((document) => document.status !== 'valid')
      .map((document) => this.t(document.title));

    const incompleteChecklist = driver.verification.checklist
      .filter((item) => !item.completed)
      .map((item) => this.t(item.label));

    if (!invalidDocuments.length && driver.profileReadiness.isProfileComplete) {
      return null;
    }

    const documentSummary = invalidDocuments.length
      ? `${this.t('DRIVERS.DETAIL.MESSAGES.APPROVAL_BLOCKED_DOCUMENTS')} ${invalidDocuments.join('، ')}.`
      : '';

    const checklistSummary = incompleteChecklist.length
      ? `${this.t('DRIVERS.DETAIL.MESSAGES.APPROVAL_BLOCKED_REQUIREMENTS')} ${incompleteChecklist.join('، ')}.`
      : '';

    return [
      this.t('DRIVERS.DETAIL.MESSAGES.APPROVAL_BLOCKED'),
      documentSummary,
      checklistSummary
    ]
      .filter(Boolean)
      .join(' ');
  }

  private showNotificationResult(response: AdminDriverNotificationResponse): void {
    const title = this.t('DRIVERS.DETAIL.TEST_NOTIFICATION.TOAST_TITLE');

    if (response.pushSent) {
      this.toastService.success(
        this.t('DRIVERS.DETAIL.MESSAGES.TEST_NOTIFICATION_PUSH_SENT'),
        title
      );
      return;
    }

    if (response.pushSkipped) {
      this.toastService.warning(
        response.pushReason?.trim() || this.t('DRIVERS.DETAIL.MESSAGES.TEST_NOTIFICATION_INBOX_ONLY'),
        title
      );
      return;
    }

    this.toastService.warning(
      response.pushReason?.trim() || this.t('DRIVERS.DETAIL.MESSAGES.TEST_NOTIFICATION_UNCONFIRMED'),
      title
    );
  }

  private describeApiError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const validation = error.error?.errors as Record<string, string[]> | undefined;
      if (validation) {
        const firstKey = Object.keys(validation)[0];
        const firstMessage = firstKey ? validation[firstKey]?.[0] : null;
        if (firstMessage) {
          return firstMessage;
        }
      }

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

    return this.t('DRIVERS.DETAIL.MESSAGES.TEST_NOTIFICATION_FAILED');
  }
}
