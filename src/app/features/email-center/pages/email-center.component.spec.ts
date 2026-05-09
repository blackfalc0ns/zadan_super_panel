import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { provideAppTesting } from '../../../testing/testing.providers';
import { AccessService } from '@core/services/access.service';
import { ToastService } from '@shared/services/toast.service';
import { of } from 'rxjs';
import { EmailCenterComponent } from './email-center.component';
import { EmailCenterApiService } from '../services/email-center.service';
import { EmailCenterOverview, EmailResolvedRecipients } from '../models/email-center.models';

describe('EmailCenterComponent', () => {
  let component: EmailCenterComponent;
  let fixture: ComponentFixture<EmailCenterComponent>;
  let emailCenterApi: jasmine.SpyObj<EmailCenterApiService>;

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
      },
      {
        id: 'driver-verification-update',
        titleKey: 'EMAIL_CENTER.EVENTS.DRIVER_VERIFICATION_UPDATE.TITLE',
        subtitleKey: 'EMAIL_CENTER.EVENTS.DRIVER_VERIFICATION_UPDATE.SUBTITLE',
        categoryKey: 'EMAIL_CENTER.CATEGORIES.DRIVER_NETWORK',
        cadenceLabelKey: 'EMAIL_CENTER.CADENCE.INSTANT',
        triggerNotesKey: 'EMAIL_CENTER.NOTES.DRIVER_VERIFICATION_UPDATE',
        enabled: true,
        senderProfileId: 'ops-primary',
        audienceType: 'drivers',
        panelScope: 'driver_app',
        personaTargets: ['driver'],
        entityScope: {
          entityId: 'driver-1',
          vendorId: null,
          branchId: null
        },
        branchScopeMode: 'all_branches',
        recipientTargets: {
          to: ['driver_account'],
          cc: [],
          bcc: []
        },
        route: {
          staticTo: [],
          staticCc: [],
          staticBcc: [],
          fallbackTo: [],
          fallbackCc: [],
          fallbackBcc: [],
          owner: 'Driver Operations',
          escalation: 'Driver Compliance'
        },
        template: {
          subject: { en: 'Driver subject', ar: 'عنوان السائق' },
          body: { en: 'Driver body', ar: 'محتوى السائق' },
          variables: ['{{driver_name}}']
        },
        automationState: 'manual_only',
        eventKey: null,
        lastDispatch: null
      }
    ],
    kpi: {
      totalRules: 2,
      enabledRules: 2,
      senderProfiles: 1,
      directoryDrivenRules: 2,
      audienceCoverage: 2
    },
    vendors: [],
    branches: []
  };

  const resolvedRecipients: EmailResolvedRecipients = {
    to: ['ops@zadana.sa'],
    cc: ['lead@zadana.sa'],
    bcc: [],
    warnings: []
  };

  beforeEach(async () => {
    emailCenterApi = jasmine.createSpyObj<EmailCenterApiService>('EmailCenterApiService', [
      'getOverview',
      'updateRule',
      'resolveRecipients',
      'testSend',
      'getDispatches'
    ]);

    emailCenterApi.getOverview.and.returnValue(of(overview));
    emailCenterApi.resolveRecipients.and.returnValue(of(resolvedRecipients));
    emailCenterApi.getDispatches.and.returnValue(of([
      {
        id: 'dispatch-1',
        ruleId: 'super-admin-access-invite',
        ruleLabel: 'Super admin access invite',
        audienceType: 'super_admin',
        source: 'test_send',
        status: 'sent',
        subject: 'Subject',
        to: ['ops@zadana.sa'],
        cc: [],
        bcc: [],
        provider: 'resend',
        providerMessageId: 'provider-1',
        failureReason: null,
        eventKey: null,
        isTestSend: true,
        createdAtUtc: '2026-05-07T11:30:00Z'
      }
    ]));
    emailCenterApi.updateRule.and.returnValue(of(overview.rules[0]));
    emailCenterApi.testSend.and.returnValue(of({
      dispatchId: 'dispatch-2',
      status: 'sent',
      provider: 'resend',
      providerMessageId: 'provider-2',
      failureReason: null,
      createdAtUtc: '2026-05-07T11:35:00Z'
    }));

    await TestBed.configureTestingModule({
      imports: [EmailCenterComponent],
      providers: [
        ...provideAppTesting(),
        { provide: EmailCenterApiService, useValue: emailCenterApi },
        { provide: AccessService, useValue: { hasPermission: () => true } },
        {
          provide: ToastService,
          useValue: jasmine.createSpyObj<ToastService>('ToastService', ['success', 'error', 'warning', 'info'])
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailCenterComponent);
    component = fixture.componentInstance;
  });

  it('loads overview, preview recipients, and history from the backend', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(emailCenterApi.getOverview).toHaveBeenCalledTimes(1);
    expect(emailCenterApi.getDispatches).toHaveBeenCalledTimes(1);
    expect(component.rules.length).toBe(2);
    expect(component.dispatches.length).toBe(1);
    expect(component.resolvedRecipients.to).toEqual(['ops@zadana.sa']);
  }));

  it('filters workflow rules by selected audience', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);

    component.setAudience('drivers');
    tick();
    fixture.detectChanges();

    expect(component.filteredRules.length).toBe(1);
    expect(component.filteredRules.every((rule) => rule.audienceType === 'drivers')).toBeTrue();
    discardPeriodicTasks();
  }));

  it('debounces recipient preview calls when the draft changes', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);
    emailCenterApi.resolveRecipients.calls.reset();

    component.onRuleDraftChanged();
    component.onRuleDraftChanged();
    component.onRuleDraftChanged();

    tick(349);
    expect(emailCenterApi.resolveRecipients).not.toHaveBeenCalled();

    tick(1);
    expect(emailCenterApi.resolveRecipients).toHaveBeenCalledTimes(1);
  }));
});
