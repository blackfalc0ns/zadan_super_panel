import { DriverPerformance, DriverStatus, VerificationStatus } from '../../../core/models/driver';
import {
  DriverDetailRecord,
  DriverDocumentRecord,
  DriverFinanceEntry,
  DriverIncidentRecord,
  DriverSupportTicket,
  DriverTaskAssignment
} from '../models/drivers.models';
import { StatusPillVariant } from '../../../shared/components/ui/status-pill/status-pill.component';

export function getDriverStatusKey(status: DriverStatus): string {
  const keys: Record<DriverStatus, string> = {
    Online: 'DRIVERS.STATUS.ONLINE',
    OnMission: 'DRIVERS.STATUS.ONMISSION',
    Offline: 'DRIVERS.STATUS.OFFLINE',
    Suspended: 'DRIVERS.STATUS.SUSPENDED'
  };

  return keys[status];
}

export function getDriverStatusLabel(status: DriverStatus): string {
  const labels: Record<DriverStatus, string> = {
    Online: 'متصل',
    OnMission: 'في مهمة',
    Offline: 'غير متصل',
    Suspended: 'موقوف'
  };

  return labels[status];
}

export function getDriverStatusVariant(status: DriverStatus): StatusPillVariant {
  const variants: Record<DriverStatus, StatusPillVariant> = {
    Online: 'success',
    OnMission: 'warning',
    Offline: 'neutral',
    Suspended: 'danger'
  };

  return variants[status];
}

export function getLifecycleDriverStatusVariant(status: DriverStatus): StatusPillVariant {
  const variants: Record<DriverStatus, StatusPillVariant> = {
    Online: 'success',
    Offline: 'paused',
    OnMission: 'processing',
    Suspended: 'danger'
  };

  return variants[status];
}

export function getVerificationKey(status: VerificationStatus): string {
  const keys: Record<VerificationStatus, string> = {
    [VerificationStatus.Verified]: 'DRIVERS.VERIFICATION.VERIFIED',
    [VerificationStatus.UnderReview]: 'DRIVERS.VERIFICATION.UNDER_REVIEW',
    [VerificationStatus.Unverified]: 'DRIVERS.VERIFICATION.UNVERIFIED',
    [VerificationStatus.Suspended]: 'DRIVERS.VERIFICATION.SUSPENDED'
  };

  return keys[status];
}

export function getVerificationLabel(status: VerificationStatus): string {
  const labels: Record<VerificationStatus, string> = {
    [VerificationStatus.Verified]: 'موثق',
    [VerificationStatus.UnderReview]: 'قيد المراجعة',
    [VerificationStatus.Unverified]: 'غير موثق',
    [VerificationStatus.Suspended]: 'موقوف مؤقتًا'
  };

  return labels[status];
}

export function getVerificationVariant(status: VerificationStatus): StatusPillVariant {
  const variants: Record<VerificationStatus, StatusPillVariant> = {
    [VerificationStatus.Verified]: 'success',
    [VerificationStatus.UnderReview]: 'warning',
    [VerificationStatus.Unverified]: 'neutral',
    [VerificationStatus.Suspended]: 'danger'
  };

  return variants[status];
}

export function getComplianceVariant(variant: DriverDetailRecord['complianceStatusVariant']): StatusPillVariant {
  const variants: Record<DriverDetailRecord['complianceStatusVariant'], StatusPillVariant> = {
    success: 'success',
    warning: 'warning',
    danger: 'high-risk'
  };

  return variants[variant];
}

export function getPerformanceKey(performance: DriverPerformance): string {
  const keys: Record<DriverPerformance, string> = {
    [DriverPerformance.Excellent]: 'DRIVERS.PERFORMANCE.EXCELLENT',
    [DriverPerformance.Good]: 'DRIVERS.PERFORMANCE.GOOD',
    [DriverPerformance.NeedsImprovement]: 'DRIVERS.PERFORMANCE.NEEDS_IMPROVEMENT',
    [DriverPerformance.Low]: 'DRIVERS.PERFORMANCE.LOW'
  };

  return keys[performance];
}

