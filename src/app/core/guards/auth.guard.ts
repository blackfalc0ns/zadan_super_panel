import { inject } from '@angular/core';
import { Router, type CanActivateChildFn, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

function checkAuth(stateUrl: string) {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (authService.isAuthenticated) {
        return true;
    }

    // Not logged in so redirect to login page with the return url
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: stateUrl } });
};

export const authGuard: CanActivateFn = (route, state) => checkAuth(state.url);

export const authChildGuard: CanActivateChildFn = (route, state) => checkAuth(state.url);
