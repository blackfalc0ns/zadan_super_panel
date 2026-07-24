import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, defer, finalize, map, of, tap } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import {
 CustomerAccountState,
 CustomerDetailRecord,
 CustomerInternalNote,
 CustomerRecord,
 CustomerRisk,
 CustomerStatus
} from '../models/customers.models';
import { refreshCustomerDetailRecord } from '../data/customers.mock';

export interface CustomerFilterOptionItem {
 value: string;
 labelAr: string;
 labelEn: string;
}

export interface CustomerFilterOptions {
 statuses: CustomerFilterOptionItem[];
 cities: CustomerFilterOptionItem[];
}

export interface CustomerFilters {
 status?: string;
 city?: string;
 isLocked?: boolean;
 hasOrders?: boolean;
 minSpent?: number;
 maxSpent?: number;
 sortBy?: string;
 [key: string]: unknown;
}

interface ApiPaginatedResponse<T> {
 items: T[];
 totalCount: number;
 page: number;
 pageSize: number;
}

interface AdminCustomerListItemDto {
 id: string;
 fullName: string;
 email?: string | null;
 phone?: string | null;
 city?: string | null;
 cityCode?: string | null;
 cityAr?: string | null;
 cityEn?: string | null;
 area?: string | null;
 accountStatus: string;
 isLoginLocked: boolean;
 emailConfirmed: boolean;
 phoneConfirmed: boolean;
 createdAtUtc: string;
 lastLoginAtUtc?: string | null;
 lastSeenAtUtc?: string | null;
 isOnlineNow: boolean;
 totalOrders: number;
 totalSpent: number;
 averageBasket: number;
 lastOrderAtUtc?: string | null;
 lastOrderValue: number;
 refundedOrdersCount: number;
 favoritesCount: number;
 preferredLocale?: string | null;
}

interface AdminCustomerRecentOrderDto {
 id: string;
 orderNumber: string;
 placedAtUtc: string;
 totalAmount: number;
 status: string;
 paymentStatus: string;
}

interface AdminCustomerDetailDto extends AdminCustomerListItemDto {
 profilePhotoUrl?: string | null;
 addressLine?: string | null;
 buildingNo?: string | null;
 floorNo?: string | null;
 apartmentNo?: string | null;
 addressLabel?: string | null;
 recentOrders: AdminCustomerRecentOrderDto[];
}

export interface AdminSendCustomerNotificationRequest {
 titleAr?: string | null;
 titleEn?: string | null;
 bodyAr?: string | null;
 bodyEn?: string | null;
 type?: string | null;
 referenceId?: string | null;
 data?: string | null;
 targetUrl?: string | null;
 sendPush?: boolean;
}

export interface AdminCustomerNotificationResponse {
 message: string;
 customerId: string;
 userId: string;
 externalId: string;
 type: string;
 inboxRequested: boolean;
 pushAttempted: boolean;
 pushSent: boolean;
 pushSkipped: boolean;
 pushStatusCode?: number | null;
 providerNotificationId?: string | null;
 pushReason?: string | null;
}

@Injectable({
 providedIn: 'root'
})
export class CustomersService {
 private readonly apiUrl = `${environment.apiUrl}/admin/customers`;
 private readonly customerStore = new Map<string, CustomerDetailRecord>();
 private readonly customersSubject = new BehaviorSubject<CustomerDetailRecord[]>([]);
 private readonly customersLoadingSubject = new BehaviorSubject(false);
 readonly customersLoading$ = this.customersLoadingSubject.asObservable();
 private readonly hubUrl = `${environment.apiUrl.replace(/\/api$/, '')}/hubs/customer-presence`;
 private presenceConnection?: signalR.HubConnection;
 private customersLoaded = false;
 private customersLoadingRequestCount = 0;
 private presenceConnected = false;

 constructor(
 private readonly http: HttpClient,
 private readonly authService: AuthService
 ) {}

 getCustomers(): Observable<CustomerDetailRecord[]> {
 this.ensureCustomersLoaded();
 this.ensurePresenceConnection();
 return this.customersSubject.asObservable();
 }

