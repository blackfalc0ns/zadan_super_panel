import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideAppTesting } from '../../../testing/testing.providers';
import { AuthService } from '@core/services/auth.service';
import { EmailCenterApiService } from './email-center.service';
import {
 EmailCenterOverview,
 EmailDispatchFilters,
 EmailWorkflowRule
} from '../models/email-center.models';

describe('EmailCenterApiService', () => {
 let service: EmailCenterApiService;
 let httpMock: HttpTestingController;

 const overview: EmailCenterOverview = {
 senderProfiles: [
 {
 id: 'ops-primary',
 name: 'Operations Primary',
 address: 'ops@zadana.sa',
 replyTo: 'support@zadana.sa',
 descriptionKey: 'EMAIL_CENTER.PROFILES.OPS_PRIMARY',
 locale: 'bilingual',
 isDefault: true,
 status: 'primary',
 isReadOnly: true
 }
 ],
 rules: [
 {
 id: 'super-admin-access-invite',
 titleKey: 'EMAIL_CENTER.EVENTS.SUPER_ADMIN_ACCESS_INVITE.TITLE',
 subtitleKey: 'EMAIL_CENTER.EVENTS.SUPER_ADMIN_ACCESS_INVITE.SUBTITLE',
 categoryKey: 'EMAIL_CENTER.CATEGORIES.ACCESS',
 cadenceLabelKey: 'EMAIL_CENTER.CADENCE.INSTANT',
 triggerNotesKey: 'EMAIL_CENTER.NOTES.SUPER_ADMIN_ACCESS_INVITE',
 enabled: true,
 senderProfileId: 'ops-primary',
 audienceType: 'super_admin',
 panelScope: 'super_admin_panel',
 personaTargets: ['super_admin_manager'],
 entityScope: {
 entityId: 'user-1',
 vendorId: null,
 branchId: null
 },
 branchScopeMode: 'all_branches',
 recipientTargets: {
 to: ['primary_account_email'],
 cc: ['assigned_super_admin_manager'],
 bcc: []
 },
 route: {
 staticTo: [],
 staticCc: [],
 staticBcc: [],
 fallbackTo: [],
 fallbackCc: [],
 fallbackBcc: [],
 owner: 'Access Control Desk',
 escalation: 'Security Governance'
 },
 template: {
 subject: { en: 'Subject', ar: 'عنوان' },
 body: { en: 'Body', ar: 'محتوى' },
 variables: ['{{full_name}}']
 },
 automationState: 'manual_only',
 eventKey: null,
 lastDispatch: null
 }
 ],
 kpi: {
 totalRules: 1,
 enabledRules: 1,
 senderProfiles: 1,
 directoryDrivenRules: 1,
 audienceCoverage: 1
 },
 vendors: [],
 branches: []
 };

 beforeEach(() => {
 TestBed.configureTestingModule({
 providers: [...provideAppTesting()]
 });

 service = TestBed.inject(EmailCenterApiService);
 httpMock = TestBed.inject(HttpTestingController);
 const authService = TestBed.inject(AuthService);
 // Inject a synthetic in-memory access token for HTTP request expectations.
 (authService as unknown as { accessToken: string }).accessToken = 'test-token';
 });

 afterEach(() => {
 httpMock.verify();
 });

 it('loads overview from the backend', () => {
 let result: EmailCenterOverview | undefined;

 service.getOverview().subscribe((response) => {
 result = response;
 });

 const request = httpMock.expectOne((req) => req.url.endsWith('/api/admin/email-center/overview'));
 expect(request.request.method).toBe('GET');
 expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
 request.flush(overview);

 expect(result?.rules.length).toBe(1);
 expect(result?.senderProfiles[0].isReadOnly).toBeTrue();
 });

 it('sends the rule draft to update and resolve endpoints', () => {
 const rule = overview.rules[0];

 service.updateRule(rule).subscribe();
 const updateRequest = httpMock.expectOne((req) => req.url.endsWith(`/api/admin/email-center/rules/${rule.id}`));
 expect(updateRequest.request.method).toBe('PUT');
 expect(updateRequest.request.body.id).toBe(rule.id);
 updateRequest.flush(rule);

 service.resolveRecipients(rule).subscribe();
 const resolveRequest = httpMock.expectOne((req) => req.url.endsWith(`/api/admin/email-center/rules/${rule.id}/resolve-recipients`));
 expect(resolveRequest.request.method).toBe('POST');
 expect(resolveRequest.request.body.recipientTargets.to).toEqual(['primary_account_email']);
 resolveRequest.flush({
 to: ['admin@zadana.sa'],
 cc: ['lead@zadana.sa'],
 bcc: [],
 warnings: []
 });
 });

 it('applies history filters as query params', () => {
 const filters: EmailDispatchFilters = {
 ruleId: 'super-admin-access-invite',
 source: 'test_send',
 status: 'sent',
 dateFrom: '2026-05-01',
 dateTo: '2026-05-07'
 };

 service.getDispatches(filters).subscribe();

 const request = httpMock.expectOne((req) => req.url.endsWith('/api/admin/email-center/dispatches'));
 expect(request.request.params.get('ruleId')).toBe(filters.ruleId);
 expect(request.request.params.get('source')).toBe(filters.source);
 expect(request.request.params.get('status')).toBe(filters.status);
 expect(request.request.params.get('dateFrom')).toBe(filters.dateFrom);
 expect(request.request.params.get('dateTo')).toBe(filters.dateTo);
 request.flush([]);
 });
});
