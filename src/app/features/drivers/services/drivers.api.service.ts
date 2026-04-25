import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import {
  DriverDetailRecord,
  DriverDocumentRecord,
  DriverFinanceEntry,
  DriverIncidentRecord,
  DriverInternalNote,
  DriverLifecycleStage,
  DriverTaskAssignment,
  DriverWorkflowSummary,
  DriverVerificationChecklistItem,
  DriverWorkflowActionId
} from '../models/drivers.models';
import {
  Driver,
  DriverFilters,
  DriverKPIs,
  DriverPerformance,
  DriverStatus,
  DriverVehicleType,
  VerificationStatus
} from '@drivers/models/drivers.domain.models';

interface AdminDriverKpisResponse {
  total: number;
  onlineNow: number;
  onMission: number;
  underReview: number;
  suspended: number;
  lowPerformance: number;
}

interface AdminDriverListItemResponse {
  id: string;
  driverDisplayId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  imageUrl?: string | null;
  city: string;
  status: string;
  verificationStatus: string;
  activeTasks: number;
  completedTasks: number;
  acceptanceRate: number;
  walletBalance: number;
  performance: string;
  vehicleType?: DriverVehicleType | string | null;
  lastSeenAt: string;
  issues: string[];
  collectionPaymentStatus: 'good' | 'warning' | 'critical';
  alerts?: string[] | null;
}

interface AdminDriversListResponse {
  items: AdminDriverListItemResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  kpis: AdminDriverKpisResponse;
}

interface AdminDriverDocumentResponse {
  documentType: string;
  imageUrl?: string | null;
  status: string;
  expiryInfo?: string | null;
}

interface AdminDriverNoteResponse {
  id: string;
  authorName: string;
  message: string;
  createdAtUtc: string;
}

interface AdminDriverIncidentResponse {
  id: string;
  incidentType: string;
  severity: string;
  status: string;
  reviewerName?: string | null;
  linkedOrderId?: string | null;
  summary: string;
  createdAtUtc: string;
}

interface AdminDriverFinanceSummaryResponse {
  currentBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  codCollected: number;
  totalSettlements: number;
  totalPayouts: number;
}

interface AdminDriverAssignmentResponse {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  acceptedAtUtc?: string | null;
  deliveredAtUtc?: string | null;
  failedAtUtc?: string | null;
  failureReason?: string | null;
  codAmount: number;
}

interface AdminDriverDetailResponse {
  id: string;
  driverDisplayId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  imageUrl?: string | null;
  city: string;
  status: string;
  verificationStatus: string;
  vehicleType?: DriverVehicleType | string | null;
  joinedAt: string;
  lastSeenAt: string;
  activeTasks: number;
  completedTasks: number;
  acceptanceRate: number;
  walletBalance: number;
  performance: string;
  issues: string[];
  collectionPaymentStatus: 'good' | 'warning' | 'critical';
  alerts?: string[] | null;
  commitmentScore?: number;
  dailyRejections?: number;
  weeklyRejections?: number;
  enforcementLevel?: string;
  lastOfferResponseAtUtc?: string | null;
  address?: string | null;
  licenseNumber?: string | null;
  zoneName?: string | null;
  primaryZoneId?: string | null;
  reviewedAtUtc?: string | null;
  reviewNote?: string | null;
  suspensionReason?: string | null;
  profileReadiness: AdminDriverProfileReadinessResponse;
  documents: AdminDriverDocumentResponse[];
  notes: AdminDriverNoteResponse[];
  incidents: AdminDriverIncidentResponse[];
  finance: AdminDriverFinanceSummaryResponse;
  recentAssignments: AdminDriverAssignmentResponse[];
  overview: AdminDriverOverviewResponse;
  workflow: AdminDriverWorkflowResponse;
  operations: AdminDriverOperationsResponse;
  performanceDetails: AdminDriverPerformanceResponse;
  support: AdminDriverSupportResponse;
  compliance: AdminDriverComplianceResponse;
  financeDetails: AdminDriverFinanceDetailsResponse;
  verification: AdminDriverVerificationResponse;
}

interface AdminDriverOverviewResponse {
  address?: string | null;
  zoneName?: string | null;
  licenseNumber?: string | null;
  completionRate: number;
  commitmentScore: number;
  collectionPaymentStatus: 'good' | 'warning' | 'critical';
}

interface AdminDriverProfileReadinessResponse {
  isProfileComplete: boolean;
  completionPercent: number;
  missingRequirements: string[];
  canSubmitForReview: boolean;
  checklist: AdminDriverVerificationChecklistItemResponse[];
}

interface AdminDriverWorkflowActionResponse {
  id: string;
  tone: string;
  targetTab: string;
}

interface AdminDriverLifecycleStageResponse {
  id: string;
  state: string;
}

interface AdminDriverWorkflowResponse {
  state: string;
  readiness: string;
  blockers: string[];
  alerts: string[];
  actions: AdminDriverWorkflowActionResponse[];
  lifecycleStages: AdminDriverLifecycleStageResponse[];
}

interface AdminDriverOperationsTaskResponse {
  id: string;
  vendorName: string;
  zoneName: string;
  status: string;
  assignedAtUtc: string;
  durationMinutes?: number | null;
  delayLabel?: string | null;
  codAmount: number;
}

interface AdminDriverOperationsResponse {
  zoneName?: string | null;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  currentAccuracyMeters?: number | null;
  lastLocationAtUtc?: string | null;
  activeDriversInZone?: number | null;
  avgDeliveryMinutes?: number | null;
  zoneCapacityLimit?: number | null;
  taskAssignments: AdminDriverOperationsTaskResponse[];
}

interface AdminDriverPerformanceMetricResponse {
  id: string;
  numericValue?: number | null;
  displayValue: string;
  deltaValue?: string | null;
  tone: string;
}

interface AdminDriverPerformanceBenchmarkResponse {
  id: string;
  driverValue: number;
  regionValue: number;
  fleetValue: number;
  unit: string;
  insightCode: string;
}

interface AdminDriverPerformanceInsightGroupResponse {
  id: string;
  tone: string;
  icon: string;
  itemCodes: string[];
}

interface AdminDriverPerformanceResponse {
  completionRate: number;
  acceptanceRate: number;
  commitmentScore: number;
  completedTasks: number;
  rejectedOffers: number;
  timedOutOffers: number;
  metrics: AdminDriverPerformanceMetricResponse[];
  benchmarks: AdminDriverPerformanceBenchmarkResponse[];
  insightGroups: AdminDriverPerformanceInsightGroupResponse[];
}

interface AdminDriverSupportTicketResponse {
  id: string;
  subject: string;
  status: string;
  priority: string;
  reviewer: string;
  updatedAtUtc: string;
  linkedOrderCode?: string | null;
}

interface AdminDriverSupportMessageResponse {
  direction: 'driver' | 'support';
  message: string;
  createdAtUtc: string;
}

interface AdminDriverSupportFollowUpResponse {
  code: string;
  dueLabel: string;
  tone: 'primary' | 'warning' | 'danger';
}

interface AdminDriverSupportResponse {
  openNotesCount: number;
  ticketsCount: number;
  pendingFollowUpsCount: number;
  escalationsCount: number;
  unresolvedCount: number;
  lastUpdateAtUtc?: string | null;
  reviewerName?: string | null;
  reviewerRole?: string | null;
  reviewerOnline: boolean;
  tickets: AdminDriverSupportTicketResponse[];
  chatMessages: AdminDriverSupportMessageResponse[];
  followUps: AdminDriverSupportFollowUpResponse[];
}

interface AdminDriverDocumentHealthResponse {
  valid: number;
  expiring: number;
  review: number;
}

interface AdminDriverComplianceResponse {
  openCases: number;
  criticalCases: number;
  safetyAlerts: number;
  expiredDocuments: number;
  suspensions: number;
  riskLevel: string;
  documentHealth: AdminDriverDocumentHealthResponse;
}

interface AdminDriverFinanceEntryResponse {
  id: string;
  reference: string;
  type: string;
  status: string;
  amount: number;
  fee: number;
  method: string;
  createdAtUtc: string;
}

interface AdminDriverFinanceDetailsResponse {
  availableBalance: number;
  dueAmount: number;
  codCollected: number;
  pendingDeductions: number;
  nextPayoutDateUtc?: string | null;
  payoutMethod?: string | null;
  statementPeriod: string;
  entries: AdminDriverFinanceEntryResponse[];
}