export function getPerformanceLabel(performance: DriverPerformance): string {
  const labels: Record<DriverPerformance, string> = {
    [DriverPerformance.Excellent]: 'ممتاز',
    [DriverPerformance.Good]: 'جيد',
    [DriverPerformance.NeedsImprovement]: 'يحتاج تحسين',
    [DriverPerformance.Low]: 'ضعيف'
  };

  return labels[performance];
}

export function getIssueIcon(issue: string): string {
  switch (issue) {
    case 'warning':
      return 'priority_high';
    case 'payment':
      return 'credit_card_off';
    case 'legal':
      return 'gavel';
    default:
      return 'check';
  }
}

export function getIssueKey(issue: string): string {
  switch (issue) {
    case 'warning':
      return 'DRIVERS.ISSUES.WARNING';
    case 'payment':
      return 'DRIVERS.ISSUES.PAYMENT';
    case 'legal':
      return 'DRIVERS.ISSUES.LEGAL';
    default:
      return 'DRIVERS.ISSUES.CLEAR';
  }
}

export function getIssueLabel(issue: string): string {
  switch (issue) {
    case 'warning':
      return 'تنبيه';
    case 'payment':
      return 'تحصيل';
    case 'legal':
      return 'بلاغات';
    default:
      return 'سليم';
  }
}

export function getIssueVariant(issue: string): 'success' | 'warning' | 'danger' {
  switch (issue) {
    case 'warning':
      return 'warning';
    case 'payment':
    case 'legal':
      return 'danger';
    default:
      return 'success';
  }
}

export function getTaskStatusVariant(status: DriverTaskAssignment['status']): StatusPillVariant {
  const variants: Record<DriverTaskAssignment['status'], StatusPillVariant> = {
    IN_PROGRESS: 'processing',
    PREPARING: 'warning',
    WAITING_DRIVER: 'neutral',
    COMPLETED: 'success',
    FAILED: 'danger'
  };

  return variants[status];
}

export function getSupportStatusVariant(status: DriverSupportTicket['status']): StatusPillVariant {
  const variants: Record<DriverSupportTicket['status'], StatusPillVariant> = {
    WAITING: 'info',
    IN_PROGRESS: 'warning',
    RESOLVED: 'success'
  };

  return variants[status];
}

export function getPriorityVariant(priority: DriverSupportTicket['priority']): StatusPillVariant {
  const variants: Record<DriverSupportTicket['priority'], StatusPillVariant> = {
    NORMAL: 'neutral',
    HIGH: 'warning',
    CRITICAL: 'high-risk'
  };

  return variants[priority];
}

export function getIncidentStatusVariant(status: DriverIncidentRecord['status']): StatusPillVariant {
  const variants: Record<DriverIncidentRecord['status'], StatusPillVariant> = {
    NEW: 'info',
    REVIEW: 'warning',
    WAITING_DOCS: 'neutral',
    RESOLVED: 'success'
  };

  return variants[status];
}

export function getIncidentSeverityVariant(severity: DriverIncidentRecord['severity']): StatusPillVariant {
  const variants: Record<DriverIncidentRecord['severity'], StatusPillVariant> = {
    MEDIUM: 'warning',
    HIGH: 'danger',
    CRITICAL: 'high-risk'
  };

  return variants[severity];
}

export function getFinanceStatusVariant(status: DriverFinanceEntry['status']): StatusPillVariant {
  const variants: Record<DriverFinanceEntry['status'], StatusPillVariant> = {
    SETTLED: 'success',
    PENDING: 'warning',
    FAILED: 'danger'
  };

  return variants[status];
}

export function getDocumentStatusVariant(status: DriverDocumentRecord['status']): StatusPillVariant {
  const variants: Record<DriverDocumentRecord['status'], StatusPillVariant> = {
    valid: 'success',
    expiring: 'warning',
    review: 'neutral'
  };

  return variants[status];
}
