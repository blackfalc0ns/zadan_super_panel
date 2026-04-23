import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { buildDriverDetailRecord } from '../data/drivers.mock';
import {
  DriverDetailRecord,
  DriverDocumentRecord,
  DriverIncidentRecord,
  DriverInternalNote,
  DriverTaskAssignment,
  DriverVerificationChecklistItem
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
  zoneName?: string | null;
  primaryZoneId?: string | null;
  reviewedAtUtc?: string | null;
  reviewNote?: string | null;
  suspensionReason?: string | null;
  documents: AdminDriverDocumentResponse[];
  notes: AdminDriverNoteResponse[];
  incidents: AdminDriverIncidentResponse[];
  finance: AdminDriverFinanceSummaryResponse;
  recentAssignments: AdminDriverAssignmentResponse[];
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
    const cached = this.getDriverSnapshotById(id);

    return this.http.get<AdminDriverDetailResponse>(`${this.apiUrl}/${this.normalizeDriverId(id)}`).pipe(
      map((response) => this.mapDriverDetailRecord(response)),
      tap((detail) => this.upsertCache(detail)),
      catchError(() => of(cached ? buildDriverDetailRecord(cached) : undefined))
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
    const base = buildDriverDetailRecord(driver);

    const notes = this.mapDriverNotes(response.notes);
    const documents = this.mapDriverDocuments(response.documents, base.documents);
    const incidents = this.mapDriverIncidents(response.incidents);
    const assignments = this.mapDriverAssignments(response.recentAssignments);
    const checklist = this.buildVerificationChecklist(response.documents);
    const documentProgress = this.calculateDocumentProgress(response.documents);

    const lastFinanceEntry = base.finance.entries[0];
    const liveFinanceEntries = [
      {
        ...lastFinanceEntry,
        amount: response.finance.totalEarnings,
        fee: Math.max(0, response.finance.pendingBalance),
        date: this.formatDateTime(response.reviewedAtUtc || response.joinedAt)
      },
      ...base.finance.entries.slice(1)
    ];

    const detail: DriverDetailRecord = {
      ...base,
      ...driver,
      displayName: `${response.firstName} ${response.lastName}`.trim(),
      email: response.email,
      joinedAt: this.formatDate(response.joinedAt),
      liveZone: response.zoneName || base.liveZone,
      tasks: {
        active: response.activeTasks,
        completed: response.completedTasks,
        subtitle: this.buildTaskSubtitle(driver.status, response.activeTasks, response.completedTasks)
      },
      todayTrips: Math.max(base.todayTrips, response.activeTasks),
      lifetimeTrips: Math.max(base.lifetimeTrips, response.completedTasks),
      walletBalance: response.finance.currentBalance,
      codPendingAmount: Math.max(0, response.finance.pendingBalance),
      totalEarnings: response.finance.totalEarnings,
      currentDueAmount: response.finance.pendingBalance,
      codCollectedAmount: response.finance.codCollected,
      notes,
      documents,
      recentTrips: assignments.map((assignment) => ({
        id: assignment.id,
        time: assignment.assignedAt,
        category: `${response.zoneName || response.city} · ${assignment.vendor}`,
        status: assignment.status === 'FAILED'
          ? 'CANCELLED'
          : assignment.status === 'COMPLETED'
            ? 'COMPLETED'
            : 'IN_PROGRESS',
        duration: assignment.duration,
        codAmount: assignment.codAmount,
        delayText: assignment.delayLabel !== '00:00' ? assignment.delayLabel : undefined
      })),
      operations: {
        ...base.operations,
        zoneName: response.zoneName || base.operations.zoneName,
        taskAssignments: assignments
      },
      support: {
        ...base.support,
        openNotesCount: notes.length,
        lastUpdateLabel: notes[0]?.createdAt || base.support.lastUpdateLabel
      },
      compliance: {
        ...base.compliance,
        openCases: incidents.filter((incident) => incident.status !== 'RESOLVED').length,
        criticalCases: incidents.filter((incident) => incident.severity === 'CRITICAL').length,
        safetyAlerts: incidents.filter((incident) => incident.severity !== 'MEDIUM').length,
        expiredDocuments: documents.filter((document) => document.status !== 'valid').length,
        suspensions: driver.status === 'Suspended' ? 1 : 0,
        documentHealth: {
          valid: documents.filter((document) => document.status === 'valid').length,
          expiring: documents.filter((document) => document.status === 'expiring').length,
          review: documents.filter((document) => document.status === 'review').length
        },
        incidents
      },
      finance: {
        ...base.finance,
        availableBalance: response.finance.currentBalance,
        dueAmount: response.finance.pendingBalance,
        codCollected: response.finance.codCollected,
        pendingDeductions: Math.max(0, response.finance.pendingBalance),
        statementPeriod: `Live summary · ${response.finance.totalSettlements} settlements · ${response.finance.totalPayouts} payouts`,
        entries: liveFinanceEntries
      },
      verification: {
        ...base.verification,
        applicationId: response.driverDisplayId,
        submittedAt: this.formatDateTime(response.joinedAt),
        reviewer: response.reviewedAtUtc ? 'Operations desk' : base.verification.reviewer,
        trustScore: this.calculateTrustScore(response),
        progressPercentage: documentProgress,
        recommendation: this.buildVerificationRecommendation(response),
        recommendationReason: response.reviewNote || response.suspensionReason || base.verification.recommendationReason,
        checklist,
        decisionNote: response.reviewNote || '',
        internalNote: response.suspensionReason || '',
        rejectionReasonOptions: base.verification.rejectionReasonOptions
      }
    };

    return detail;
  }

  private mapDriverNotes(notes: AdminDriverNoteResponse[]): DriverInternalNote[] {
    return notes.map((note) => ({
      author: note.authorName,
      role: 'Operations',
      createdAt: this.formatDateTime(note.createdAtUtc),
      message: note.message
    }));
  }

  private mapDriverDocuments(
    documents: AdminDriverDocumentResponse[],
    fallbackDocuments: DriverDocumentRecord[]
  ): DriverDocumentRecord[] {
    return documents.map((document, index) => {
      const fallback = fallbackDocuments[index];
      const mappedStatus = this.mapDocumentStatus(document.status);

      return {
        id: `${document.documentType}-${index}`,
        title: this.mapDocumentTitle(document.documentType),
        imageUrl: document.imageUrl || fallback?.imageUrl || '',
        status: mappedStatus,
        statusLabel: this.mapDocumentStatusLabel(mappedStatus),
        expiryDate: document.expiryInfo || fallback?.expiryDate || 'Live record',
        subtitle: document.documentType
      };
    });
  }

  private mapDriverIncidents(incidents: AdminDriverIncidentResponse[]): DriverIncidentRecord[] {
    return incidents.map((incident) => ({
      id: incident.id,
      type: incident.incidentType,
      severity: this.mapIncidentSeverity(incident.severity),
      severityLabel: incident.severity,
      status: this.mapIncidentStatus(incident.status),
      statusLabel: incident.status,
      reviewer: incident.reviewerName || 'Operations desk',
      createdAt: this.formatDateTime(incident.createdAtUtc),
      linkedOrder: incident.linkedOrderId || 'N/A',
      summary: incident.summary,
      evidenceImages: []
    }));
  }

  private mapDriverAssignments(assignments: AdminDriverAssignmentResponse[]): DriverTaskAssignment[] {
    return assignments.map((assignment) => ({
      id: assignment.id,
      vendor: `Order #${assignment.orderNumber}`,
      zone: 'Live assignment',
      status: this.mapAssignmentStatus(assignment.status),
      statusLabel: assignment.status,
      assignedAt: this.formatDateTime(assignment.acceptedAtUtc || assignment.deliveredAtUtc || assignment.failedAtUtc || new Date().toISOString()),
      duration: assignment.deliveredAtUtc && assignment.acceptedAtUtc
        ? this.formatDuration(assignment.acceptedAtUtc, assignment.deliveredAtUtc)
        : assignment.failedAtUtc && assignment.acceptedAtUtc
          ? this.formatDuration(assignment.acceptedAtUtc, assignment.failedAtUtc)
          : '--',
      delayLabel: assignment.failureReason ? assignment.failureReason : '00:00',
      codAmount: assignment.codAmount
    }));
  }

  private buildVerificationChecklist(documents: AdminDriverDocumentResponse[]): DriverVerificationChecklistItem[] {
    return documents.map((document) => ({
      label: this.mapDocumentTitle(document.documentType),
      completed: document.status.toLowerCase() === 'valid',
      note: document.expiryInfo || undefined,
      critical: document.status.toLowerCase() !== 'valid'
    }));
  }

  private calculateDocumentProgress(documents: AdminDriverDocumentResponse[]): number {
    if (!documents.length) {
      return 0;
    }

    const validCount = documents.filter((document) => document.status.toLowerCase() === 'valid').length;
    return Math.round((validCount / documents.length) * 100);
  }

  private calculateTrustScore(response: AdminDriverDetailResponse): number {
    const baseScore = 55
      + Math.min(25, response.completedTasks / 10)
      + Math.min(10, response.acceptanceRate / 10)
      - (response.issues.length * 5);

    return Math.max(25, Math.min(98, Math.round(baseScore)));
  }

  private buildVerificationRecommendation(response: AdminDriverDetailResponse): string {
    switch (response.verificationStatus) {
      case 'Approved':
        return 'Approved for dispatch';
      case 'NeedsDocuments':
        return 'Request missing documents';
      case 'Rejected':
        return 'Keep account inactive';
      default:
        return 'Review documents before activation';
    }
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
        return 'National ID';
      case 'License':
        return 'Driver license';
      case 'Vehicle':
        return 'Vehicle photo';
      case 'PersonalPhoto':
        return 'Personal photo';
      default:
        return type;
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
        return 'Valid';
      case 'expiring':
        return 'Expiring';
      default:
        return 'Needs review';
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
}
