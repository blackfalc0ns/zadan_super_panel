import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Prevents authenticated users from accessing login/register pages
 */
export const guestGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (authService.isAuthenticated) {
        // User is already logged in, redirect to dashboard
        return router.createUrlTree(['/dashboard']);
    }

    return true;
};