interface AdminDriverVerificationChecklistItemResponse {
  code: string;
  completed: boolean;
  note?: string | null;
  critical: boolean;
}

interface AdminDriverVerificationResponse {
  applicationId: string;
  submittedAtUtc: string;
  reviewer?: string | null;
  trustScore: number;
  progressPercentage: number;
  recommendation: string;
  recommendationReason?: string | null;
  checklist: AdminDriverVerificationChecklistItemResponse[];
  decisionNote: string;
  internalNote: string;
  rejectionReasonOptions: string[];
}

interface DriverActionResponse {
  id?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private readonly apiUrl = `${environment.apiUrl}/admin/drivers`;
  private readonly cacheStorageKey = 'zadana.superadmin.drivers.cache.v1';
  private readonly driversCache = new Map<string, Driver>();

  constructor(private readonly http: HttpClient) {
    this.restoreCache();
    this.refreshCacheInBackground();
  }

  getDriverById(id: string): Observable<Driver | undefined> {
    const cached = this.getDriverSnapshotById(id);
    const normalizedId = this.normalizeDriverId(id);

    return this.http.get<AdminDriverDetailResponse>(`${this.apiUrl}/${normalizedId}`).pipe(
      map((response) => this.mapDriverFromDetail(response)),
      tap((driver) => this.upsertCache(driver)),
      catchError(() => of(cached))
    );
  }

  getDriverDetailRecordById(id: string): Observable<DriverDetailRecord | undefined> {
    return this.http.get<AdminDriverDetailResponse>(`${this.apiUrl}/${this.normalizeDriverId(id)}`).pipe(
      map((response) => this.mapDriverDetailRecord(response)),
      tap((detail) => this.upsertCache(detail)),
      catchError(() => of(undefined))
    );
  }

  getDriverSnapshotById(id: string): Driver | undefined {
    const normalizedId = id.trim();
    const driver = [...this.driversCache.values()].find((item) =>
      item.id === normalizedId || item.driverId === normalizedId);

    return driver ? this.cloneDriver(driver) : undefined;
  }

  getDriversSnapshot(): Driver[] {
    return [...this.driversCache.values()].map((driver) => this.cloneDriver(driver));
  }

  getLiveSnapshot(pageSize = 80): Observable<Driver[]> {
    const params = new HttpParams()
      .set('page', '1')
      .set('pageSize', String(Math.max(1, Math.min(pageSize, 100))));

    return this.http.get<AdminDriversListResponse>(this.apiUrl, { params }).pipe(
      map((response) => response.items.map((item) => this.mapListItem(item))),
      tap((drivers) => this.replaceCache(drivers)),
      catchError(() => of(this.getDriversSnapshot().slice(0, pageSize)))
    );
  }

  findDriverByIdentity(criteria: { driverId?: string | null; phoneNumber?: string | null; fullName?: string | null }): Driver | undefined {
    const normalizedDriverId = criteria.driverId?.trim();
    const normalizedPhone = this.normalizePhone(criteria.phoneNumber);
    const normalizedName = this.normalizeName(criteria.fullName);

    const driver = [...this.driversCache.values()].find((item) =>
      (normalizedDriverId && (item.id === normalizedDriverId || item.driverId === normalizedDriverId))
      || (normalizedPhone && this.normalizePhone(item.phoneNumber) === normalizedPhone)
      || (normalizedName && this.normalizeName(`${item.firstName} ${item.lastName}`) === normalizedName)
    );

    return driver ? this.cloneDriver(driver) : undefined;
  }

  getDrivers(
    page: number,
    pageSize: number,
    searchTerm = '',
    filters: DriverFilters = {}
  ): Observable<{ items: Driver[]; totalCount: number }> {
    let params = new HttpParams()
      .set('page', String(Math.max(1, page)))
      .set('pageSize', String(Math.max(1, Math.min(pageSize, 100))));

    if (searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }

    if (filters.city) {
      params = params.set('city', filters.city);
    }

    if (filters.status) {
      params = params.set('status', filters.status);
    }

    if (filters.verificationStatus) {
      params = params.set('verificationStatus', this.mapVerificationFilter(filters.verificationStatus));
    }

    if (filters.vehicleType) {
      params = params.set('vehicleType', filters.vehicleType);
    }

    if (filters.performance) {
      params = params.set('performance', filters.performance);
    }

    return this.http.get<AdminDriversListResponse>(this.apiUrl, { params }).pipe(
      map((response) => ({
        items: response.items.map((item) => this.mapListItem(item)),
        totalCount: response.totalCount
      })),
      tap((response) => response.items.forEach((driver) => this.upsertCache(driver))),
      catchError(() => of(this.filterLocalDrivers(page, pageSize, searchTerm, filters)))
    );
  }

  getDriverKPIs(): Observable<DriverKPIs> {
    const params = new HttpParams().set('page', '1').set('pageSize', '1');

    return this.http.get<AdminDriversListResponse>(this.apiUrl, { params }).pipe(
      map((response) => response.kpis),
      map((kpis) => ({
        total: kpis.total,
        onlineNow: kpis.onlineNow,
        onMission: kpis.onMission,
        underReview: kpis.underReview,
        suspended: kpis.suspended,
        lowPerformance: kpis.lowPerformance
      })),
      catchError(() => of(this.calculateLocalKpis()))
    );
  }

  reviewDriver(id: string, action: 'approve' | 'request-docs' | 'reject', note?: string): Observable<DriverActionResponse> {
    return this.http.post<DriverActionResponse>(`${this.apiUrl}/${this.normalizeDriverId(id)}/review`, {
      action,
      note: note?.trim() || null
    });
  }

  suspendDriver(id: string, reason?: string): Observable<DriverActionResponse> {
    return this.http.post<DriverActionResponse>(`${this.apiUrl}/${this.normalizeDriverId(id)}/suspend`, {
      reason: reason?.trim() || null
    });
  }

  reactivateDriver(id: string): Observable<DriverActionResponse> {
    return this.http.post<DriverActionResponse>(`${this.apiUrl}/${this.normalizeDriverId(id)}/reactivate`, {});
  }

  addDriverNote(id: string, message: string): Observable<DriverActionResponse> {
    return this.http.post<DriverActionResponse>(`${this.apiUrl}/${this.normalizeDriverId(id)}/notes`, {
      message: message.trim()
    });
  }

  private mapListItem(item: AdminDriverListItemResponse): Driver {
    const status = this.mapDriverStatus(item.status);
    const verificationStatus = this.mapVerificationStatus(item.verificationStatus, status);

    return {
      id: item.id,
      driverId: item.driverDisplayId,
      firstName: item.firstName,
      lastName: item.lastName,
      phoneNumber: item.phoneNumber,
      imageUrl: item.imageUrl || undefined,
      city: item.city || 'Unknown',
      status,
      verificationStatus,
      tasks: {
        active: item.activeTasks,
        completed: item.completedTasks,
        subtitle: this.buildTaskSubtitle(status, item.activeTasks, item.completedTasks)
      },
      acceptanceRate: Number(item.acceptanceRate ?? 0),
      walletBalance: Number(item.walletBalance ?? 0),
      issues: this.normalizeIssues(item.issues),
      collectionPaymentStatus: item.collectionPaymentStatus || this.mapCollectionPaymentStatus(Number(item.walletBalance ?? 0)),
      lastSeenAt: this.parseDate(item.lastSeenAt),
      performance: this.mapPerformance(item.performance),
      vehicleType: this.mapVehicleType(item.vehicleType),
      alerts: item.alerts?.length ? [...item.alerts] : undefined
    };
  }

  private mapDriverFromDetail(response: AdminDriverDetailResponse): Driver {
    return this.mapListItem({
      id: response.id,
      driverDisplayId: response.driverDisplayId,
      firstName: response.firstName,
      lastName: response.lastName,
      phoneNumber: response.phoneNumber,
      imageUrl: response.imageUrl,
      city: response.city,
      status: response.status,
      verificationStatus: response.verificationStatus,
      activeTasks: response.activeTasks,
      completedTasks: response.completedTasks,
      acceptanceRate: response.acceptanceRate,
      walletBalance: response.walletBalance,
      performance: response.performance,
      vehicleType: response.vehicleType,
      lastSeenAt: response.lastSeenAt,
      issues: response.issues,
      collectionPaymentStatus: response.collectionPaymentStatus,
      alerts: response.alerts
    });
  }