 getFilterOptions(): Observable<CustomerFilterOptions> {
 return this.http.get<CustomerFilterOptions>(`${this.apiUrl}/filter-options`);
 }

 exportCustomers(search?: string, filters?: CustomerFilters): Observable<Blob> {
 let params = new HttpParams();

 if (search?.trim()) {
 params = params.set('search', search.trim());
 }

 if (filters) {
 if (filters['status']) params = params.set('status', String(filters['status']));
 if (filters['city']) params = params.set('city', String(filters['city']));
 if (filters['isLocked'] != null) params = params.set('isLocked', String(filters['isLocked']));
 if (filters['hasOrders'] != null) params = params.set('hasOrders', String(filters['hasOrders']));
 if (filters['minSpent'] != null) params = params.set('minSpent', String(filters['minSpent']));
 if (filters['maxSpent'] != null) params = params.set('maxSpent', String(filters['maxSpent']));
 if (filters['sortBy']) params = params.set('sortBy', String(filters['sortBy']));
 }

 return this.http.get(`${this.apiUrl}/export`, { params, responseType: 'blob' });
 }

 searchCustomers(search: string, pageSize: number = 5): Observable<CustomerDetailRecord[]> {
 let params = new HttpParams().set('page', '1').set('pageSize', String(pageSize));

 if (search.trim()) {
 params = params.set('search', search.trim());
 }

 return this.http.get<ApiPaginatedResponse<AdminCustomerListItemDto>>(this.apiUrl, { params }).pipe(
 map((response) => response.items.map((item) => this.mapListItemToCustomer(item)))
 );
 }

 loadWithFilters(search?: string, filters?: CustomerFilters): void {
 let params = new HttpParams().set('page', '1').set('pageSize', '250');

 if (search?.trim()) {
 params = params.set('search', search.trim());
 }

 if (filters) {
 if (filters['status']) params = params.set('status', String(filters['status']));
 if (filters['city']) params = params.set('city', String(filters['city']));
 if (filters['isLocked']!= null) params = params.set('isLocked', String(filters['isLocked']));
 if (filters['hasOrders']!= null) params = params.set('hasOrders', String(filters['hasOrders']));
 if (filters['minSpent']!= null) params = params.set('minSpent', String(filters['minSpent']));
 if (filters['maxSpent']!= null) params = params.set('maxSpent', String(filters['maxSpent']));
 if (filters['sortBy']) params = params.set('sortBy', String(filters['sortBy']));
 }

 this.customersLoaded = true;
 this.beginCustomersLoading();

 this.http.get<ApiPaginatedResponse<AdminCustomerListItemDto>>(this.apiUrl, { params }).pipe(
 map((response) => response.items.map((item) => this.mapListItemToCustomer(item))),
 finalize(() => this.endCustomersLoading())
 ).subscribe({
 next: (customers) => {
 this.customerStore.clear();
 customers.forEach((customer) => this.customerStore.set(customer.id, customer));
 this.syncCustomersSubject();
 },
 error: (error) => {
 console.error('Failed to load admin customers with filters.', error);
 this.customersLoaded = false;
 this.customersSubject.next([]);
 }
 });
 }

 getCustomersSnapshot(): CustomerDetailRecord[] {
 return Array.from(this.customerStore.values()).map((customer) => this.clone(customer));
 }

 getCustomerSnapshotById(id: string): CustomerDetailRecord | undefined {
 const customer = this.customerStore.get(id);
 return customer ? this.clone(customer) : undefined;
 }

 getCustomerById(id: string | null): Observable<CustomerDetailRecord | undefined> {
 if (!id) {
 return of(undefined);
 }

 this.ensurePresenceConnection();

 return defer(() => {
 const cached = this.customerStore.get(id);
 if (!cached || cached.recentOrders.length === 0) {
 this.http.get<AdminCustomerDetailDto>(`${this.apiUrl}/${id}`).pipe(
 map((response) => this.mapDetailItemToCustomer(response)),
 tap((customer) => this.setCustomer(customer))
 ).subscribe({
 error: (error) => console.error('Failed to refresh admin customer detail.', error)
 });
 }

 return this.customersSubject.pipe(
 map(() => {
 const customer = this.customerStore.get(id);
 return customer ? this.clone(customer) : undefined;
 })
 );
 });
 }

