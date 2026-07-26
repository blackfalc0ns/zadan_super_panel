import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, ChangeDetectorRef } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DriverStatus, VerificationStatus } from '@drivers/models/drivers.domain.models';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { localizeSaudiCity, localizeSaudiRegion } from '../../../../shared/utils/saudi-geography-display';
import { DriverDetailRecord, DriverWorkflowAction, DriverWorkflowActionId } from '../../models/drivers.models';
import {
  getDriverStatusKey,
  getDriverRestrictionLabelKey,
  getVerificationKey,
  getVerificationVariant,
  getComplianceVariant,
  hasDriverOperationalRestriction
} from '../../utils/driver-ui.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-driver-hero',
  standalone: true,
  imports: [CommonModule, TranslateModule, StatusPillComponent],
  templateUrl: './driver-hero.component.html'
})
export class DriverHeroComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);
  copiedFields: Record<string, boolean> = {};

  get zoneLabel(): string {
    return (
      localizeSaudiRegion(this.translate, this.driver.operations?.region) ||
      localizeSaudiCity(this.translate, this.driver.zoneName || this.driver.liveZone || this.driver.city) ||
      ''
    );
  }

  @Input({ required: true }) driver!: DriverDetailRecord;
  @Input() isRTL = true;
  @Input() isMutating = false;
  @Input() currentTab = 'overview';

  copyToClipboard(field: string, text: string) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.copiedFields[field] = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.copiedFields[field] = false;
        this.cdr.markForCheck();
      }, 2000);
    });
  }
  
  @Output() editDriverRequested = new EventEmitter<void>();
  @Output() openTasksRequested = new EventEmitter<void>();
  @Output() toggleSuspensionRequested = new EventEmitter<void>();
  @Output() toggleBanRequested = new EventEmitter<void>();
  @Output() toggleLoginLockRequested = new EventEmitter<void>();
  @Output() workflowActionRequested = new EventEmitter<DriverWorkflowActionId>();

  get driverStatusLabel(): string {
    return getDriverStatusKey(this.driver.status);
  }

  get verificationLabel(): string {
    return getVerificationKey(this.driver.verificationStatus);
  }

  get verificationVariant(): ReturnType<typeof getVerificationVariant> {
    return getVerificationVariant(this.driver.verificationStatus);
  }

  get complianceVariant(): StatusPillVariant {
    return getComplianceVariant(this.driver.complianceStatusVariant);
  }

  get readinessVariant(): StatusPillVariant {
    if (this.driver.workflow.readiness === 'READY') return 'success';
    if (this.driver.workflow.readiness === 'LIMITED') return 'warning';
    return 'danger';
  }

  get profileCompletionPercent(): number {
    return Math.max(0, Math.min(100, this.driver.profileReadiness.completionPercent));
  }

  get hasMissingRequirements(): boolean {
    return this.driver.profileReadiness.missingRequirements.length > 0;
  }

  get missingRequirementLabels(): string[] {
    return this.driver.profileReadiness.missingRequirements.map((requirement) =>
      `DRIVERS.DETAIL.VERIFICATION.BACKEND.REJECTION_REASONS.${requirement.toUpperCase()}`);
  }

  get hasReviewNote(): boolean {
    return Boolean(this.driver.verification.decisionNote || this.driver.verification.internalNote);
  }

  get primaryReviewNote(): string {
    return this.driver.verification.decisionNote || this.driver.verification.internalNote || '';
  }

  get workflow() {
    return this.driver.workflow;
  }

  get primaryAction(): DriverWorkflowAction | undefined {
    return this.driver.workflow?.actions?.find((action) => !this.isRedundantNavigationAction(action));
  }

  private isRedundantNavigationAction(action: DriverWorkflowAction): boolean {
    if (!this.isNavigationOnlyAction(action.id)) {
      return false;
    }

    return action.targetTab === this.currentTab;
  }

  private isNavigationOnlyAction(actionId: DriverWorkflowActionId): boolean {
    return actionId === 'OPEN_OPERATIONS'
      || actionId === 'OPEN_SUPPORT'
      || actionId === 'OPEN_FINANCE'
      || actionId === 'REVIEW_COMPLIANCE';
  }

  get suspensionActionLabel(): string {
    if (this.driver.status === 'Banned') {
      return 'DRIVERS.DETAIL.WORKFLOW.ACTION_LABELS.UNBAN_DRIVER';
    }

    return this.driver.status === 'Suspended'
      ? 'DRIVERS.DETAIL.WORKFLOW.ACTION_LABELS.REACTIVATE_DRIVER'
      : 'DRIVERS.DETAIL.WORKFLOW.ACTION_LABELS.SUSPEND_DRIVER';
  }

  get suspensionActionTitle(): string {
    return this.driver.status === 'Suspended' || this.driver.status === 'Banned'
      ? 'DRIVERS.DETAIL.MESSAGES.DRIVER_REACTIVATED'
      : 'DRIVERS.DETAIL.MESSAGES.DRIVER_SUSPENDED';
  }

  get suspensionActionIcon(): string {
    return this.driver.status === 'Banned'
      ? 'how_to_reg'
      : this.driver.status === 'Suspended'
        ? 'play_arrow'
        : 'block';
  }

  get isBlockedStatus(): boolean {
    return hasDriverOperationalRestriction(this.driver);
  }

  get restrictionStatusLabel(): string | null {
    return getDriverRestrictionLabelKey(this.driver);
  }

  get showConnectionStatus(): boolean {
    return !this.isBlockedStatus;
  }

  get banActionLabel(): string {
    return this.driver.status === 'Banned'
      ? 'DRIVERS.DETAIL.WORKFLOW.ACTION_LABELS.UNBAN_DRIVER'
      : 'DRIVERS.DETAIL.WORKFLOW.ACTION_LABELS.BAN_DRIVER';
  }

  get banActionIcon(): string {
    return this.driver.status === 'Banned' ? 'how_to_reg' : 'person_off';
  }

  get banActionClasses(): string {
    return this.driver.status === 'Banned'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
      : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white';
  }

  get loginLockActionLabel(): string {
    return this.driver.isLoginLocked
      ? 'DRIVERS.DETAIL.ACTIONS.UNLOCK_LOGIN'
      : 'DRIVERS.DETAIL.ACTIONS.LOCK_LOGIN';
  }

  get loginLockActionIcon(): string {
    return this.driver.isLoginLocked ? 'lock_open' : 'lock';
  }

  get loginLockActionClasses(): string {
    return this.driver.isLoginLocked
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
      : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white';
  }

  get loginLockNoticeKey(): string {
    if (!this.driver.isLoginLocked) {
      return '';
    }

    const hasLockedAt = Boolean(this.driver.lockedAtLabel);
    const hasReason = Boolean(this.driver.lockReason);

    if (hasLockedAt && hasReason) {
      return 'DRIVERS.DETAIL.HERO.LOGIN_LOCK_NOTICE_WITH_REASON_AND_TIME';
    }

    if (hasReason) {
      return 'DRIVERS.DETAIL.HERO.LOGIN_LOCK_NOTICE_WITH_REASON';
    }

    if (hasLockedAt) {
      return 'DRIVERS.DETAIL.HERO.LOGIN_LOCK_NOTICE_WITH_TIME';
    }

    return 'DRIVERS.DETAIL.HERO.LOGIN_LOCK_NOTICE';
  }

  get loginLockNoticeParams(): Record<string, string> {
    return {
      lockedAt: this.driver.lockedAtLabel || '',
      reason: this.driver.lockReason || ''
    };
  }

  get primaryActionClasses(): string {
    switch (this.primaryAction?.tone) {
      case 'success':
        return 'bg-emerald-600 text-white hover:bg-emerald-700';
      case 'warning':
        return 'bg-amber-500 text-white hover:bg-amber-600';
      case 'danger':
        return 'bg-rose-600 text-white hover:bg-rose-700';
      case 'secondary':
        return 'border border-slate-200 bg-white text-slate-700 hover:border-zadna-primary/30 hover:bg-slate-50 hover:text-zadna-primary';
      default:
        return 'bg-zadna-primary text-white hover:bg-zadna-primary/90';
    }
  }
}
