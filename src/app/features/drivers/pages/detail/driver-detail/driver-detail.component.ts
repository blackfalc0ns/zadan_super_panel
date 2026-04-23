import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PreviewAction } from '../../../../../shared/components/ui/quick-preview-drawer/quick-preview-drawer.component';
import { DriverDetailViewComponent } from '../../../components/driver-detail-view/driver-detail-view.component';
import { getDriverMapPreview } from '../../../data/drivers.mock';
import { DriverDetailRecord, DriverIncidentRecord, DriverTaskAssignment, DriverWorkflowActionId } from '../../../models/drivers.models';
import { DriverLifecycleTabId, DriverPreviewType } from '../../../models/driver-view.types';
import { DriverService } from '@drivers/services/drivers.api.service';
import { Driver } from '@drivers/models/drivers.domain.models';

@Component({
  selector: 'app-driver-detail',
  standalone: true,
  imports: [DriverDetailViewComponent],
  templateUrl: './driver-detail.component.html'
})
export class DriverDetailComponent implements OnInit {
  driverDetail: DriverDetailRecord | null = null;
  private sourceDriver: Driver | null = null;
  private currentDriverId: string | null = null;
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
    private readonly driverService: DriverService
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
    if (!this.sourceDriver || !this.currentDriverId) {
      return;
    }

    if (this.sourceDriver.status === 'Suspended') {
      this.runDriverAction(this.driverService.reactivateDriver(this.currentDriverId));
      return;
    }

    this.runDriverAction(
      this.driverService.suspendDriver(
        this.currentDriverId,
        this.internalReviewNote.trim() || this.reviewerDecisionNote.trim() || undefined),
      'compliance');
  }

  addQuickNote(): void {
    const note = this.quickNote.trim();

    if (!note || !this.driverDetail || !this.currentDriverId) {
      return;
    }
    this.quickNote = '';
    this.runDriverAction(this.driverService.addDriverNote(this.currentDriverId, note), 'support');
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
    if (!this.sourceDriver || !this.currentDriverId) {
      return;
    }

    switch (actionId) {
      case 'APPROVE_VERIFICATION':
        this.runDriverAction(
          this.driverService.reviewDriver(
            this.currentDriverId,
            'approve',
            this.reviewerDecisionNote.trim() || this.internalReviewNote.trim() || undefined),
          'verification');
        break;
      case 'REQUEST_DOCUMENTS':
        this.runDriverAction(
          this.driverService.reviewDriver(
            this.currentDriverId,
            'request-docs',
            this.reviewerDecisionNote.trim() || this.internalReviewNote.trim() || undefined),
          'verification');
        break;
      case 'CLEAR_FINANCE_HOLD':
        this.setTab('finance');
        break;
      case 'SUSPEND_DRIVER':
        this.runDriverAction(
          this.driverService.suspendDriver(
            this.currentDriverId,
            this.internalReviewNote.trim() || this.reviewerDecisionNote.trim() || undefined),
          'compliance');
        break;
      case 'REACTIVATE_DRIVER':
        this.runDriverAction(this.driverService.reactivateDriver(this.currentDriverId), 'overview');
        break;
      case 'MARK_READY_FOR_DISPATCH':
        this.setTab('operations');
        break;
      case 'OPEN_OPERATIONS':
        this.setTab('operations');
        break;
      case 'OPEN_SUPPORT':
        this.setTab('support');
        break;
      case 'OPEN_FINANCE':
        this.router.navigate(['/finances/settlements'], {
          queryParams: {
            entityType: 'driver',
            entityId: this.sourceDriver.id
          }
        });
        break;
      case 'REVIEW_COMPLIANCE':
        this.setTab('compliance');
        break;
      default:
        break;
    }
  }

  private normalizeTab(value: string | null): DriverLifecycleTabId {
    const allowedTabs: DriverLifecycleTabId[] = ['overview', 'operations', 'performance', 'support', 'compliance', 'finance', 'verification'];
    return allowedTabs.includes(value as DriverLifecycleTabId) ? (value as DriverLifecycleTabId) : 'overview';
  }

  private loadDriver(id: string): void {
    this.isLoading = true;
    this.currentDriverId = id;

    this.driverService.getDriverDetailRecordById(id).subscribe((driverDetail) => {
      if (!driverDetail) {
        this.router.navigate(['/drivers']);
        return;
      }

      this.sourceDriver = {
        ...driverDetail,
        tasks: { ...driverDetail.tasks },
        issues: [...driverDetail.issues],
        alerts: driverDetail.alerts ? [...driverDetail.alerts] : undefined,
        lastSeenAt: new Date(driverDetail.lastSeenAt)
      };
      this.driverDetail = driverDetail;
      this.reviewerDecisionNote = this.driverDetail.verification.decisionNote;
      this.internalReviewNote = this.driverDetail.verification.internalNote;
      this.selectedRejectionReason = this.driverDetail.verification.rejectionReasonOptions[0] ?? '';
      this.isLoading = false;
    });
  }

  private runDriverAction(action$: Observable<unknown>, targetTab?: DriverLifecycleTabId): void {
    if (targetTab) {
      this.setTab(targetTab);
    }

    this.isLoading = true;
    action$.subscribe({
      next: () => {
        if (this.currentDriverId) {
          this.loadDriver(this.currentDriverId);
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Driver action failed', error);
        this.isLoading = false;
      }
    });
  }
}



