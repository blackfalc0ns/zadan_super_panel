import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Prevents authenticated users from accessing login/register pages
 */
export const guestGuard: CanActivateFn = (route, state) => {
    if (environment.skipAuthForDevelopment) {
        return true;
    }

    const router = inject(Router);
    const authService = inject(AuthService);

    if (authService.isAuthenticated) {
        // User is already logged in, redirect to dashboard
        return router.createUrlTree(['/dashboard']);
    }

    return true;
};
