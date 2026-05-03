import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TranslateService } from '@ngx-translate/core';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const translate = inject(TranslateService);
    const token = authService.getToken();
    const lang = translate.currentLang || translate.defaultLang || 'ar';

    const isApiUrl = req.url.includes('/api/admin') || req.url.includes('/api/');

    if (isApiUrl) {
        req = req.clone({
            setHeaders: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'Accept-Language': lang
            }
        });
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 || error.status === 403) {
                const isAdminAuthRequest =
                    req.url.includes('/api/admin/auth/login') ||
                    req.url.includes('/api/admin/auth/logout');
                const hasStoredSession = !!token || !!authService.getRefreshToken() || authService.requiresFreshLogin;

                if (!isAdminAuthRequest && hasStoredSession) {
                    authService.forceLogoutForExpiredSession();

                    const returnUrl = router.url && !router.url.startsWith('/login')
                        ? router.url
                        : '/dashboard';

                    void router.navigate(['/login'], {
                        queryParams: {
                            returnUrl,
                            reason: 'session-expired'
                        },
                        replaceUrl: true
                    });
                }
            }

            return throwError(() => error);
        })
    );
};