  private mapDriverDetailRecord(response: AdminDriverDetailResponse): DriverDetailRecord {
    const driver = this.mapDriverFromDetail(response);
    const notes = this.mapDriverNotes(response.notes);
    const documents = this.mapDriverDocuments(response.documents);
    const incidents = this.mapDriverIncidents(response.incidents);
    const taskAssignments = this.mapOperationsTasks(response.operations.taskAssignments);
    const recentTrips = this.mapRecentTrips(
      taskAssignments,
      response.operations.zoneName || response.overview.zoneName || response.zoneName || response.city
    );

    return {
      ...driver,
      displayName: `${response.firstName} ${response.lastName}`.trim(),
      email: response.email,
      address: response.overview.address || response.address || undefined,
      joinedAt: this.formatDate(response.joinedAt),
      vehicleLabel: driver.vehicleType ? this.mapVehicleLabel(driver.vehicleType) : 'COMMON.NOT_AVAILABLE',
      licenseNumber: response.overview.licenseNumber || response.licenseNumber || '',
      zoneName: response.overview.zoneName || response.zoneName || undefined,
      liveZone: response.operations.zoneName || response.overview.zoneName || response.zoneName || response.city,
      liveLatitude: response.operations.currentLatitude ?? null,
      liveLongitude: response.operations.currentLongitude ?? null,
      liveSpeedKmh: null,
      liveMissionId: this.getActiveMissionId(taskAssignments),
      todayTrips: response.activeTasks,
      todayTripsDelta: this.buildTodayTripsDelta(response.activeTasks, response.completedTasks),
      completionRate: response.performanceDetails.completionRate || response.overview.completionRate || response.acceptanceRate,
      averageDelayMinutes: response.operations.avgDeliveryMinutes ? Math.round(response.operations.avgDeliveryMinutes) : 0,
      codPendingAmount: Math.max(0, response.financeDetails.pendingDeductions ?? response.finance.pendingBalance),
      totalEarnings: response.finance.totalEarnings,
      currentDueAmount: response.financeDetails.dueAmount ?? response.finance.pendingBalance,
      codCollectedAmount: response.financeDetails.codCollected ?? response.finance.codCollected,
      complianceStatusLabel: this.mapComplianceStatusLabel(response.compliance.riskLevel),
      complianceStatusVariant: this.mapComplianceStatusVariant(response.compliance.riskLevel),
      complianceRiskPoints: this.mapComplianceRiskPoints(response.compliance),
      complianceRiskThreshold: 10,
      complianceAlertThreshold: 7,
      routeEfficiencyDelta: this.buildRouteEfficiencyDelta(response.performanceDetails.commitmentScore),
      lifetimeTrips: response.completedTasks,
      weeklyEfficiency: [],
      profileReadiness: {
        isProfileComplete: response.profileReadiness.isProfileComplete,
        completionPercent: response.profileReadiness.completionPercent,
        missingRequirements: [...response.profileReadiness.missingRequirements],
        canSubmitForReview: response.profileReadiness.canSubmitForReview,
        checklist: this.mapVerificationChecklist(response.profileReadiness.checklist)
      },
      notes,
      documents,
      recentTrips,
      lifecycleStages: this.mapLifecycleStages(response.workflow.lifecycleStages),
      workflow: this.mapWorkflow(response.workflow),
      operations: {
        zoneName: response.operations.zoneName || response.overview.zoneName || response.zoneName || response.city,
        zoneCapacityLabel: this.buildZoneCapacityLabel(response.operations.activeDriversInZone, response.operations.zoneCapacityLimit),
        zoneUtilizationPercent: this.buildZoneUtilizationPercent(response.operations.activeDriversInZone, response.operations.zoneCapacityLimit),
        avgDeliveryTimeLabel: this.buildAvgDeliveryTimeLabel(response.operations.avgDeliveryMinutes),
        activeDriversLabel: this.buildActiveDriversLabel(response.operations.activeDriversInZone),
        stabilityLabel: this.buildOperationsStabilityLabel(response.operations.avgDeliveryMinutes, response.activeTasks),
        rules: [],
        taskAssignments
      },
      performanceSnapshot: {
        routeScore: Number(response.performanceDetails.commitmentScore || response.overview.commitmentScore || 0),
        rankInZone: null,
        rankInFleet: null,
        metricCards: response.performanceDetails.metrics.map((metric) => ({
          id: metric.id,
          title: this.mapPerformanceMetricTitle(metric.id),
          value: metric.displayValue,
          helper: this.mapPerformanceMetricHelper(metric.id),
          deltaLabel: metric.deltaValue || undefined,
          tone: this.mapMetricTone(metric.tone)
        })),
        benchmarks: response.performanceDetails.benchmarks.map((benchmark) => ({
          label: this.mapPerformanceBenchmarkLabel(benchmark.id),
          driverValue: benchmark.driverValue,
          regionValue: benchmark.regionValue,
          fleetValue: benchmark.fleetValue,
          unit: benchmark.unit,
          insight: this.mapPerformanceInsightCode(benchmark.insightCode)
        })),
        insightGroups: response.performanceDetails.insightGroups.map((group) => ({
          title: this.mapPerformanceGroupTitle(group.id),
          icon: group.icon,
          tone: this.mapMetricTone(group.tone),
          items: group.itemCodes.map((item) => this.mapPerformanceInsightCode(item))
        })),
        heatmapRows: []
      },
      support: {
        openNotesCount: response.support.openNotesCount,
        ticketsCount: response.support.ticketsCount,
        pendingFollowUpsCount: response.support.pendingFollowUpsCount,
        escalationsCount: response.support.escalationsCount,
        unresolvedCount: response.support.unresolvedCount,
        lastUpdateLabel: response.support.lastUpdateAtUtc
          ? this.formatDateTime(response.support.lastUpdateAtUtc)
          : 'DRIVERS.DETAIL.SUPPORT.NO_ACTIVITY',
        reviewerName: response.support.reviewerName || 'DRIVERS.DETAIL.SUPPORT.REVIEWER_OPERATIONS',
        reviewerRole: this.mapSupportReviewerRole(response.support.reviewerRole),
        reviewerOnline: response.support.reviewerOnline,
        chatMessages: response.support.chatMessages.map((message) => ({
          direction: message.direction,
          message: message.message,
          time: this.formatDateTime(message.createdAtUtc)
        })),
        tickets: response.support.tickets.map((ticket) => ({
          id: ticket.id,
          subject: this.mapSupportTicketSubject(ticket.subject),
          status: this.mapSupportTicketStatus(ticket.status),
          statusLabel: this.mapSupportTicketStatusKey(ticket.status),
          priority: this.mapSupportTicketPriority(ticket.priority),
          priorityLabel: this.mapSupportTicketPriorityKey(ticket.priority),
          reviewer: ticket.reviewer,
          updatedAt: this.formatDateTime(ticket.updatedAtUtc),
          linkedOrder: ticket.linkedOrderCode || ''
        })),
        tags: [],
        followUps: response.support.followUps.map((followUp) => ({
          title: this.mapSupportFollowUpCode(followUp.code),
          dueLabel: this.mapSupportDueLabel(followUp.dueLabel),
          tone: followUp.tone
        }))
      },
      compliance: {
        openCases: response.compliance.openCases,
        criticalCases: response.compliance.criticalCases,
        safetyAlerts: response.compliance.safetyAlerts,
        expiredDocuments: response.compliance.expiredDocuments,
        suspensions: response.compliance.suspensions,
        riskLabel: this.mapComplianceStatusLabel(response.compliance.riskLevel),
        documentHealth: {
          valid: response.compliance.documentHealth.valid,
          expiring: response.compliance.documentHealth.expiring,
          review: response.compliance.documentHealth.review
        },
        incidents
      },
      finance: {
        availableBalance: response.financeDetails.availableBalance,
        dueAmount: response.financeDetails.dueAmount,
        codCollected: response.financeDetails.codCollected,
        pendingDeductions: response.financeDetails.pendingDeductions,
        nextPayoutDate: response.financeDetails.nextPayoutDateUtc
          ? this.formatDate(response.financeDetails.nextPayoutDateUtc)
          : 'COMMON.NOT_AVAILABLE',
        payoutMethod: response.financeDetails.payoutMethod
          ? this.mapPayoutMethod(response.financeDetails.payoutMethod)
          : 'COMMON.NOT_AVAILABLE',
        statementPeriod: this.mapStatementPeriod(response.financeDetails.statementPeriod),
        entries: this.mapFinanceEntries(response.financeDetails.entries)
      },
      verification: {
        applicationId: response.verification.applicationId,
        submittedAt: this.formatDateTime(response.verification.submittedAtUtc),
        reviewer: response.verification.reviewer
          ? this.mapVerificationReviewer(response.verification.reviewer)
          : 'DRIVERS.DETAIL.SUPPORT.REVIEWER_OPERATIONS',
        trustScore: response.verification.trustScore,
        progressPercentage: response.verification.progressPercentage,
        recommendation: this.mapVerificationRecommendation(response.verification.recommendation),
        recommendationReason: response.verification.recommendationReason || 'DRIVERS.DETAIL.VERIFICATION.NO_RECOMMENDATION_REASON',
        checklist: this.mapVerificationChecklist(response.verification.checklist),
        decisionNote: response.verification.decisionNote || '',
        internalNote: response.verification.internalNote || '',
        rejectionReasonOptions: response.verification.rejectionReasonOptions.map((reason) => this.mapRejectionReason(reason))
      }
    };
  }

