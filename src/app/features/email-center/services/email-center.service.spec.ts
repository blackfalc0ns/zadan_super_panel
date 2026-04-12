import { TestBed } from '@angular/core/testing';
import { provideAppTesting } from '../../../testing/testing.providers';
import { EmailCenterService } from './email-center.service';

describe('EmailCenterService', () => {
  let service: EmailCenterService;

  beforeEach(() => {
    localStorage.removeItem('superadmin.email-center.v2');
    localStorage.removeItem('superadmin.email-center.v1');
    TestBed.configureTestingModule({
      providers: [...provideAppTesting()]
    });
    service = TestBed.inject(EmailCenterService);
  });

  it('loads seed sender profiles and persona-aware workflow rules', () => {
    expect(service.getSenderProfiles().length).toBeGreaterThan(0);
    expect(service.getRules().length).toBeGreaterThan(0);
    expect(service.getRules().some((rule) => rule.audienceType === 'vendor_network')).toBeTrue();
    expect(service.getRules().some((rule) => rule.audienceType === 'drivers')).toBeTrue();
    expect(service.getRules().some((rule) => rule.audienceType === 'customers')).toBeTrue();
  });

  it('persists updates to a selected email rule', () => {
    const rule = service.getRuleById('super-admin-access-invite');

    expect(rule).toBeTruthy();

    if (!rule) {
      return;
    }

    rule.enabled = false;
    rule.route.staticTo = ['new.route@zadana.sa'];
    service.saveRule(rule);

    const updated = service.getRuleById('super-admin-access-invite');
    expect(updated?.enabled).toBeFalse();
    expect(updated?.route.staticTo).toEqual(['new.route@zadana.sa']);
  });

  it('resolves recipient targets through the access directory and falls back when needed', () => {
    const rule = service.getRuleById('vendor-branch-invite');

    expect(rule).toBeTruthy();

    if (!rule) {
      return;
    }

    const recipients = service.resolveRuleRecipients(rule);

    expect(recipients.to.length).toBeGreaterThan(0);
    expect(recipients.cc.length).toBeGreaterThan(0);
  });
});
