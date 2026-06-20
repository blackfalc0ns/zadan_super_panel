import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const apiSessionGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  authService.validateActiveSession();

  if (authService.hasApiSession) {
    return true;
  }

  const queryParams: Record<string, string> = { returnUrl: state.url };
  if (authService.requiresFreshLogin) {
    queryParams['reason'] = 'session-expired';
  }

  return router.createUrlTree(['/login'], { queryParams });
};