  private mapDriverNotes(notes: AdminDriverNoteResponse[]): DriverInternalNote[] {
    return notes.map((note) => ({
      author: note.authorName,
      role: 'DRIVERS.DETAIL.SUPPORT.REVIEWER_OPERATIONS',
      createdAt: this.formatDateTime(note.createdAtUtc),
      message: note.message
    }));
  }

  private mapDriverDocuments(documents: AdminDriverDocumentResponse[]): DriverDocumentRecord[] {
    return documents.map((document, index) => {
      const mappedStatus = this.mapDocumentStatus(document.status);

      return {
        id: `${document.documentType}-${index}`,
        title: this.mapDocumentTitle(document.documentType),
        imageUrl: document.imageUrl || 'assets/images/placeholders/driver-avatar.png',
        status: mappedStatus,
        statusLabel: this.mapDocumentStatusLabel(mappedStatus),
        expiryDate: document.expiryInfo || this.mapDocumentExpiryLabel(document.status),
        subtitle: this.mapDocumentSubtitle(document.documentType)
      };
    });
  }

  private mapDriverIncidents(incidents: AdminDriverIncidentResponse[]): DriverIncidentRecord[] {
    return incidents.map((incident) => ({
      id: incident.id,
      type: this.mapIncidentTypeLabel(incident.incidentType),
      severity: this.mapIncidentSeverity(incident.severity),
      severityLabel: this.mapIncidentSeverityLabel(incident.severity),
      status: this.mapIncidentStatus(incident.status),
      statusLabel: this.mapIncidentStatusLabel(incident.status),
      reviewer: incident.reviewerName || 'DRIVERS.DETAIL.SUPPORT.REVIEWER_OPERATIONS',
      createdAt: this.formatDateTime(incident.createdAtUtc),
      linkedOrder: incident.linkedOrderId || 'N/A',
      summary: incident.summary,
      evidenceImages: []
    }));
  }

  private mapOperationsTasks(assignments: AdminDriverOperationsTaskResponse[]): DriverTaskAssignment[] {
    return assignments.map((assignment) => ({
      id: assignment.id,
      vendor: assignment.vendorName,
      zone: assignment.zoneName,
      status: this.mapAssignmentStatus(assignment.status),
      statusLabel: this.mapAssignmentStatusLabel(assignment.status),
      assignedAt: this.formatDateTime(assignment.assignedAtUtc),
      duration: assignment.durationMinutes ? `${assignment.durationMinutes}m` : '--',
      delayLabel: assignment.delayLabel || '00:00',
      codAmount: assignment.codAmount
    }));
  }

  private getActiveMissionId(assignments: DriverTaskAssignment[]): string | null {
    const active = assignments.find((assignment) =>
      assignment.status !== 'COMPLETED' && assignment.status !== 'FAILED');

    return active?.id ?? null;
  }

  private mapRecentTrips(assignments: DriverTaskAssignment[], zoneLabel: string) {
    return assignments.slice(0, 6).map((assignment) => ({
      id: assignment.id,
      time: assignment.assignedAt,
      category: `${zoneLabel} · ${assignment.vendor}`,
      status: (assignment.status === 'FAILED'
        ? 'CANCELLED'
        : assignment.status === 'COMPLETED'
          ? 'COMPLETED'
          : 'IN_PROGRESS') as DriverDetailRecord['recentTrips'][number]['status'],
      duration: assignment.duration,
      codAmount: assignment.codAmount,
      delayText: assignment.delayLabel !== '00:00' && assignment.delayLabel !== '--' ? assignment.delayLabel : undefined
    }));
  }

  private mapFinanceEntries(entries: AdminDriverFinanceEntryResponse[]): DriverFinanceEntry[] {
    return entries.map((entry) => ({
      id: entry.id,
      reference: entry.reference,
      type: this.mapFinanceEntryType(entry.type),
      status: this.mapFinanceStatus(entry.status),
      statusLabel: this.mapFinanceStatusKey(entry.status),
      amount: entry.amount,
      fee: entry.fee,
      method: this.mapFinanceMethod(entry.method),
      date: this.formatDateTime(entry.createdAtUtc)
    }));
  }

  private mapVerificationChecklist(items: AdminDriverVerificationChecklistItemResponse[]): DriverVerificationChecklistItem[] {
    return items.map((item) => ({
      label: this.mapVerificationChecklistCode(item.code),
      completed: item.completed,
      note: item.note ? this.mapVerificationChecklistNote(item.note) : undefined,
      critical: item.critical
    }));
  }

  private filterLocalDrivers(
    page: number,
    pageSize: number,
    searchTerm: string,
    filters: DriverFilters
  ): { items: Driver[]; totalCount: number } {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = this.getDriversSnapshot().filter((driver) => {
      const matchesSearch = !normalizedSearch || [
        driver.driverId,
        driver.firstName,
        driver.lastName,
        `${driver.firstName} ${driver.lastName}`,
        driver.phoneNumber,
        driver.city
      ].some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesCity = !filters.city || driver.city === filters.city;
      const matchesStatus = !filters.status || driver.status === filters.status;
      const matchesVerification = !filters.verificationStatus || driver.verificationStatus === filters.verificationStatus;
      const matchesVehicleType = !filters.vehicleType || driver.vehicleType === filters.vehicleType;
      const matchesPerformance = !filters.performance || driver.performance === filters.performance;

      return matchesSearch && matchesCity && matchesStatus && matchesVerification && matchesVehicleType && matchesPerformance;
    });

    const start = (Math.max(1, page) - 1) * Math.max(1, pageSize);
    return {
      items: filtered.slice(start, start + Math.max(1, pageSize)),
      totalCount: filtered.length
    };
  }

  private calculateLocalKpis(): DriverKPIs {
    const drivers = this.getDriversSnapshot();

    return {
      total: drivers.length,
      onlineNow: drivers.filter((driver) => driver.status === 'Online').length,
      onMission: drivers.filter((driver) => driver.status === 'OnMission').length,
      underReview: drivers.filter((driver) =>
        driver.verificationStatus === VerificationStatus.UnderReview ||
        driver.verificationStatus === VerificationStatus.Unverified).length,
      suspended: drivers.filter((driver) => driver.status === 'Suspended').length,
      lowPerformance: drivers.filter((driver) => driver.performance === DriverPerformance.Low).length
    };
  }

  private refreshCacheInBackground(): void {
    const params = new HttpParams().set('page', '1').set('pageSize', '100');

    this.http.get<AdminDriversListResponse>(this.apiUrl, { params }).pipe(
      map((response) => response.items.map((item) => this.mapListItem(item))),
      catchError(() => of([]))
    ).subscribe((drivers) => {
      if (drivers.length) {
        this.replaceCache(drivers);
      }
    });
  }

  private upsertCache(driver: Driver): void {
    this.driversCache.set(driver.id, this.cloneDriver(driver));
    this.persistCache();
  }

  private replaceCache(drivers: Driver[]): void {
    this.driversCache.clear();
    drivers.forEach((driver) => this.driversCache.set(driver.id, this.cloneDriver(driver)));
    this.persistCache();
  }

  private persistCache(): void {
    try {
      localStorage.setItem(this.cacheStorageKey, JSON.stringify(this.getDriversSnapshot()));
    } catch {
      // Ignore storage errors and keep runtime cache only.
    }
  }

