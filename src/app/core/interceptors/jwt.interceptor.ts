import {
    HttpErrorResponse,
    HttpEvent,
    HttpInterceptorFn,
    HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, from, retry, switchMap, throwError, timer } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const ADMIN_AUTH_LOGIN_PATH = '/admin/auth/login';
const ADMIN_AUTH_LOGOUT_PATH = '/admin/auth/logout';
const ADMIN_AUTH_REFRESH_PATH = '/admin/auth/refresh-token';
const ADMIN_AUTH_CSRF_PATH = '/admin/auth/csrf';
const ADMIN_AUTH_PASSWORD_RESET_PATHS = [
    '/admin/auth/forgot-password',
    '/admin/auth/verify-reset-otp',
    '/admin/auth/resend-reset-otp',
    '/admin/auth/reset-password'
] as const;

function getApiOrigin(): string | null {
    try {
        const apiBase = environment.apiUrl;
        if (!apiBase) return null;
        const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
        return new URL(apiBase, base).origin.toLowerCase();
    } catch {
        return null;
    }
}

function isOurApiRequest(req: HttpRequest<unknown>): boolean {
    const apiOrigin = getApiOrigin();
    if (!apiOrigin) return false;

    let resolved: URL;
    try {
        const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
        resolved = new URL(req.url, base);
    } catch {
        return false;
    }
    return resolved.origin.toLowerCase() === apiOrigin;
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const translate = inject(TranslateService);
    const lang = translate.currentLang || translate.defaultLang || 'ar';

    const isApiUrl = isOurApiRequest(req);
    if (!isApiUrl) {
        // Defensive: never let an Authorization header leak to a foreign URL
        // if some service mistakenly attached one.
        if (req.headers.has('Authorization')) {
            req = req.clone({ headers: req.headers.delete('Authorization') });
        }
        return next(req);
    }

    const skipAuth = req.headers.has('X-Skip-Auth');
    const token = authService.getToken();
    const isStateChanging = STATE_CHANGING_METHODS.has(req.method);
    const isAdminAuthRefresh = req.url.includes(ADMIN_AUTH_REFRESH_PATH);
    const isAdminAuthLogin = req.url.includes(ADMIN_AUTH_LOGIN_PATH);
    const isAdminAuthCsrf = req.url.includes(ADMIN_AUTH_CSRF_PATH);
    const isPublicGeographyRead = skipAuth && req.method === 'GET' && req.url.includes('/geography/');

    const headers: Record<string, string> = {
        'Accept-Language': lang
    };
    if (token && !skipAuth) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Attach CSRF token to every state-changing request to our API. This
    // protects all admin POST/PUT/PATCH/DELETE endpoints regardless of
    // whether the cookie auth was used (defence in depth).
    if (isStateChanging && !isAdminAuthCsrf && !skipAuth) {
        const csrf = authService.getCsrfToken();
        if (csrf) {
            headers['X-XSRF-TOKEN'] = csrf;
        }
    }

    if (skipAuth) {
        req = req.clone({ headers: req.headers.delete('X-Skip-Auth') });
    }

    // We must always send credentials (cookies) for our API so the refresh
    // cookie travels and antiforgery cookies stay in sync.
    req = req.clone({
        setHeaders: headers,
        withCredentials: !skipAuth
    });

    return next(req).pipe(
        retry({
            count: shouldRetryReadRequest(req, isPublicGeographyRead) ? 1 : 0,
            delay: (error: unknown, retryCount: number) => {
                if (!isTransientReadError(error)) {
                    return throwError(() => error);
                }

                return timer(200 * retryCount);
            }
        }),
        catchError((error: HttpErrorResponse) => {
            // Antiforgery (CSRF) failure → re-acquire token and retry once.
            if (error.status === 400 && isStateChanging && !isAdminAuthCsrf) {
                const message = (error.error as { code?: string; message?: string } | undefined)?.message ?? '';
                const looksLikeAntiforgery = /anti.?forgery|xsrf|csrf/i.test(message)
                    || (error.error as { code?: string } | undefined)?.code === 'ANTIFORGERY'
                    || (error.error as { code?: string } | undefined)?.code === 'INVALID_CSRF_TOKEN';
                if (looksLikeAntiforgery) {
                    return retryAfterCsrfRefresh(req, next, authService);
                }
            }

            if (error.status === 401) {
                const isAdminAuthRequest = isAdminAuthLogin
                    || req.url.includes(ADMIN_AUTH_LOGOUT_PATH)
                    || isAdminAuthRefresh
                    || isAdminAuthCsrf
                    || ADMIN_AUTH_PASSWORD_RESET_PATHS.some((path) => req.url.includes(path));

                if (!isAdminAuthRequest) {
                    return tryRefreshAndRetry(req, next, authService);
                }
            }

            return throwError(() => error);
        })
    );
};

/**
 * Attempts a silent refresh exactly once. If it succeeds, the original request
 * is replayed with the new access token. If it fails, the user is sent to
 * /login with reason=session-expired.
 */
function tryRefreshAndRetry(
    req: HttpRequest<unknown>,
    next: (r: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>,
    authService: AuthService
): Observable<HttpEvent<unknown>> {
    return authService.refreshAccessToken().pipe(
        switchMap((response) => {
            if (!response?.accessToken) {
                authService.forceLogoutForExpiredSession();
                return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }));
            }

            const retried = req.clone({
                setHeaders: { Authorization: `Bearer ${response.accessToken}` },
                withCredentials: true
            });
            return next(retried);
        }),
        catchError((err) => {
            authService.forceLogoutForExpiredSession();
            return throwError(() => err);
        })
    );
}

function shouldRetryReadRequest(req: HttpRequest<unknown>, isPublicGeographyRead: boolean): boolean {
    return req.method === 'GET' && !isPublicGeographyRead;
}

function isTransientReadError(error: unknown): boolean {
    return error instanceof HttpErrorResponse &&
        (error.status === 0 ||
            error.status === 502 ||
            error.status === 503 ||
            error.status === 504);
}

function retryAfterCsrfRefresh(
    req: HttpRequest<unknown>,
    next: (r: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>,
    authService: AuthService
): Observable<HttpEvent<unknown>> {
    return from(authService.acquireCsrfToken()).pipe(
        switchMap((token) => {
            if (!token) {
                return throwError(() => new HttpErrorResponse({ status: 400, statusText: 'CSRF token unavailable' }));
            }
            const retried = req.clone({
                setHeaders: { 'X-XSRF-TOKEN': token },
                withCredentials: true
            });
            return next(retried);
        }),
        catchError((err) => throwError(() => err))
    );
}
