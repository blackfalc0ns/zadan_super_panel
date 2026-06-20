import { inject } from '@angular/core';
import { Router, type CanActivateChildFn, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

function checkAuth(stateUrl: string) {
    const router = inject(Router);
    const authService = inject(AuthService);

    authService.validateActiveSession();

    if (authService.isAuthenticated) {
        if (authService.currentUserValue?.mustChangePassword && !stateUrl.startsWith('/change-temporary-password')) {
            return router.createUrlTree(['/change-temporary-password'], { queryParams: { returnUrl: stateUrl } });
        }

        if (!authService.currentUserValue?.mustChangePassword && stateUrl.startsWith('/change-temporary-password')) {
            return router.createUrlTree(['/dashboard']);
        }

        return true;
    }

    const queryParams: Record<string, string> = { returnUrl: stateUrl };
    if (authService.requiresFreshLogin) {
        queryParams['reason'] = 'session-expired';
    }

    return router.createUrlTree(['/login'], { queryParams });
};

export const authGuard: CanActivateFn = (route, state) => checkAuth(state.url);

export const authChildGuard: CanActivateChildFn = (route, state) => checkAuth(state.url);
