import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PreviewAction } from '../../../shared/components/ui/quick-preview-drawer/quick-preview-drawer.component';
import { DriverDetailViewComponent } from '../components/driver-detail-view/driver-detail-view.component';
import { buildDriverDetailRecord, getDriverMapPreview } from '../drivers.mock';
import { DriverDetailRecord, DriverIncidentRecord, DriverTaskAssignment, DriverWorkflowActionId } from '../drivers.models';
import { DriverLifecycleTabId, DriverPreviewType } from '../driver-view.types';
import { DriverService } from '../../../core/services/driver.service';
import { WorkflowLinkCard, WorkflowLinksService } from '../../../core/services/workflow-links.service';
import { Driver, DriverStatus, VerificationStatus } from '../../../core/models/driver';

@Component({
  selector: 'app-driver-detail',
  standalone: true,
  imports: [DriverDetailViewComponent],
  templateUrl: './driver-detail.component.html'
})
export class DriverDetailComponent implements OnInit {
  driverDetail: DriverDetailRecord | null = null;
  private sourceDriver: Driver | null = null;
  currentTab: DriverLifecycleTabId = 'overview';
  quickNote = '';
  reviewerDecisionNote = '';
  internalReviewNote = '';
  selectedRejectionReason = '';
  readonly mapPreviewUrl = getDriverMapPreview();

  previewType: DriverPreviewType | null = null;
  selectedTask: DriverTaskAssignment | null = null;
  selectedIncident: DriverIncidentRecord | null = null;

  isLoading = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly driverService: DriverService,
    private readonly workflowLinks: WorkflowLinksService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.currentTab = this.normalizeTab(params.get('tab'));
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (!id) {
        this.router.navigate(['/drivers']);
        return;
      }

