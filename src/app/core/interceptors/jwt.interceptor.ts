import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();

    // Add Authorization header to /admin endpoints
    const isApiUrl = req.url.includes('/api/admin') || req.url.includes('/api/');

    if (token && isApiUrl) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 || error.status === 403) {
                // Token is invalid/expired, or user doesn't have permission
                authService.logout();
                router.navigate(['/login'], { queryParams: { returnUrl: router.routerState.snapshot.url } });
            }
            return throwError(() => error);
        })
    );
};
