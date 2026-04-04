import { buildFinanceScopedProfileNavigation } from './finance-profile-navigation.utils';

describe('Finance Profile Navigation Utils', () => {
  it('routes vendors to the canonical vendor finance tab', () => {
    expect(buildFinanceScopedProfileNavigation('vendor', 'vendor-1')).toEqual({
      commands: ['/vendors', 'vendor-1', 'finance'],
      extras: {}
    });
  });

  it('routes drivers to the current driver finance tab query params', () => {
    expect(buildFinanceScopedProfileNavigation('driver', 'driver-1')).toEqual({
      commands: ['/drivers', 'driver-1'],
      extras: {
        queryParams: { tab: 'finance' }
      }
    });
  });
});