 sendTestMobileNotification(
 id: string,
 request: AdminSendCustomerNotificationRequest
 ): Observable<AdminCustomerNotificationResponse> {
 return this.http.post<AdminCustomerNotificationResponse>(
 `${this.apiUrl}/${id}/notifications/test`,
 request
 );
 }

 addInternalNote(id: string, message: string): CustomerDetailRecord | undefined {
 return this.updateCustomer(id, (customer) => {
 customer.internalNotes = [
 {
 authorKey: 'CUSTOMERS.DETAIL.ADMIN.AUTHORS.ADMIN_USER',
 roleKey: customer.workflow.ownerTeamLabelKey,
 createdAt: this.formatAuditDate(new Date().toISOString()),
 message,
 tone: 'info'
 },...customer.internalNotes
 ];
 });
 }

 flagForReview(id: string): CustomerDetailRecord | undefined {
 return this.updateCustomer(id, (customer) => {
 if (customer.reviewState === 'none') {
 customer.reviewState = 'flagged';
 }

 if (customer.accountState === 'active') {
 customer.trustState = 'watch';
 }

 customer.internalNotes = [
 {
 authorKey: 'CUSTOMERS.DETAIL.ADMIN.AUTHORS.OPERATIONS_DESK',
 roleKey: 'CUSTOMERS.DETAIL.WORKFLOW.OWNERS.MONITORING',
 createdAt: this.formatAuditDate(new Date().toISOString()),
 messageKey: 'CUSTOMERS.DETAIL.ADMIN.NOTES.FLAG_FOR_REVIEW',
 tone: 'warning',
 isSystem: true
 },...customer.internalNotes
 ];
 });
 }

 clearReview(id: string): CustomerDetailRecord | undefined {
 return this.updateCustomer(id, (customer) => {
 customer.reviewState = 'none';

 if (customer.accountState === 'under_review') {
 customer.accountState = customer.activeDays30 === 0 ? 'dormant' : 'active';
 }

 if (customer.trustState!== 'blocked') {
 customer.trustState = customer.risk === 'high' || customer.risk === 'critical' ? 'watch' : 'clear';
 }

 if (customer.paymentState!== 'blocked') {
 customer.paymentState = customer.refundsCount >= 3 || customer.disputesCount >= 2 ? 'monitoring' : 'healthy';
 }

 customer.internalNotes = [
 {
 authorKey: 'CUSTOMERS.DETAIL.ADMIN.AUTHORS.RISK_TRUST_OPS',
 roleKey: 'CUSTOMERS.DETAIL.WORKFLOW.OWNERS.RISK',
 createdAt: this.formatAuditDate(new Date().toISOString()),
 messageKey: 'CUSTOMERS.DETAIL.ADMIN.NOTES.CLEAR_REVIEW',
 tone: 'success',
 isSystem: true
 },...customer.internalNotes
 ];
 });
 }

 escalateReview(id: string): CustomerDetailRecord | undefined {
 return this.updateCustomer(id, (customer) => {
 customer.reviewState = 'escalated';
 customer.accountState = 'under_review';
 customer.trustState = 'blocked';
 customer.paymentState = customer.paymentState === 'healthy' ? 'monitoring' : customer.paymentState;
 customer.internalNotes = [
 {
 authorKey: 'CUSTOMERS.DETAIL.ADMIN.AUTHORS.RISK_TRUST_OPS',
 roleKey: 'CUSTOMERS.DETAIL.WORKFLOW.OWNERS.RISK',
 createdAt: this.formatAuditDate(new Date().toISOString()),
 messageKey: 'CUSTOMERS.DETAIL.ADMIN.NOTES.ESCALATE_REVIEW',
 tone: 'danger',
 isSystem: true
 },...customer.internalNotes
 ];
 });
 }