  private restoreCache(): void {
    try {
      const serialized = localStorage.getItem(this.cacheStorageKey);
      if (!serialized) {
        return;
      }

      const parsed = JSON.parse(serialized) as Driver[];
      parsed.forEach((driver) => {
        this.driversCache.set(driver.id, {
          ...driver,
          lastSeenAt: this.parseDate(driver.lastSeenAt)
        });
      });
    } catch {
      this.driversCache.clear();
    }
  }

  private mapDriverStatus(status: string): DriverStatus {
    switch (status) {
      case 'OnMission':
        return 'OnMission';
      case 'Suspended':
        return 'Suspended';
      case 'Offline':
        return 'Offline';
      default:
        return 'Online';
    }
  }

  private mapVerificationStatus(status: string, driverStatus: DriverStatus): VerificationStatus {
    if (driverStatus === 'Suspended') {
      return VerificationStatus.Suspended;
    }

    switch (status) {
      case 'Approved':
        return VerificationStatus.Verified;
      case 'UnderReview':
        return VerificationStatus.UnderReview;
      case 'NeedsDocuments':
      case 'Rejected':
      default:
        return VerificationStatus.Unverified;
    }
  }

  private mapVerificationFilter(status: VerificationStatus): string {
    switch (status) {
      case VerificationStatus.Verified:
        return 'Approved';
      case VerificationStatus.UnderReview:
        return 'UnderReview';
      case VerificationStatus.Unverified:
        return 'NeedsDocuments';
      case VerificationStatus.Suspended:
        return 'Rejected';
      default:
        return status;
    }
  }

  private mapPerformance(value: string): DriverPerformance {
    switch (value) {
      case 'Excellent':
        return DriverPerformance.Excellent;
      case 'Good':
        return DriverPerformance.Good;
      case 'Low':
        return DriverPerformance.Low;
      default:
        return DriverPerformance.NeedsImprovement;
    }
  }

  private mapVehicleType(value: DriverVehicleType | string | null | undefined): DriverVehicleType | undefined {
    switch (String(value ?? '').trim().toLowerCase()) {
      case 'car':
        return DriverVehicleType.Car;
      case 'motorcycle':
      case 'motorbike':
        return DriverVehicleType.Motorcycle;
      case 'scooter':
        return DriverVehicleType.Scooter;
      case 'van':
        return DriverVehicleType.Van;
      case 'bicycle':
        return DriverVehicleType.Bicycle;
      case 'truck':
        return DriverVehicleType.Truck;
      default:
        return undefined;
    }
  }

  private mapCollectionPaymentStatus(balance: number): 'good' | 'warning' | 'critical' {
    if (balance < 0) {
      return 'critical';
    }

    return balance < 200 ? 'warning' : 'good';
  }

  private buildTaskSubtitle(status: DriverStatus, activeTasks: number, completedTasks: number): string {
    switch (status) {
      case 'OnMission':
        return `${activeTasks} active deliveries`;
      case 'Online':
        return activeTasks > 0 ? `${activeTasks} tasks in dispatch queue` : `Ready for dispatch · ${completedTasks} completed`;
      case 'Suspended':
        return 'Suspended pending operational review';
      default:
        return completedTasks > 0 ? `${completedTasks} completed deliveries` : 'No recent activity';
    }
  }

  private normalizeIssues(issues: string[]): string[] {
    const cleaned = issues.filter((issue) => issue !== 'clear');
    return cleaned.length ? Array.from(new Set(cleaned)) : ['clear'];
  }

  private normalizeDriverId(id: string): string {
    return id.trim();
  }

  private normalizePhone(value: string | null | undefined): string {
    return (value || '').replace(/\D+/g, '');
  }

