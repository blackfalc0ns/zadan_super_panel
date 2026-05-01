import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
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
            if (environment.skipAuthForDevelopment) {
                return throwError(() => error);
            }

            if (error.status === 401 || error.status === 403) {
                authService.forceLogout();
                router.navigate(['/dashboard']);
            }
            return throwError(() => error);
        })
    );
};
