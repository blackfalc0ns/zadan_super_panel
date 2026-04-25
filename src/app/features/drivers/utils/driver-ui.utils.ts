import { DriverPerformance, DriverStatus, VerificationStatus } from '@drivers/models/drivers.domain.models';
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
  return getDriverStatusKey(status);
}

export function getVehicleTypeKey(vehicleType: DriverPerformance | string | undefined | null): string {
  switch (vehicleType) {
    case 'Car':
      return 'DRIVERS.VEHICLES.CAR';
    case 'Motorcycle':
      return 'DRIVERS.VEHICLES.BIKE';
    case 'Scooter':
      return 'DRIVERS.VEHICLES.SCOOTER';
    case 'Van':
      return 'DRIVERS.VEHICLES.VAN';
    case 'Bicycle':
      return 'DRIVERS.VEHICLES.BICYCLE';
    case 'Truck':
      return 'DRIVERS.VEHICLES.TRUCK';
    default:
      return 'COMMON.NOT_AVAILABLE';
  }
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
  return getVerificationKey(status);
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
  return getPerformanceKey(performance);
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
  return getIssueKey(issue);
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

export function getTaskStatusKey(status: DriverTaskAssignment['status']): string {
  const keys: Record<DriverTaskAssignment['status'], string> = {
    IN_PROGRESS: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STATUS.IN_PROGRESS',
    PREPARING: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STATUS.PREPARING',
    WAITING_DRIVER: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STATUS.WAITING_DRIVER',
    COMPLETED: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STATUS.COMPLETED',
    FAILED: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STATUS.FAILED'
  };

  return keys[status];
}

export function getSupportStatusVariant(status: DriverSupportTicket['status']): StatusPillVariant {
  const variants: Record<DriverSupportTicket['status'], StatusPillVariant> = {
    WAITING: 'info',
    IN_PROGRESS: 'warning',
    RESOLVED: 'success'
  };

  return variants[status];
}

export function getSupportStatusKey(status: DriverSupportTicket['status']): string {
  const keys: Record<DriverSupportTicket['status'], string> = {
    WAITING: 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.STATUS.WAITING',
    IN_PROGRESS: 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.STATUS.IN_PROGRESS',
    RESOLVED: 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.STATUS.RESOLVED'
  };

  return keys[status];
}

export function getPriorityVariant(priority: DriverSupportTicket['priority']): StatusPillVariant {
  const variants: Record<DriverSupportTicket['priority'], StatusPillVariant> = {
    NORMAL: 'neutral',
    HIGH: 'warning',
    CRITICAL: 'high-risk'
  };

  return variants[priority];
}

export function getPriorityKey(priority: DriverSupportTicket['priority']): string {
  const keys: Record<DriverSupportTicket['priority'], string> = {
    NORMAL: 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.PRIORITY.NORMAL',
    HIGH: 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.PRIORITY.HIGH',
    CRITICAL: 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.PRIORITY.CRITICAL'
  };

  return keys[priority];
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

export function getIncidentStatusKey(status: DriverIncidentRecord['status']): string {
  const keys: Record<DriverIncidentRecord['status'], string> = {
    NEW: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.STATUS.NEW',
    REVIEW: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.STATUS.REVIEW',
    WAITING_DOCS: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.STATUS.WAITING_DOCS',
    RESOLVED: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.STATUS.RESOLVED'
  };

  return keys[status];
}

export function getIncidentSeverityVariant(severity: DriverIncidentRecord['severity']): StatusPillVariant {
  const variants: Record<DriverIncidentRecord['severity'], StatusPillVariant> = {
    MEDIUM: 'warning',
    HIGH: 'danger',
    CRITICAL: 'high-risk'
  };

  return variants[severity];
}

export function getIncidentSeverityKey(severity: DriverIncidentRecord['severity']): string {
  const keys: Record<DriverIncidentRecord['severity'], string> = {
    MEDIUM: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.SEVERITY.MEDIUM',
    HIGH: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.SEVERITY.HIGH',
    CRITICAL: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.SEVERITY.CRITICAL'
  };

  return keys[severity];
}

export function getIncidentTypeKey(type: string): string {
  const normalizedType = type.toUpperCase();
  const keys: Record<string, string> = {
    TRAFFIC_ACCIDENT: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.TYPES.TRAFFIC_ACCIDENT',
    FRAUD_SUSPECTED: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.TYPES.FRAUD_SUSPECTED',
    REPEATED_DELAY: 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.TYPES.REPEATED_DELAY'
  };

  return keys[normalizedType] || type;
}

export function getFinanceStatusVariant(status: DriverFinanceEntry['status']): StatusPillVariant {
  const variants: Record<DriverFinanceEntry['status'], StatusPillVariant> = {
    SETTLED: 'success',
    PENDING: 'warning',
    FAILED: 'danger'
  };

  return variants[status];
}

export function getFinanceStatusKey(status: DriverFinanceEntry['status']): string {
  const keys: Record<DriverFinanceEntry['status'], string> = {
    SETTLED: 'DRIVERS.DETAIL.FINANCE.DYNAMIC.STATUS.SETTLED',
    PENDING: 'DRIVERS.DETAIL.FINANCE.DYNAMIC.STATUS.PENDING',
    FAILED: 'DRIVERS.DETAIL.FINANCE.DYNAMIC.STATUS.FAILED'
  };

  return keys[status];
}

export function getDocumentStatusKey(status: DriverDocumentRecord['status']): string {
  switch (status) {
    case 'valid':
      return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.STATUS.VALID';
    case 'expiring':
      return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.STATUS.EXPIRING';
    default:
      return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.STATUS.UNDER_REVIEW';
  }
}

export function getDocumentStatusVariant(status: DriverDocumentRecord['status']): StatusPillVariant {
  const variants: Record<DriverDocumentRecord['status'], StatusPillVariant> = {
    valid: 'success',
    expiring: 'warning',
    review: 'neutral'
  };

  return variants[status];
}