 suspendAccount(id: string): CustomerDetailRecord | undefined {
 return this.updateCustomer(id, (customer) => {
 customer.accountState = 'suspended';
 customer.reviewState = 'escalated';
 customer.trustState = 'blocked';
 customer.paymentState = 'blocked';
 customer.internalNotes = [
 {
 authorKey: 'CUSTOMERS.DETAIL.ADMIN.AUTHORS.RISK_COMMITTEE',
 roleKey: 'CUSTOMERS.DETAIL.WORKFLOW.OWNERS.RISK',
 createdAt: this.formatAuditDate(new Date().toISOString()),
 messageKey: 'CUSTOMERS.DETAIL.ADMIN.NOTES.SUSPEND_ACCOUNT',
 tone: 'danger',
 isSystem: true
 },...customer.internalNotes
 ];
 });
 }

 reactivateAccount(id: string): CustomerDetailRecord | undefined {
 return this.updateCustomer(id, (customer) => {
 customer.accountState = this.getReactivatedAccountState(customer);
 customer.reviewState = customer.risk === 'critical' ? 'flagged' : 'none';
 customer.trustState = customer.risk === 'high' || customer.risk === 'critical' ? 'watch' : 'clear';
 customer.paymentState = customer.refundsCount >= 3 || customer.disputesCount >= 2 ? 'monitoring' : 'healthy';
 customer.internalNotes = [
 {
 authorKey: 'CUSTOMERS.DETAIL.ADMIN.AUTHORS.RISK_TRUST_OPS',
 roleKey: 'CUSTOMERS.DETAIL.WORKFLOW.OWNERS.RISK',
 createdAt: this.formatAuditDate(new Date().toISOString()),
 messageKey: 'CUSTOMERS.DETAIL.ADMIN.NOTES.REACTIVATE_ACCOUNT',
 tone: 'success',
 isSystem: true
 },...customer.internalNotes
 ];
 });
 }

 private updateCustomer(
 id: string,
 mutate: (customer: CustomerDetailRecord) => void
 ): CustomerDetailRecord | undefined {
 const customer = this.customerStore.get(id);
 if (!customer) {
 return undefined;
 }

 mutate(customer);
 refreshCustomerDetailRecord(customer);
 this.saveCustomerStateToLocalStorage(customer);
 this.setCustomer(customer);
 return this.clone(customer);
 }

 private mapListItemToCustomer(item: AdminCustomerListItemDto): CustomerDetailRecord {
 const base = this.createBaseRecord(item);
 const customer = this.createDetailRecord(base);
 customer.internalNotes = this.buildInternalNotes();
 customer.isVerified = item.emailConfirmed || item.phoneConfirmed;
 customer.isOnlineNow = item.isOnlineNow;
 customer.lastSeenAtUtc = item.lastSeenAtUtc ?? item.lastLoginAtUtc ?? item.lastOrderAtUtc;
 customer.lastSeenAt = this.formatPresenceLabel(customer.isOnlineNow, customer.lastSeenAtUtc);
 
 this.loadCustomerStateFromLocalStorage(customer);
 
 refreshCustomerDetailRecord(customer);
 return customer;
 }

 private mapDetailItemToCustomer(item: AdminCustomerDetailDto): CustomerDetailRecord {
 const base = this.createBaseRecord(item);
 const customer = this.createDetailRecord(base);
 customer.registrationDate = this.formatDate(item.createdAtUtc);
 customer.isOnlineNow = item.isOnlineNow;
 customer.lastSeenAtUtc = item.lastSeenAtUtc ?? item.lastLoginAtUtc ?? item.lastOrderAtUtc;
 customer.lastSeenAt = this.formatPresenceLabel(customer.isOnlineNow, customer.lastSeenAtUtc);
 customer.isVerified = item.emailConfirmed || item.phoneConfirmed;
 customer.preferredLanguage = this.mapPreferredLanguage(item.preferredLocale);
 customer.preferredLanguageLabel = this.mapPreferredLanguageLabel(customer.preferredLanguage);
 customer.recentOrders = item.recentOrders.map((order) => ({
 id: order.id,
 displayId: order.orderNumber,
 date: this.formatDate(order.placedAtUtc),
 total: order.totalAmount,
 status: this.mapRecentOrderStatus(order)
 }));
 customer.internalNotes = this.buildInternalNotes();

 if (item.addressLine) {
 customer.notes = `${item.addressLine}${item.city ? ` - ${item.city}` : ''}`;
 }

 this.loadCustomerStateFromLocalStorage(customer);

 refreshCustomerDetailRecord(customer);
 customer.recentOrders = item.recentOrders.map((order) => ({
 id: order.id,
 displayId: order.orderNumber,
 date: this.formatDate(order.placedAtUtc),
 total: order.totalAmount,
 status: this.mapRecentOrderStatus(order)
 }));

 return customer;
 }

