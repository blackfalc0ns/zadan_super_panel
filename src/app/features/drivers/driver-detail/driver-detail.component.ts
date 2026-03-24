import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PreviewAction } from '../../../shared/components/ui/quick-preview-drawer/quick-preview-drawer.component';
import { DriverDetailViewComponent } from '../components/driver-detail-view/driver-detail-view.component';
import { buildDriverDetailRecord, getDriverMapPreview } from '../drivers.mock';
import { DriverDetailRecord, DriverIncidentRecord, DriverTaskAssignment } from '../drivers.models';
import { DriverLifecycleTabId, DriverPreviewType } from '../driver-view.types';
import { DriverService } from '../../../core/services/driver.service';
import { DriverStatus } from '../../../core/models/driver';

@Component({
  selector: 'app-driver-detail',
  standalone: true,
  imports: [DriverDetailViewComponent],
  templateUrl: './driver-detail.component.html'
})
export class DriverDetailComponent implements OnInit {
  driverDetail: DriverDetailRecord | null = null;
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
    if (!this.driverDetail) {
      return;
    }

    const nextStatus: DriverStatus = this.driverDetail.status === 'Suspended' ? 'Online' : 'Suspended';
    const existingNotes = this.driverDetail.notes;
    const rebuilt = buildDriverDetailRecord({ ...this.driverDetail, status: nextStatus });

    this.driverDetail = {
      ...rebuilt,
      notes: existingNotes,
      support: {
        ...rebuilt.support,
        openNotesCount: existingNotes.length
      }
    };
  }

  addQuickNote(): void {
    const note = this.quickNote.trim();

    if (!note || !this.driverDetail) {
      return;
    }

    const updatedNotes = [
      {
        author: 'Admin User',
        role: 'مشرف الأسطول',
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
        lastUpdateLabel: 'الآن'
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

      this.driverDetail = buildDriverDetailRecord(driver);
      this.reviewerDecisionNote = this.driverDetail.verification.decisionNote;
      this.internalReviewNote = this.driverDetail.verification.internalNote;
      this.selectedRejectionReason = this.driverDetail.verification.rejectionReasonOptions[0] ?? '';
      this.isLoading = false;
    });
  }
}