  private normalizeName(value: string | null | undefined): string {
    return (value || '')
      .toLowerCase()
      .replace(/[^a-z\u0600-\u06ff0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private cloneDriver(driver: Driver): Driver {
    return {
      ...driver,
      tasks: { ...driver.tasks },
      issues: [...driver.issues],
      alerts: driver.alerts ? [...driver.alerts] : undefined,
      lastSeenAt: this.parseDate(driver.lastSeenAt)
    };
  }

  private parseDate(value: string | Date): Date {
    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private formatDate(value: string): string {
    const parsed = this.parseDate(value);
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(parsed);
  }

  private formatDateTime(value: string): string {
    const parsed = this.parseDate(value);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(parsed);
  }

  private formatDuration(startValue: string, endValue: string): string {
    const start = this.parseDate(startValue).getTime();
    const end = this.parseDate(endValue).getTime();

    if (!start || !end || end <= start) {
      return '--';
    }

    const totalMinutes = Math.max(1, Math.round((end - start) / 60000));
    return `${totalMinutes}m`;
  }

  private mapDocumentTitle(type: string): string {
    switch (type) {
      case 'NationalId':
        return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.TITLES.NATIONAL_ID';
      case 'License':
        return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.TITLES.LICENSE';
      case 'Vehicle':
        return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.TITLES.VEHICLE';
      case 'PersonalPhoto':
        return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.TITLES.SELFIE';
      default:
        return type;
    }
  }

  private mapDocumentSubtitle(type: string): string {
    switch (type) {
      case 'NationalId':
        return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.SUBTITLES.NATIONAL_ID';
      case 'License':
        return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.SUBTITLES.LICENSE';
      case 'Vehicle':
        return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.SUBTITLES.VEHICLE';
      case 'PersonalPhoto':
        return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.SUBTITLES.SELFIE';
      default:
        return 'COMMON.NOT_AVAILABLE';
    }
  }

  private mapDocumentStatus(status: string): 'valid' | 'expiring' | 'review' {
    switch (status.toLowerCase()) {
      case 'valid':
        return 'valid';
      case 'expiring':
        return 'expiring';
      default:
        return 'review';
    }
  }

  private mapDocumentStatusLabel(status: 'valid' | 'expiring' | 'review'): string {
    switch (status) {
      case 'valid':
        return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.STATUS.VALID';
      case 'expiring':
        return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.STATUS.EXPIRING';
      default:
        return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.STATUS.UNDER_REVIEW';
    }
  }

  private mapIncidentSeverityLabel(value: string): string {
    switch (value.toUpperCase()) {
      case 'CRITICAL':
        return 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.SEVERITY.CRITICAL';
      case 'HIGH':
        return 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.SEVERITY.HIGH';
      default:
        return 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.SEVERITY.MEDIUM';
    }
  }

  private mapIncidentStatusLabel(value: string): string {
    switch (value.toUpperCase()) {
      case 'RESOLVED':
        return 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.STATUS.RESOLVED';
      case 'WAITING_DOCS':
        return 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.STATUS.WAITING_DOCS';
      case 'REVIEW':
      case 'INREVIEW':
        return 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.STATUS.REVIEW';
      default:
        return 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.STATUS.NEW';
    }
  }

  private mapIncidentTypeLabel(value: string): string {
    switch (value.toUpperCase()) {
      case 'TRAFFIC_ACCIDENT':
      case 'TRAFFICINCIDENT':
        return 'TRAFFIC_ACCIDENT';
      case 'FRAUD_SUSPECTED':
      case 'FRAUD':
        return 'FRAUD_SUSPECTED';
      case 'REPEATED_DELAY':
        return 'REPEATED_DELAY';
      default:
        return value;
    }
  }

  private mapIncidentSeverity(value: string): DriverIncidentRecord['severity'] {
    switch (value.toUpperCase()) {
      case 'CRITICAL':
        return 'CRITICAL';
      case 'HIGH':
        return 'HIGH';
      default:
        return 'MEDIUM';
    }
  }

  private mapIncidentStatus(value: string): DriverIncidentRecord['status'] {
    switch (value.toUpperCase()) {
      case 'RESOLVED':
        return 'RESOLVED';
      case 'WAITING_DOCS':
        return 'WAITING_DOCS';
      case 'REVIEW':
      case 'INREVIEW':
        return 'REVIEW';
      default:
        return 'NEW';
    }
  }

  private mapAssignmentStatus(value: string): DriverTaskAssignment['status'] {
    switch (value.toUpperCase()) {
      case 'DELIVERED':
        return 'COMPLETED';
      case 'FAILED':
        return 'FAILED';
      case 'PICKEDUP':
        return 'IN_PROGRESS';
      case 'SEARCHINGDRIVER':
        return 'WAITING_DRIVER';
      default:
        return 'PREPARING';
    }
  }

  private mapAssignmentStatusLabel(value: string): string {
    switch (this.mapAssignmentStatus(value)) {
      case 'COMPLETED':
        return 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STATUS.COMPLETED';
      case 'FAILED':
        return 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STATUS.FAILED';
      case 'IN_PROGRESS':
        return 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STATUS.IN_PROGRESS';
      case 'WAITING_DRIVER':
        return 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STATUS.WAITING_DRIVER';
      default:
        return 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STATUS.PREPARING';
    }
  }

  private mapVehicleLabel(vehicleType: DriverVehicleType): string {
    switch (vehicleType) {
      case DriverVehicleType.Car:
        return 'DRIVERS.VEHICLES.CAR';
      case DriverVehicleType.Motorcycle:
        return 'DRIVERS.VEHICLES.BIKE';
      case DriverVehicleType.Scooter:
        return 'DRIVERS.VEHICLES.SCOOTER';
      case DriverVehicleType.Van:
        return 'DRIVERS.VEHICLES.VAN';
      case DriverVehicleType.Bicycle:
        return 'DRIVERS.VEHICLES.BICYCLE';
      case DriverVehicleType.Truck:
        return 'DRIVERS.VEHICLES.TRUCK';
      default:
        return 'COMMON.NOT_AVAILABLE';
    }
  }

  private buildTodayTripsDelta(activeTasks: number, completedTasks: number): string {
    if (activeTasks > 0) {
      return `+${activeTasks}`;
    }

    if (completedTasks > 0) {
      return `${completedTasks}`;
    }

    return '0';
  }

  private mapComplianceStatusLabel(riskLevel: string): string {
    switch (riskLevel.toUpperCase()) {
      case 'HIGH':
        return 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.RISK.HIGH';
      case 'MEDIUM':
        return 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.RISK.MEDIUM';
      default:
        return 'DRIVERS.DETAIL.COMPLIANCE.DYNAMIC.RISK.LOW';
    }
  }

  private mapComplianceStatusVariant(riskLevel: string): DriverDetailRecord['complianceStatusVariant'] {
    switch (riskLevel.toUpperCase()) {
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      default:
        return 'success';
    }
  }

  private mapComplianceRiskPoints(compliance: AdminDriverComplianceResponse): number {
    return (compliance.criticalCases * 4)
      + (compliance.openCases * 2)
      + compliance.safetyAlerts
      + (compliance.expiredDocuments * 2)
      + (compliance.suspensions * 3);
  }

  private buildRouteEfficiencyDelta(commitmentScore: number): string {
    if (commitmentScore >= 85) {
      return '+12';
    }

    if (commitmentScore >= 70) {
      return '+4';
    }

    if (commitmentScore >= 55) {
      return '-3';
    }

    return '-10';
  }

  private mapLifecycleStages(stages: AdminDriverLifecycleStageResponse[]): DriverLifecycleStage[] {
    return stages.map((stage) => ({
      id: stage.id,
      label: this.mapLifecycleStageLabel(stage.id),
      description: this.mapLifecycleStageDescription(stage.id),
      state: this.mapLifecycleStageState(stage.state),
      metric: this.mapLifecycleStageMetric(stage.id, stage.state)
    }));
  }

  private mapLifecycleStageLabel(stageId: string): string {
    switch (stageId.toLowerCase()) {
      case 'verification':
        return 'DRIVERS.DETAIL.LIFECYCLE.VERIFICATION.LABEL';
      case 'readiness':
        return 'DRIVERS.DETAIL.LIFECYCLE.ACTIVATION.LABEL';
      case 'dispatch':
      case 'mission':
        return 'DRIVERS.DETAIL.LIFECYCLE.OPERATIONS.LABEL';
      case 'finance':
        return 'DRIVERS.DETAIL.LIFECYCLE.FINANCE.LABEL';
      default:
        return 'DRIVERS.DETAIL.LIFECYCLE.APPLICATION.LABEL';
    }
  }

  private mapLifecycleStageDescription(stageId: string): string {
    switch (stageId.toLowerCase()) {
      case 'verification':
        return 'DRIVERS.DETAIL.LIFECYCLE.VERIFICATION.DESCRIPTION';
      case 'readiness':
        return 'DRIVERS.DETAIL.LIFECYCLE.ACTIVATION.DESCRIPTION';
      case 'dispatch':
      case 'mission':
        return 'DRIVERS.DETAIL.LIFECYCLE.OPERATIONS.DESCRIPTION';
      case 'finance':
        return 'DRIVERS.DETAIL.LIFECYCLE.FINANCE.DESCRIPTION';
      default:
        return 'DRIVERS.DETAIL.LIFECYCLE.APPLICATION.DESCRIPTION';
    }
  }

  private mapLifecycleStageMetric(stageId: string, state: string): string {
    const normalizedStage = stageId.toLowerCase();
    const normalizedState = state.toLowerCase();

    if (normalizedStage === 'verification') {
      return normalizedState === 'completed'
        ? 'DRIVERS.DETAIL.LIFECYCLE.VERIFICATION.DESCRIPTION'
        : 'DRIVERS.DETAIL.LIFECYCLE.APPLICATION.METRIC';
    }

    if (normalizedStage === 'readiness') {
      return normalizedState === 'completed'
        ? 'DRIVERS.DETAIL.LIFECYCLE.ACTIVATION.METRIC_ACTIVE'
        : 'DRIVERS.DETAIL.LIFECYCLE.ACTIVATION.METRIC_PENDING';
    }

    if (normalizedStage === 'dispatch' || normalizedStage === 'mission') {
      if (normalizedState === 'current') {
        return 'DRIVERS.DETAIL.LIFECYCLE.OPERATIONS.METRIC_ON_MISSION';
      }

      return normalizedState === 'attention'
        ? 'DRIVERS.DETAIL.LIFECYCLE.OPERATIONS.METRIC_PAUSED'
        : 'DRIVERS.DETAIL.LIFECYCLE.OPERATIONS.METRIC_ACTIVE';
    }

    if (normalizedStage === 'finance') {
      return normalizedState === 'attention'
        ? 'DRIVERS.DETAIL.LIFECYCLE.FINANCE.METRIC_URGENT'
        : 'DRIVERS.DETAIL.LIFECYCLE.FINANCE.METRIC_HEALTHY';
    }

    return 'DRIVERS.DETAIL.LIFECYCLE.APPLICATION.METRIC';
  }

  private mapLifecycleStageState(state: string): DriverLifecycleStage['state'] {
    switch (state.toLowerCase()) {
      case 'completed':
        return 'completed';
      case 'current':
        return 'current';
      case 'attention':
        return 'attention';
      default:
        return 'upcoming';
    }
  }

  private mapWorkflow(workflow: AdminDriverWorkflowResponse): DriverWorkflowSummary {
    return {
      state: this.mapWorkflowState(workflow.state),
      stateLabel: `DRIVERS.DETAIL.WORKFLOW.STATE_LABELS.${workflow.state}`,
      summary: `DRIVERS.DETAIL.WORKFLOW.SUMMARIES.${workflow.state}`,
      nextActionLabel: `DRIVERS.DETAIL.WORKFLOW.NEXT_STEPS.${workflow.state}`,
      readiness: this.mapWorkflowReadiness(workflow.readiness),
      readinessLabel: this.mapWorkflowReadinessLabel(workflow.state, workflow.readiness),
      ownerTeamLabel: this.mapWorkflowOwnerTeam(workflow.state),
      queueLabel: `DRIVERS.DETAIL.WORKFLOW.QUEUE_LABELS.${workflow.state}`,
      blockers: workflow.blockers.map((item) => this.mapWorkflowItemCode(item)),
      alerts: workflow.alerts.map((item) => this.mapWorkflowItemCode(item)),
      actions: workflow.actions.map((action) => ({
        id: action.id as DriverWorkflowActionId,
        label: `DRIVERS.DETAIL.WORKFLOW.ACTION_LABELS.${action.id}`,
        helper: `DRIVERS.DETAIL.WORKFLOW.ACTION_HELPERS.${action.id}`,
        icon: this.mapWorkflowActionIcon(action.id),
        tone: this.mapWorkflowActionTone(action.tone),
        targetTab: this.mapWorkflowTargetTab(action.targetTab)
      }))
    };
  }

  private mapWorkflowState(state: string): DriverWorkflowSummary['state'] {
    switch (state) {
      case 'SUSPENDED':
      case 'PENDING_DOCUMENTS':
      case 'VERIFICATION_REVIEW':
      case 'READY_TO_ACTIVATE':
      case 'READY_FOR_DISPATCH':
      case 'ACTIVE_DELIVERY':
      case 'FINANCE_HOLD':
      case 'COMPLIANCE_REVIEW':
        return state;
      default:
        return 'READY_FOR_DISPATCH';
    }
  }

  private mapWorkflowReadiness(readiness: string): DriverWorkflowSummary['readiness'] {
    switch (readiness) {
      case 'BLOCKED':
      case 'LIMITED':
        return readiness;
      default:
        return 'READY';
    }
  }

  private mapWorkflowReadinessLabel(state: string, readiness: string): string {
    if (readiness === 'BLOCKED') {
      return state === 'COMPLIANCE_REVIEW' || state === 'SUSPENDED'
        ? 'DRIVERS.DETAIL.WORKFLOW.READINESS_LABELS.BLOCKED_BY_COMPLIANCE'
        : 'DRIVERS.DETAIL.WORKFLOW.READINESS_LABELS.BLOCKED_UNTIL_APPROVAL';
    }

    if (readiness === 'LIMITED') {
      return state === 'FINANCE_HOLD'
        ? 'DRIVERS.DETAIL.WORKFLOW.READINESS_LABELS.PARTIALLY_READY'
        : 'DRIVERS.DETAIL.WORKFLOW.READINESS_LABELS.READY_WITH_MONITORING';
    }

    if (state === 'ACTIVE_DELIVERY') {
      return 'DRIVERS.DETAIL.WORKFLOW.READINESS_LABELS.WORKING_NOW';
    }

    if (state === 'READY_TO_ACTIVATE') {
      return 'DRIVERS.DETAIL.WORKFLOW.READINESS_LABELS.READY_TO_REJOIN';
    }

    return 'DRIVERS.DETAIL.WORKFLOW.READINESS_LABELS.FULLY_READY';
  }

  private mapWorkflowOwnerTeam(state: string): string {
    switch (state) {
      case 'SUSPENDED':
        return 'DRIVERS.DETAIL.WORKFLOW.OWNER_TEAMS.COMPLIANCE_AND_OPERATIONS';
      case 'PENDING_DOCUMENTS':
      case 'VERIFICATION_REVIEW':
      case 'READY_TO_ACTIVATE':
        return 'DRIVERS.DETAIL.WORKFLOW.OWNER_TEAMS.VERIFICATION_TEAM';
      case 'COMPLIANCE_REVIEW':
        return 'DRIVERS.DETAIL.WORKFLOW.OWNER_TEAMS.COMPLIANCE_TEAM';
      case 'FINANCE_HOLD':
        return 'DRIVERS.DETAIL.WORKFLOW.OWNER_TEAMS.FINANCE_AND_OPERATIONS';
      case 'ACTIVE_DELIVERY':
        return 'DRIVERS.DETAIL.WORKFLOW.OWNER_TEAMS.LIVE_OPERATIONS';
      default:
        return 'DRIVERS.DETAIL.WORKFLOW.OWNER_TEAMS.OPERATIONS';
    }
  }

  private mapWorkflowActionIcon(actionId: string): string {
    switch (actionId) {
      case 'APPROVE_VERIFICATION':
        return 'verified';
      case 'REQUEST_DOCUMENTS':
        return 'assignment_late';
      case 'REJECT_VERIFICATION':
        return 'cancel';
      case 'CLEAR_FINANCE_HOLD':
        return 'rule';
      case 'SUSPEND_DRIVER':
        return 'block';
      case 'REACTIVATE_DRIVER':
        return 'play_circle';
      case 'MARK_READY_FOR_DISPATCH':
        return 'published_with_changes';
      case 'OPEN_SUPPORT':
        return 'support_agent';
      case 'OPEN_FINANCE':
        return 'account_balance_wallet';
      case 'REVIEW_COMPLIANCE':
        return 'gavel';
      default:
        return 'local_shipping';
    }
  }

  private mapWorkflowActionTone(tone: string): DriverWorkflowSummary['actions'][number]['tone'] {
    switch (tone) {
      case 'success':
      case 'warning':
      case 'danger':
      case 'secondary':
        return tone;
      default:
        return 'primary';
    }
  }

  private mapWorkflowTargetTab(targetTab: string): DriverWorkflowSummary['actions'][number]['targetTab'] {
    switch (targetTab) {
      case 'operations':
      case 'performance':
      case 'support':
      case 'compliance':
      case 'finance':
      case 'verification':
        return targetTab;
      default:
        return 'overview';
    }
  }

  private mapWorkflowItemCode(code: string): string {
    switch (code) {
      case 'documents_expiring':
        return 'DRIVERS.DETAIL.WORKFLOW.ITEMS.DOCUMENTS_EXPIRING';
      case 'document_under_review':
        return 'DRIVERS.DETAIL.WORKFLOW.ITEMS.DOCUMENT_UNDER_REVIEW';
      case 'finance_hold':
        return 'DRIVERS.DETAIL.WORKFLOW.ITEMS.FINANCE_HOLD';
      case 'compliance_case':
        return 'DRIVERS.DETAIL.WORKFLOW.ITEMS.COMPLIANCE_CASE';
      case 'performance_alert':
        return 'DRIVERS.DETAIL.WORKFLOW.ITEMS.PERFORMANCE_ALERT';
      case 'verification_pending':
        return 'DRIVERS.DETAIL.WORKFLOW.ITEMS.VERIFICATION_PENDING';
      case 'account_suspended':
        return 'DRIVERS.DETAIL.WORKFLOW.ITEMS.ACCOUNT_SUSPENDED';
      case 'support_followups':
      case 'support_followups_generic':
        return 'DRIVERS.DETAIL.WORKFLOW.ITEMS.SUPPORT_FOLLOWUPS_GENERIC';
      default:
        return code;
    }
  }

  private buildZoneCapacityLabel(activeDrivers?: number | null, capacityLimit?: number | null): string {
    if (activeDrivers == null && capacityLimit == null) {
      return '--';
    }

    if (capacityLimit == null || capacityLimit <= 0) {
      return String(activeDrivers ?? 0);
    }

    return `${activeDrivers ?? 0} / ${capacityLimit}`;
  }

  private buildZoneUtilizationPercent(activeDrivers?: number | null, capacityLimit?: number | null): number {
    if (!capacityLimit || capacityLimit <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round(((activeDrivers ?? 0) / capacityLimit) * 100)));
  }

  private buildAvgDeliveryTimeLabel(avgDeliveryMinutes?: number | null): string {
    if (!avgDeliveryMinutes || avgDeliveryMinutes <= 0) {
      return '--';
    }

    return `${Math.round(avgDeliveryMinutes)} min`;
  }

  private buildActiveDriversLabel(activeDrivers?: number | null): string {
    return activeDrivers == null ? '--' : String(activeDrivers);
  }

  private buildOperationsStabilityLabel(avgDeliveryMinutes?: number | null, activeTasks?: number | null): string {
    const hasHighLoad = (activeTasks ?? 0) >= 3 || (avgDeliveryMinutes ?? 0) >= 45;
    return hasHighLoad
      ? 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STABILITY.HIGH_LOAD'
      : 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.STABILITY.STABLE';
  }

  private mapPerformanceMetricTitle(metricId: string): string {
    switch (metricId) {
      case 'acceptance_rate':
        return 'DRIVERS.DETAIL.PERFORMANCE.DYNAMIC.METRICS.ACCEPTANCE.TITLE';
      case 'completion_rate':
        return 'DRIVERS.DETAIL.PERFORMANCE.DYNAMIC.METRICS.COMPLETION.TITLE';
      case 'completed_tasks':
        return 'DRIVERS.DETAIL.PERFORMANCE.BACKEND.METRICS.COMPLETED_TASKS.TITLE';
      case 'commitment_score':
        return 'DRIVERS.DETAIL.PERFORMANCE.BACKEND.METRICS.COMMITMENT_SCORE.TITLE';
      default:
        return 'DRIVERS.DETAIL.PERFORMANCE.DYNAMIC.METRICS.ROUTE_SCORE.TITLE';
    }
  }

  private mapPerformanceMetricHelper(metricId: string): string {
    switch (metricId) {
      case 'acceptance_rate':
        return 'DRIVERS.DETAIL.PERFORMANCE.DYNAMIC.METRICS.ACCEPTANCE.HELPER';
      case 'completion_rate':
        return 'DRIVERS.DETAIL.PERFORMANCE.DYNAMIC.METRICS.COMPLETION.HELPER';
      case 'completed_tasks':
        return 'DRIVERS.DETAIL.PERFORMANCE.BACKEND.METRICS.COMPLETED_TASKS.HELPER';
      case 'commitment_score':
        return 'DRIVERS.DETAIL.PERFORMANCE.BACKEND.METRICS.COMMITMENT_SCORE.HELPER';
      default:
        return 'DRIVERS.DETAIL.PERFORMANCE.DYNAMIC.METRICS.ROUTE_SCORE.HELPER';
    }
  }

  private mapMetricTone(tone: string): 'primary' | 'success' | 'warning' | 'danger' {
    switch (tone) {
      case 'success':
      case 'warning':
      case 'danger':
        return tone;
      default:
        return 'primary';
    }
  }

  private mapPerformanceBenchmarkLabel(benchmarkId: string): string {
    switch (benchmarkId) {
      case 'acceptance_rate':
        return 'DRIVERS.DETAIL.PERFORMANCE.DYNAMIC.METRICS.ACCEPTANCE.TITLE';
      case 'completion_rate':
        return 'DRIVERS.DETAIL.PERFORMANCE.DYNAMIC.METRICS.COMPLETION.TITLE';
      case 'commitment_score':
        return 'DRIVERS.DETAIL.PERFORMANCE.BACKEND.METRICS.COMMITMENT_SCORE.TITLE';
      default:
        return 'DRIVERS.DETAIL.PERFORMANCE.DYNAMIC.BENCHMARKS.OPERATIONAL_PERFORMANCE.LABEL';
    }
  }

  private mapPerformanceInsightCode(code: string): string {
    return `DRIVERS.DETAIL.PERFORMANCE.BACKEND.INSIGHTS.${code.toUpperCase()}`;
  }

  private mapPerformanceGroupTitle(groupId: string): string {
    switch (groupId) {
      case 'strengths':
        return 'DRIVERS.DETAIL.PERFORMANCE.DYNAMIC.INSIGHTS.STRENGTHS.TITLE';
      case 'watchouts':
        return 'DRIVERS.DETAIL.PERFORMANCE.DYNAMIC.INSIGHTS.FOLLOW_UP.TITLE';
      default:
        return 'DRIVERS.DETAIL.PERFORMANCE.DYNAMIC.INSIGHTS.ACTIONS.TITLE';
    }
  }

  private mapSupportReviewerRole(role?: string | null): string {
    switch ((role || '').toUpperCase()) {
      case 'FINANCE':
        return 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.ROLES.FLEET_SUPERVISOR';
      case 'COMPLIANCE':
      case 'VERIFICATION':
      case 'OPERATIONS':
        return 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.ROLES.OPERATIONS_SUPERVISOR';
      default:
        return 'DRIVERS.DETAIL.SUPPORT.REVIEWER_OPERATIONS';
    }
  }

  private mapSupportTicketSubject(subject: string): string {
    switch (subject.toUpperCase()) {
      case 'WALLET_BALANCE':
        return 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.SUBJECTS.WALLET_BALANCE';
      case 'BEHAVIOR_REPORT':
        return 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.SUBJECTS.BEHAVIOR_REPORT';
      case 'LICENSE_UPDATE':
        return 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.SUBJECTS.LICENSE_UPDATE';
      default:
        return subject;
    }
  }

  private mapSupportTicketStatus(status: string): DriverDetailRecord['support']['tickets'][number]['status'] {
    switch (status.toUpperCase()) {
      case 'IN_PROGRESS':
      case 'REVIEW':
        return 'IN_PROGRESS';
      case 'RESOLVED':
      case 'CLOSED':
        return 'RESOLVED';
      default:
        return 'WAITING';
    }
  }

  private mapSupportTicketStatusKey(status: string): string {
    switch (this.mapSupportTicketStatus(status)) {
      case 'IN_PROGRESS':
        return 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.STATUS.IN_PROGRESS';
      case 'RESOLVED':
        return 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.STATUS.RESOLVED';
      default:
        return 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.STATUS.WAITING';
    }
  }

  private mapSupportTicketPriority(priority: string): DriverDetailRecord['support']['tickets'][number]['priority'] {
    switch (priority.toUpperCase()) {
      case 'CRITICAL':
        return 'CRITICAL';
      case 'HIGH':
        return 'HIGH';
      default:
        return 'NORMAL';
    }
  }

  private mapSupportTicketPriorityKey(priority: string): string {
    switch (this.mapSupportTicketPriority(priority)) {
      case 'CRITICAL':
        return 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.PRIORITY.CRITICAL';
      case 'HIGH':
        return 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.PRIORITY.HIGH';
      default:
        return 'DRIVERS.DETAIL.SUPPORT.DYNAMIC.PRIORITY.NORMAL';
    }
  }

  private mapSupportFollowUpCode(code: string): string {
    return `DRIVERS.DETAIL.SUPPORT.BACKEND.FOLLOWUPS.${code.toUpperCase()}`;
  }

  private mapSupportDueLabel(dueLabel: string): string {
    switch (dueLabel.toLowerCase()) {
      case 'today':
        return 'COMMON.TODAY';
      case 'this_week':
        return 'COMMON.THIS_WEEK';
      default:
        return dueLabel;
    }
  }

  private mapFinanceEntryType(type: string): string {
    return `DRIVERS.DETAIL.FINANCE.BACKEND.TYPES.${type.toUpperCase()}`;
  }

  private mapFinanceStatus(status: string): DriverFinanceEntry['status'] {
    switch (status.toUpperCase()) {
      case 'SETTLED':
      case 'COMPLETED':
      case 'PAID':
        return 'SETTLED';
      case 'FAILED':
      case 'REJECTED':
        return 'FAILED';
      default:
        return 'PENDING';
    }
  }

  private mapFinanceStatusKey(status: string): string {
    switch (this.mapFinanceStatus(status)) {
      case 'SETTLED':
        return 'DRIVERS.DETAIL.FINANCE.DYNAMIC.STATUS.SETTLED';
      case 'FAILED':
        return 'DRIVERS.DETAIL.FINANCE.DYNAMIC.STATUS.FAILED';
      default:
        return 'DRIVERS.DETAIL.FINANCE.DYNAMIC.STATUS.PENDING';
    }
  }

  private mapFinanceMethod(method: string): string {
    return `DRIVERS.DETAIL.FINANCE.BACKEND.METHODS.${method.toUpperCase()}`;
  }

  private mapPayoutMethod(method: string): string {
    return `DRIVERS.DETAIL.FINANCE.BACKEND.PAYOUT_METHODS.${method.toUpperCase()}`;
  }

  private mapStatementPeriod(period: string): string {
    return `COMMON.${period.toUpperCase()}`;
  }

  private mapVerificationReviewer(reviewer: string): string {
    switch (reviewer.toLowerCase()) {
      case 'operations_desk':
      case 'operations':
        return 'DRIVERS.DETAIL.SUPPORT.REVIEWER_OPERATIONS';
      default:
        return reviewer;
    }
  }

  private mapVerificationRecommendation(recommendation: string): string {
    switch (recommendation.toUpperCase()) {
      case 'APPROVE':
      case 'ACCEPT':
        return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.RECOMMENDATIONS.ACCEPT';
      case 'REQUEST_DOCUMENTS':
      case 'CONDITIONAL':
        return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.RECOMMENDATIONS.CONDITIONAL';
      default:
        return 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.RECOMMENDATIONS.COMPLETE';
    }
  }

  private mapVerificationChecklistCode(code: string): string {
    return `DRIVERS.DETAIL.VERIFICATION.BACKEND.CHECKLIST.${code.toUpperCase()}`;
  }

  private mapVerificationChecklistNote(note: string): string {
    return `DRIVERS.DETAIL.VERIFICATION.BACKEND.CHECKLIST_NOTES.${note.toUpperCase()}`;
  }

  private mapRejectionReason(reason: string): string {
    return `DRIVERS.DETAIL.VERIFICATION.BACKEND.REJECTION_REASONS.${reason.toUpperCase()}`;
  }

  private mapDocumentExpiryLabel(status: string): string {
    return status.toLowerCase() === 'valid'
      ? 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.EXPIRY.RECENT_CAPTURE'
      : 'DRIVERS.DETAIL.VERIFICATION.DYNAMIC.DOCUMENTS.EXPIRY.BIOMETRIC_CHECK';
  }
}