 private createBaseRecord(item: AdminCustomerListItemDto): CustomerRecord {
 const cityAr = item.cityAr ?? item.city ?? undefined;
 const cityEn = item.cityEn ?? item.city ?? undefined;

 return {
 id: item.id,
 name: item.fullName,
 email: item.email ?? '-',
 phone: item.phone ?? '-',
 city: cityAr ?? cityEn ?? item.area ?? '—',
 cityCode: item.cityCode ?? undefined,
 cityAr,
 cityEn,
 isOnlineNow: item.isOnlineNow,
 segment: this.deriveSegment(item),
 status: this.deriveStatus(item),
 risk: this.deriveRisk(item),
 totalOrders: item.totalOrders,
 totalSpent: this.roundNumber(item.totalSpent),
 averageBasket: this.roundNumber(item.averageBasket),
 lifetimeValue: this.roundNumber(item.totalSpent),
 refundsCount: item.refundedOrdersCount,
 disputesCount: 0,
 activeDays30: this.computeActiveDays30(item.lastLoginAtUtc ?? item.lastOrderAtUtc),
 lastOrderAt: this.formatLastSeen(item.lastOrderAtUtc),
 lastOrderValue: this.roundNumber(item.lastOrderValue),
 joinedAt: this.formatMonthYear(item.createdAtUtc),
 loyaltyScore: 0,
 preferredChannel: 'CUSTOMERS.PROFILE.PREFERRED_CHANNEL_APP',
 watchFlags: this.deriveWatchFlags(item),
 notes: '',
 preferredLanguage: this.mapPreferredLanguage(item.preferredLocale)
 };
 }

 private createDetailRecord(base: CustomerRecord): CustomerDetailRecord {
 const accountState = this.deriveAccountState(base.status, base.risk);
 const detail: CustomerDetailRecord = {...base,
 registrationDate: this.formatDateFromMonthYear(base.joinedAt),
 riskScore: 0,
 riskSummary: this.getRiskSummaryKey(base.risk),
 lastSeenAt: base.lastOrderAt,
 lastSeenAtUtc: null,
 preferredLanguageLabel: this.mapPreferredLanguageLabel(base.preferredLanguage),
 isVerified: true,
 suspiciousLoginAttempts: 'COMMON.NOT_AVAILABLE',
 repeatedPaymentFailureRate: 'COMMON.NOT_AVAILABLE',
 complaintRateLabel: '',
 analysisSummary: '',
 refundsClosedCount: 0,
 refundsInProgressCount: 0,
 refundsTotalAmount: 0,
 complaintsSolvedCount: 0,
 lastSupportContact: 'COMMON.NOT_AVAILABLE',
 accountTeam: 'COMMON.NOT_AVAILABLE',
 accountManager: 'COMMON.NOT_AVAILABLE',
 accountState,
 trustState: base.risk === 'critical' ? 'blocked' : base.risk === 'high' ? 'watch' : 'clear',
 paymentState: base.refundsCount >= 3 ? 'monitoring' : 'healthy',
 engagementState: base.status === 'dormant'
 ? 'dormant'
 : base.segment === 'new'
 ? 'new'
 : base.status === 'low_activity'
 ? 'at_risk'
 : 'growing',
 reviewState: base.risk === 'critical' ? 'escalated' : base.risk === 'high' ? 'flagged' : 'none',
 workflow: {
 state: 'healthy',
 ownerTeamLabelKey: 'CUSTOMERS.DETAIL.WORKFLOW.OWNERS.SUCCESS',
 queueLabelKey: 'CUSTOMERS.DETAIL.WORKFLOW.QUEUES.GROWTH',
 summaryKey: 'CUSTOMERS.DETAIL.WORKFLOW.SUMMARY.HEALTHY',
 nextStepKey: 'CUSTOMERS.DETAIL.WORKFLOW.NEXT_STEP.HEALTHY',
 blockers: [],
 alerts: [],
 actions: []
 },
 lifecycle: [],
 recentOrders: [],
 internalNotes: []
 };

 return detail;
 }

