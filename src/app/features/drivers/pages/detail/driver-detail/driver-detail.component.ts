import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';

import { DriverService } from '@drivers/services/drivers.api.service';
import {
  DriverDetailRecord,
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
  error: string | null = null;
  activeTab: DriverLifecycleTabId = 'overview';
  quickNote = '';
  reviewerDecisionNote = '';
  internalReviewNote = '';
  selectedRejectionReason = '';
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
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
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

    this.runMutation(
      () => this.driverService.reviewDriver(this.driverId!, action, this.composeReviewNote()),
      this.getReviewSuccessMessage(action)
    );
  }

  toggleSuspension(): void {
    if (!this.driverId || !this.driver || this.isMutating) {
      return;
    }

    if (this.driver.status === 'Suspended') {
      this.runMutation(
        () => this.driverService.reactivateDriver(this.driverId!),
        this.t('DRIVERS.DETAIL.MESSAGES.DRIVER_REACTIVATED')
      );
      return;
    }

    this.runMutation(
      () => this.driverService.suspendDriver(this.driverId!, this.composeReviewNote()),
      this.t('DRIVERS.DETAIL.MESSAGES.DRIVER_SUSPENDED')
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
      default:
        this.openWorkflowContext(actionId);
        break;
    }
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
        this.toastService.error(this.t('DRIVERS.DETAIL.MESSAGES.ACTION_FAILED'));
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
    if (this.isRTL) {
      return action === 'unblock'
        ? 'تم فك الحظر الموقعي لهذا السائق'
        : 'تم إيقاف تحديثات الموقع لهذا السائق';
    }

    return action === 'unblock'
      ? 'Location updates were unblocked for this driver'
      : 'Location updates were blocked for this driver';
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }
}