      this.loadDriver(id);
    });
  }

  editDriver(): void {
    this.setTab('verification');
  }

  openTasks(): void {
    this.setTab('operations');
  }

  toggleSuspension(): void {
    if (!this.sourceDriver) {
      return;
    }

    const nextStatus: DriverStatus = this.sourceDriver.status === 'Suspended' ? 'Offline' : 'Suspended';
    const note = nextStatus === 'Suspended'
      ? this.translate.instant('DRIVERS.DETAIL.ACTION_NOTES.MANUAL_SUSPEND')
      : this.translate.instant('DRIVERS.DETAIL.ACTION_NOTES.REVIEW_REACTIVATE');

    this.applyDriverPatch({ status: nextStatus }, note);
  }

  addQuickNote(): void {
    const note = this.quickNote.trim();

    if (!note || !this.driverDetail) {
      return;
    }

    const updatedNotes = [
      {
        author: this.translate.instant('DRIVERS.DETAIL.SUPPORT.DYNAMIC.ADMIN_USER'),
        role: this.translate.instant('DRIVERS.DETAIL.SUPPORT.DYNAMIC.ROLES.FLEET_SUPERVISOR'),
        createdAt: '2026/03/24 03:15 PM',
        message: note
      },
      ...this.driverDetail.notes
    ];

    this.driverDetail = {
      ...this.driverDetail,
      notes: updatedNotes,
      support: {
        ...this.driverDetail.support,
        openNotesCount: updatedNotes.length,
        lastUpdateLabel: this.translate.instant('DRIVERS.DETAIL.SUPPORT.DYNAMIC.LAST_UPDATE.NOW')
      }
    };

    this.quickNote = '';
  }

  setTab(tabId: DriverLifecycleTabId): void {
    if (this.currentTab === tabId) {
      return;
    }

    this.currentTab = tabId;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabId === 'overview' ? null : tabId },
      queryParamsHandling: 'merge'
    });
  }

  openTaskPreview(task: DriverTaskAssignment): void {
    this.previewType = 'task';
    this.selectedTask = task;
    this.selectedIncident = null;
  }

  openIncidentPreview(incident: DriverIncidentRecord): void {
    this.previewType = 'incident';
    this.selectedIncident = incident;
    this.selectedTask = null;
  }

  closePreview(): void {
    this.previewType = null;
    this.selectedTask = null;
    this.selectedIncident = null;
  }

  handlePreviewAction(action: PreviewAction): void {
    if (action.id === 'reassign') {
      this.setTab('operations');
    } else if (action.id === 'request-docs') {
      this.setTab('verification');
    } else if (action.id === 'urgent' || action.id === 'suspend-driver') {
      this.setTab('compliance');
    }

    this.closePreview();
  }

  handleWorkflowAction(actionId: DriverWorkflowActionId): void {
    if (!this.sourceDriver) {
      return;
    }

    switch (actionId) {
      case 'APPROVE_VERIFICATION':
        this.applyDriverPatch(
          {
            verificationStatus: VerificationStatus.Verified,
            status: this.sourceDriver.status === 'Suspended' ? 'Offline' : this.sourceDriver.status,
            issues: this.removeIssue(this.sourceDriver.issues, 'warning')
          },
          this.translate.instant('DRIVERS.DETAIL.ACTION_NOTES.VERIFICATION_APPROVED')
        );
        this.setTab('verification');
        break;
      case 'REQUEST_DOCUMENTS':
        this.applyDriverPatch(
          {
            verificationStatus: VerificationStatus.UnderReview,
            status: this.sourceDriver.status === 'OnMission' ? 'Offline' : this.sourceDriver.status,
            issues: this.addIssue(this.sourceDriver.issues, 'warning')
          },
          this.translate.instant('DRIVERS.DETAIL.ACTION_NOTES.DOCUMENTS_REQUESTED')
        );
        this.setTab('verification');
        break;
      case 'CLEAR_FINANCE_HOLD':
        this.applyDriverPatch(
          {
            collectionPaymentStatus: 'good',
            walletBalance: Math.max(this.sourceDriver.walletBalance, 240),
            issues: this.removeIssue(this.sourceDriver.issues, 'payment')
          },
          this.translate.instant('DRIVERS.DETAIL.ACTION_NOTES.FINANCE_HOLD_CLEARED')
        );
        this.setTab('finance');
        break;
      case 'SUSPEND_DRIVER':
        this.applyDriverPatch(
          {
            status: 'Suspended',
            issues: this.addIssue(this.sourceDriver.issues, 'legal')
          },
          this.translate.instant('DRIVERS.DETAIL.ACTION_NOTES.DRIVER_SUSPENDED')
        );
        this.setTab('compliance');
        break;
      case 'REACTIVATE_DRIVER':
        this.applyDriverPatch(
          {
            status: 'Offline',
            verificationStatus: this.sourceDriver.verificationStatus === VerificationStatus.Suspended
              ? VerificationStatus.Verified
              : this.sourceDriver.verificationStatus,
            issues: this.removeIssue(this.removeIssue(this.sourceDriver.issues, 'legal'), 'warning')
          },
          this.translate.instant('DRIVERS.DETAIL.ACTION_NOTES.ACCOUNT_REACTIVATED')
        );
        this.setTab('overview');
        break;
      case 'MARK_READY_FOR_DISPATCH':
        this.applyDriverPatch(
          {
            status: 'Online'
          },
          this.translate.instant('DRIVERS.DETAIL.ACTION_NOTES.READY_FOR_DISPATCH')
        );
        this.setTab('operations');
        break;
      case 'OPEN_OPERATIONS':
        this.setTab('operations');
        break;
      case 'OPEN_SUPPORT':
        this.setTab('support');
        break;
      case 'OPEN_FINANCE':
        this.setTab('finance');
        break;
      case 'REVIEW_COMPLIANCE':
        this.setTab('compliance');
        break;
      default:
        break;
    }
  }

  get linkedWorkflowCards(): WorkflowLinkCard[] {
    return this.workflowLinks.getDriverWorkflowLinks(this.sourceDriver, this.driverDetail);
  }

  private normalizeTab(value: string | null): DriverLifecycleTabId {
    const allowedTabs: DriverLifecycleTabId[] = ['overview', 'operations', 'performance', 'support', 'compliance', 'finance', 'verification'];
    return allowedTabs.includes(value as DriverLifecycleTabId) ? (value as DriverLifecycleTabId) : 'overview';
  }

  private loadDriver(id: string): void {
    this.isLoading = true;

    this.driverService.getDriverById(id).subscribe((driver) => {
      if (!driver) {
        this.router.navigate(['/drivers']);
        return;
      }

      this.sourceDriver = { ...driver };
      this.driverDetail = buildDriverDetailRecord(this.sourceDriver);
      this.reviewerDecisionNote = this.driverDetail.verification.decisionNote;
      this.internalReviewNote = this.driverDetail.verification.internalNote;
      this.selectedRejectionReason = this.driverDetail.verification.rejectionReasonOptions[0] ?? '';
      this.isLoading = false;
    });
  }

  private applyDriverPatch(patch: Partial<Driver>, noteMessage?: string): void {
    if (!this.sourceDriver || !this.driverDetail) {
      return;
    }

    this.sourceDriver = {
      ...this.sourceDriver,
      ...patch,
      issues: patch.issues ? this.normalizeIssues(patch.issues) : this.sourceDriver.issues
    };

    const rebuilt = buildDriverDetailRecord(this.sourceDriver);
    const notes = noteMessage
      ? [
          {
            author: this.translate.instant('DRIVERS.DETAIL.SUPPORT.DYNAMIC.ADMIN_USER'),
            role: this.translate.instant('DRIVERS.DETAIL.SUPPORT.DYNAMIC.ROLES.OPERATIONS_SUPERVISOR'),
            createdAt: '2026/03/25 11:30 AM',
            message: noteMessage
          },
          ...this.driverDetail.notes
        ]
      : this.driverDetail.notes;

    this.driverDetail = {
      ...rebuilt,
      notes,
      support: {
        ...rebuilt.support,
        openNotesCount: notes.length,
        lastUpdateLabel: noteMessage
          ? this.translate.instant('DRIVERS.DETAIL.SUPPORT.DYNAMIC.LAST_UPDATE.NOW')
          : rebuilt.support.lastUpdateLabel
      }
    };
  }

  private addIssue(issues: string[], issue: string): string[] {
    const cleaned = issues.filter((item) => item !== 'clear');
    return Array.from(new Set([...cleaned, issue]));
  }

  private removeIssue(issues: string[], issue: string): string[] {
    const cleaned = issues.filter((item) => item !== issue && item !== 'clear');
    return cleaned.length ? cleaned : ['clear'];
  }

  private normalizeIssues(issues: string[]): string[] {
    const cleaned = issues.filter((issue) => issue !== 'clear');
    return cleaned.length ? Array.from(new Set(cleaned)) : ['clear'];
  }
}