 private deriveSegment(item: AdminCustomerListItemDto): CustomerRecord['segment'] {
 if (item.totalSpent >= 20000) {
 return 'vip';
 }

 if (item.totalOrders >= 25) {
 return 'business';
 }

 const ageInDays = this.getAgeInDays(item.createdAtUtc);
 if (ageInDays <= 30) {
 return 'new';
 }

 if (item.isLoginLocked || item.refundedOrdersCount >= 4) {
 return 'watchlist';
 }

 if (this.computeActiveDays30(item.lastLoginAtUtc ?? item.lastOrderAtUtc) === 0) {
 return 'dormant';
 }

 return 'new';
 }

 private deriveStatus(item: AdminCustomerListItemDto): CustomerStatus {
 if (item.accountStatus === 'Suspended' || item.accountStatus === 'Banned' || item.isLoginLocked) {
 return 'restricted';
 }

 const activeDays = this.computeActiveDays30(item.lastLoginAtUtc ?? item.lastOrderAtUtc);
 if (activeDays === 0) {
 return 'dormant';
 }

 if (activeDays <= 2) {
 return 'low_activity';
 }

 return 'active';
 }

 private deriveRisk(item: AdminCustomerListItemDto): CustomerRisk {
 if (item.isLoginLocked || item.refundedOrdersCount >= 5) {
 return 'critical';
 }

 if (item.accountStatus === 'Suspended' || item.refundedOrdersCount >= 3) {
 return 'high';
 }

 if (item.refundedOrdersCount > 0 || item.totalOrders === 0) {
 return 'medium';
 }

 return 'low';
 }

 private deriveWatchFlags(item: AdminCustomerListItemDto): string[] {
 const flags: string[] = [];

 if (item.totalSpent >= 20000) {
 flags.push('CUSTOMERS.SUPPORT.VIP_PRIORITY');
 }

 if (item.refundedOrdersCount >= 3) {
 flags.push('CUSTOMERS.SUPPORT.HIGH_REFUND');
 }

 if (item.isLoginLocked || item.accountStatus === 'Suspended') {
 flags.push('CUSTOMERS.SUPPORT.COMPLIANCE_REVIEW');
 }

 if (this.getAgeInDays(item.createdAtUtc) <= 30) {
 flags.push('CUSTOMERS.SUPPORT.NEW_CUSTOMER');
 }

 if (this.computeActiveDays30(item.lastLoginAtUtc ?? item.lastOrderAtUtc) === 0) {
 flags.push('CUSTOMERS.SUPPORT.DORMANT_ACCOUNT');
 }

 return flags;
 }

 private deriveAccountState(status: CustomerStatus, risk: CustomerRisk): CustomerAccountState {
 if (status === 'dormant') {
 return 'dormant';
 }

 if (status === 'restricted' && risk === 'critical') {
 return 'suspended';
 }

 if (status === 'restricted') {
 return 'under_review';
 }

 return 'active';
 }

 private getRiskSummaryKey(risk: CustomerRisk): string {
 switch (risk) {
 case 'critical':
 return 'CUSTOMERS.DETAIL.RISK_CRITICAL';
 case 'high':
 return 'CUSTOMERS.DETAIL.RISK_HIGH';
 case 'medium':
 return 'CUSTOMERS.DETAIL.RISK_MEDIUM';
 default:
 return 'CUSTOMERS.DETAIL.RISK_LOW';
 }
 }

 private buildInternalNotes(): CustomerInternalNote[] {
 return [];
 }

 private mapPreferredLanguage(preferredLocale?: string | null): 'ar' | 'en' | undefined {
 if (!preferredLocale?.trim()) {
 return undefined;
 }

 return preferredLocale.trim().toLowerCase().startsWith('en') ? 'en' : 'ar';
 }

