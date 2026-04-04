import { NavigationExtras } from '@angular/router';

export interface FinanceScopedProfileNavigation {
  commands: string[];
  extras: NavigationExtras;
}

export function buildFinanceScopedProfileNavigation(
  entityType: 'vendor' | 'driver',
  entityId: string
): FinanceScopedProfileNavigation {
  if (entityType === 'vendor') {
    return {
      commands: ['/vendors', entityId, 'finance'],
      extras: {}
    };
  }

  return {
    commands: ['/drivers', entityId],
    extras: {
      queryParams: { tab: 'finance' }
    }
  };
}