 private mapPreferredLanguageLabel(preferredLanguage?: 'ar' | 'en'): string {
 if (preferredLanguage === 'en') {
 return 'CUSTOMERS.DETAIL.PROFILE_FIELDS.LANGUAGE_VALUES.ENGLISH';
 }

 if (preferredLanguage === 'ar') {
 return 'CUSTOMERS.DETAIL.PROFILE_FIELDS.LANGUAGE_VALUES.ARABIC';
 }

 return 'COMMON.NOT_AVAILABLE';
 }

 private mapRecentOrderStatus(order: AdminCustomerRecentOrderDto): 'DELIVERED' | 'REFUNDED' | 'PROCESSING' {
 if (order.status === 'Refunded' || order.paymentStatus === 'Refunded' || order.paymentStatus === 'PartiallyRefunded') {
 return 'REFUNDED';
 }

 if (order.status === 'Delivered') {
 return 'DELIVERED';
 }

 return 'PROCESSING';
 }

 private formatLastSeen(value?: string | null): string {
 if (!value) {
 return '—';
 }

 return this.formatDate(value);
 }

 private formatPresenceLabel(isOnlineNow: boolean, value?: string | null): string {
 if (isOnlineNow) {
 return 'CUSTOMERS.PRESENCE.ONLINE_NOW';
 }

 return this.formatLastSeen(value);
 }

 private formatDate(value: string): string {
 return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh',
 year: 'numeric',
 month: '2-digit',
 day: '2-digit'
 }).format(new Date(value));
 }

 private formatMonthYear(value: string): string {
 return new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Riyadh',
 month: 'long',
 year: 'numeric'
 }).format(new Date(value));
 }

 private formatDateFromMonthYear(value: string): string {
 return value;
 }

 private formatAuditDate(value: string): string {
 const date = new Date(value);
 const datePart = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh',
 year: 'numeric',
 month: '2-digit',
 day: '2-digit'
 }).format(date);
 const timePart = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Riyadh',
 hour: '2-digit',
 minute: '2-digit',
 hour12: true
 }).format(date);

 return `${datePart} ${timePart}`;
 }

 private computeActiveDays30(value?: string | null): number {
 if (!value) {
 return 0;
 }

 const diffMs = Date.now() - new Date(value).getTime();
 const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
 return diffDays >= 30 ? 0 : 30 - diffDays;
 }

 private getAgeInDays(value: string): number {
 return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24)));
 }

 private roundNumber(value: number): number {
 return Number.isFinite(value) ? Math.round(value) : 0;
 }

 private getReactivatedAccountState(customer: CustomerDetailRecord): CustomerAccountState {
 if (customer.activeDays30 === 0) {
 return 'dormant';
 }

 if (customer.risk === 'high' || customer.risk === 'critical') {
 return 'under_review';
 }

 return 'active';
 }

 private clone<T>(value: T): T {
 return JSON.parse(JSON.stringify(value)) as T;
 }

 private ensureCustomersLoaded(): void {
 if (this.customersLoaded) {
 return;
 }

 this.customersLoaded = true;
 this.beginCustomersLoading();

 const params = new HttpParams().set('page', '1').set('pageSize', '250');

 this.http.get<ApiPaginatedResponse<AdminCustomerListItemDto>>(this.apiUrl, { params }).pipe(
 map((response) => response.items.map((item) => this.mapListItemToCustomer(item))),
 finalize(() => this.endCustomersLoading())
 ).subscribe({
 next: (customers) => {
 this.customerStore.clear();
 customers.forEach((customer) => this.customerStore.set(customer.id, customer));
 this.syncCustomersSubject();
 },
 error: (error) => {
 console.error('Failed to load admin customers.', error);
 this.customersLoaded = false;
 this.customersSubject.next([]);
 }
 });
 }

 private beginCustomersLoading(): void {
 this.customersLoadingRequestCount += 1;
 this.customersLoadingSubject.next(true);
 }

 private endCustomersLoading(): void {
 this.customersLoadingRequestCount = Math.max(0, this.customersLoadingRequestCount - 1);
 this.customersLoadingSubject.next(this.customersLoadingRequestCount > 0);
 }

 private setCustomer(customer: CustomerDetailRecord): void {
 this.customerStore.set(customer.id, customer);
 this.syncCustomersSubject();
 }

 private syncCustomersSubject(): void {
 this.customersSubject.next(Array.from(this.customerStore.values()).map((customer) => this.clone(customer)));
 }

 private ensurePresenceConnection(): void {
 if (!environment.realtimeEnabled ||
 this.presenceConnected ||
 environment.skipAuthForDevelopment ||!this.authService.hasApiSession) {
 return;
 }

 if (!this.isPresenceUrlSupported()) {
 return;
 }

 this.presenceConnected = true;

 this.presenceConnection = new signalR.HubConnectionBuilder().withUrl(this.hubUrl, {
 accessTokenFactory: () => this.authService.hasApiSession ? this.authService.getToken() ?? '' : '',
 transport: signalR.HttpTransportType.LongPolling
 }).withAutomaticReconnect().build();

 this.presenceConnection.on('customerPresenceUpdated', (update: { customerId: string; isOnlineNow: boolean; lastSeenAtUtc?: string | null }) => {
 this.applyPresenceUpdate(update);
 });

 this.presenceConnection.onreconnected(() => {
 this.presenceConnected = true;
 return Promise.resolve();
 });

 this.presenceConnection.onclose(() => {
 this.presenceConnected = false;
 this.presenceConnection = undefined;
 });

 void this.presenceConnection.start().catch((error) => {
 console.error('Failed to connect customer presence stream.', error);
 this.presenceConnected = false;
 this.presenceConnection = undefined;
 });
 }

 private isPresenceUrlSupported(): boolean {
 if (typeof window === 'undefined') {
 return true;
 }

 const pageProtocol = window.location.protocol;
 const hubProtocol = this.hubUrl.startsWith('https://') ? 'https:' : this.hubUrl.startsWith('http://') ? 'http:' : pageProtocol;

 if (pageProtocol === 'https:' && hubProtocol === 'http:') {
 console.warn('Skipping customer presence stream because the dashboard is running on HTTPS while the hub URL is HTTP.', {
 pageProtocol,
 hubUrl: this.hubUrl
 });
 return false;
 }

 return true;
 }

 private applyPresenceUpdate(update: { customerId: string; isOnlineNow: boolean; lastSeenAtUtc?: string | null }): void {
 const customer = this.customerStore.get(update.customerId);
 if (!customer) {
 return;
 }

 customer.isOnlineNow = update.isOnlineNow;
 customer.lastSeenAtUtc = update.lastSeenAtUtc ?? customer.lastSeenAtUtc ?? null;
 customer.lastSeenAt = this.formatPresenceLabel(customer.isOnlineNow, customer.lastSeenAtUtc);
 this.setCustomer(customer);
 }

 private loadCustomerStateFromLocalStorage(customer: CustomerDetailRecord): void {
 if (typeof window === 'undefined' ||!window.localStorage) {
 return;
 }
 try {
 const savedStr = localStorage.getItem(`admin_customer_state_${customer.id}`);
 if (savedStr) {
 const saved = JSON.parse(savedStr);
 if (saved) {
 if (saved.accountState) customer.accountState = saved.accountState;
 if (saved.reviewState) customer.reviewState = saved.reviewState;
 if (saved.trustState) customer.trustState = saved.trustState;
 if (saved.paymentState) customer.paymentState = saved.paymentState;
 if (saved.internalNotes) {
 customer.internalNotes = saved.internalNotes;
 }
 }
 }
 } catch (e) {
 console.error('Failed to load customer state from localStorage', e);
 }
 }

 private saveCustomerStateToLocalStorage(customer: CustomerDetailRecord): void {
 if (typeof window === 'undefined' ||!window.localStorage) {
 return;
 }
 try {
 const state = {
 accountState: customer.accountState,
 reviewState: customer.reviewState,
 trustState: customer.trustState,
 paymentState: customer.paymentState,
 internalNotes: customer.internalNotes
 };
 localStorage.setItem(`admin_customer_state_${customer.id}`, JSON.stringify(state));
 } catch (e) {
 console.error('Failed to save customer state to localStorage', e);
 }
 }
}
