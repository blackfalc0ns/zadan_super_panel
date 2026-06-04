import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, firstValueFrom, from, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AccessScope {
    panelScope: string;
    scopeType: string;
    scopeEntityId?: string | null;
    roleCode: string;
    roleName: string;
}

export interface EffectiveAccess {
    permissionVersion: number;
    permissions: string[];
    activeScope?: AccessScope | null;
}

export interface AdminUser {
    id: string;
    fullName: string;
    email?: string | null;
    phone?: string | null;
    role: string;
    mustChangePassword?: boolean;
    access?: EffectiveAccess | null;
}

export interface AuthLoginResponse {
    tokens: { accessToken: string; refreshToken?: string | null };
    user: AdminUser;
}

export interface RefreshResponse {
    accessToken: string;
}

export interface CsrfResponse {
    csrfToken: string;
}

export interface LoginCredentials {
    identifier: string;
    password: string;
}

export interface UpdateCurrentUserProfileRequest {
    fullName: string;
    email: string;
    phone: string;
}

export interface ChangeCurrentPasswordRequest {
    currentPassword: string;
    newPassword: string;
}

const DEV_ADMIN_USER: AdminUser = {
    id: 'dev-super-admin',
    fullName: 'Development Admin',
    email: 'dev@zadana.local',
    phone: '+201000000000',
    role: 'SuperAdmin',
    mustChangePassword: false,
    access: {
        permissionVersion: 1,
        permissions: ['*'],
        activeScope: null
    }
};

const DEV_BYPASS_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const IDLE_ACTIVITY_EVENTS: ReadonlyArray<keyof WindowEventMap> = [
    'mousemove',
    'mousedown',
    'keydown',
    'touchstart',
    'scroll'
];

const USER_PROFILE_STORAGE_KEY = 'admin_user';
const LAST_ACTIVITY_STORAGE_KEY = 'admin_last_activity';
const LOGIN_REQUIRED_STORAGE_KEY = 'admin_login_required';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiUrl = `${environment.apiUrl}/admin/auth`;

    /**
     * Access token lives in memory only. We never persist it to localStorage —
     * this materially reduces the blast radius of an XSS bug in any third-party
     * dependency or rendered server payload, because there is no static
     * credential for an attacker to exfiltrate via document.cookie or storage.
     *
     * On page reload, the SPA calls /admin/auth/refresh-token which uses the
     * HttpOnly refresh-token cookie to mint a fresh access token.
     */
    private accessToken: string | null = null;

    private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private idleTimerHandle: ReturnType<typeof setTimeout> | null = null;
    private idleListenersBound = false;
    private readonly devBypassEnabled: boolean;

    /**
     * Cached CSRF token. Refreshed when the server invalidates it (we receive
     * a 400 with antiforgery validation failure) or on app startup.
     */
    private csrfToken: string | null = null;

    constructor(private http: HttpClient, private ngZone: NgZone) {
        this.devBypassEnabled = this.computeDevBypassEnabled();

        if (this.devBypassEnabled) {
            console.warn(
                '%c[Zadana Admin] DEV AUTH BYPASS ACTIVE — do not deploy this build to production.',
                'background:#7f1d1d;color:#fff;padding:4px 8px;border-radius:4px;font-weight:bold;'
            );
        }

        if (this.shouldUseDevelopmentBypass()) {
            this.currentUserSubject.next(DEV_ADMIN_USER);
            return;
        }

        this.loadUserFromStorage();
    }

    public get currentUserValue(): AdminUser | null {
        return this.currentUserSubject.value;
    }

    /**
     * True when an in-memory access token is held AND it has not yet expired.
     * Used by guards/interceptors to decide whether to attach Authorization
     * headers and whether to redirect to /login.
     */
    public get hasApiSession(): boolean {
        if (!this.accessToken) {
            return false;
        }

        if (this.isTokenExpired(this.accessToken)) {
            this.markLoginRequired();
            this.clearSession();
            return false;
        }

        if (this.isIdleTimedOut()) {
            this.markLoginRequired();
            this.clearSession();
            return false;
        }

        return true;
    }

    public get isAuthenticated(): boolean {
        return this.hasApiSession || this.shouldUseDevelopmentBypass();
    }

    public get isDevelopmentBypassActive(): boolean {
        return this.shouldUseDevelopmentBypass();
    }

    public get requiresFreshLogin(): boolean {
        return this.safeLocalGet(LOGIN_REQUIRED_STORAGE_KEY) === '1';
    }

    public getToken(): string | null {
        return this.accessToken;
    }

    public getCsrfToken(): string | null {
        return this.csrfToken;
    }

    /**
     * Bootstraps the auth state on application startup. Called from
     * APP_INITIALIZER so guards can safely read currentUserValue on first
     * navigation.
     *
     *  1. Acquire a CSRF token (always — required for all state-changing requests).
     *  2. If the dev bypass is active, expose the synthetic admin user.
     *  3. Otherwise attempt a silent refresh using the HttpOnly cookie.
     *     If it succeeds, fetch /me. If it fails, the user lands on /login.
     */
    public async bootstrap(): Promise<AdminUser | null> {
        await this.acquireCsrfToken().catch(() => undefined);

        if (this.shouldUseDevelopmentBypass()) {
            this.currentUserSubject.next(DEV_ADMIN_USER);
            return DEV_ADMIN_USER;
        }

        if (this.requiresFreshLogin) {
            return null;
        }

        try {
            const response = await firstValueFrom(this.refreshAccessToken());
            if (!response) {
                return null;
            }

            // Refresh the CSRF token now that we have the access token!
            await this.acquireCsrfToken().catch(() => undefined);

            const user = await firstValueFrom(this.fetchMe());
            this.startIdleWatchdog();
            return user;
        } catch {
            this.forceLogoutForExpiredSession();
            return null;
        }
    }

    public login(credentials: LoginCredentials): Observable<AuthLoginResponse> {
        return this.http
            .post<AuthLoginResponse>(`${this.apiUrl}/login`, credentials, { withCredentials: true })
            .pipe(
                switchMap(response => {
                    this.clearLoginRequired();
                    this.accessToken = response.tokens?.accessToken ?? null;
                    this.touchActivity();
                    this.startIdleWatchdog();
                    this.safeLocalSet(USER_PROFILE_STORAGE_KEY, JSON.stringify(response.user));
                    this.currentUserSubject.next(response.user);
                    return from(this.acquireCsrfToken()).pipe(
                        catchError(() => of(null)),
                        map(() => response)
                    );
                })
            );
    }

    public refreshAccessToken(): Observable<RefreshResponse | null> {
        return this.http
            .post<RefreshResponse>(`${this.apiUrl}/refresh-token`, {}, { withCredentials: true })
            .pipe(
                tap(response => {
                    if (response?.accessToken) {
                        this.accessToken = response.accessToken;
                        this.touchActivity();
                        // Proactively fetch a fresh CSRF token since the old one was deleted upon token refresh.
                        void this.acquireCsrfToken().catch(() => undefined);
                    }
                }),
                catchError((err: HttpErrorResponse) => {
                    if (err.status === 401 || err.status === 403) {
                        this.forceLogoutForExpiredSession();
                        return of(null);
                    }
                    return throwError(() => err);
                })
            );
    }

    public changeTemporaryPassword(currentPassword: string, newPassword: string): Observable<void> {
        if (this.shouldUseDevelopmentBypass()) {
            const currentUser = this.currentUserValue;
            if (currentUser) {
                const updatedUser: AdminUser = { ...currentUser, mustChangePassword: false };
                this.currentUserSubject.next(updatedUser);
            }
            return of(void 0);
        }

        return this.http
            .post<void>(
                `${this.apiUrl}/change-temporary-password`,
                { currentPassword, newPassword },
                { withCredentials: true }
            )
            .pipe(
                tap(() => {
                    const currentUser = this.currentUserValue;
                    if (!currentUser) return;
                    const updatedUser: AdminUser = { ...currentUser, mustChangePassword: false };
                    this.safeLocalSet(USER_PROFILE_STORAGE_KEY, JSON.stringify(updatedUser));
                    this.currentUserSubject.next(updatedUser);
                })
            );
    }

    public updateCurrentUserProfile(payload: UpdateCurrentUserProfileRequest): Observable<AdminUser> {
        if (this.shouldUseDevelopmentBypass()) {
            const currentUser = this.currentUserValue;
            if (currentUser) {
                const updatedUser: AdminUser = { ...currentUser, ...payload };
                this.persistCurrentUser(updatedUser);
                return of(updatedUser);
            }
        }

        return from(this.acquireCsrfToken()).pipe(
            switchMap(() => this.http.put<AdminUser>(`${this.apiUrl}/me`, payload, { withCredentials: true })),
            map((user) => this.normalizeAdminUser(user)),
            tap((user) => this.persistCurrentUser(user))
        );
    }

    public changePassword(payload: ChangeCurrentPasswordRequest): Observable<void> {
        if (this.shouldUseDevelopmentBypass()) {
            const currentUser = this.currentUserValue;
            if (currentUser) {
                const updatedUser: AdminUser = { ...currentUser, mustChangePassword: false };
                this.persistCurrentUser(updatedUser);
            }
            return of(void 0);
        }

        const endpoint = this.currentUserValue?.mustChangePassword
            ? `${this.apiUrl}/change-temporary-password`
            : `${this.apiUrl}/change-password`;

        return from(this.acquireCsrfToken()).pipe(
            switchMap(() => this.http.post<void>(endpoint, {
                currentPassword: payload.currentPassword,
                newPassword: payload.newPassword
            }, { withCredentials: true })),
            tap(() => {
                const currentUser = this.currentUserValue;
                if (!currentUser) {
                    return;
                }

                this.persistCurrentUser({ ...currentUser, mustChangePassword: false });
            })
        );
    }

    public logout(): Observable<void> {
        if (this.shouldUseDevelopmentBypass()) {
            this.clearLoginRequired();
            this.clearSession();
            return of(void 0);
        }

        return this.http
            .post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
            .pipe(
                catchError((err) => {
                    console.warn('[Zadana Admin] logout request failed; clearing local session anyway.', err);
                    return of(void 0);
                }),
                tap(() => {
                    this.clearLoginRequired();
                    this.clearSession();
                })
            );
    }

    public forceLogout(): void {
        this.clearLoginRequired();
        this.clearSession();
    }

    public forceLogoutForExpiredSession(): void {
        this.markLoginRequired();
        this.clearSession();
    }

    public touchActivity(): void {
        this.safeLocalSet(LAST_ACTIVITY_STORAGE_KEY, Date.now().toString());
    }

    /**
     * Acquires a fresh CSRF token from the server. The XSRF-TOKEN cookie is
     * set automatically by the server (non-HttpOnly so we can read it).
     */
    public async acquireCsrfToken(): Promise<string | null> {
        try {
            const response = await firstValueFrom(
                this.http.get<CsrfResponse>(`${this.apiUrl}/csrf`, { withCredentials: true })
            );
            this.csrfToken = response?.csrfToken ?? this.readCsrfFromCookie();
            return this.csrfToken;
        } catch {
            this.csrfToken = this.readCsrfFromCookie();
            return this.csrfToken;
        }
    }

    public refreshCsrfFromCookie(): void {
        const fromCookie = this.readCsrfFromCookie();
        if (fromCookie) {
            this.csrfToken = fromCookie;
        }
    }

    private fetchMe(): Observable<AdminUser> {
        if (this.shouldUseDevelopmentBypass()) {
            return of(this.currentUserValue ?? DEV_ADMIN_USER);
        }

        const headers = new HttpHeaders({
            ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {})
        });
        return this.http.get<AdminUser>(`${this.apiUrl}/me`, { headers, withCredentials: true }).pipe(
            map((user) => this.normalizeAdminUser(user)),
            tap((user) => this.persistCurrentUser(user))
        );
    }

    private normalizeAdminUser(user: AdminUser): AdminUser {
        return {
            ...user,
            id: user?.id != null ? String(user.id) : '',
            phone: user?.phone ?? (user as AdminUser & { phoneNumber?: string }).phoneNumber ?? null
        };
    }

    private persistCurrentUser(user: AdminUser): void {
        const normalized = this.normalizeAdminUser(user);
        this.safeLocalSet(USER_PROFILE_STORAGE_KEY, JSON.stringify(normalized));
        this.currentUserSubject.next(normalized);
    }

    /**
     * Public helper used by profile / settings screens to re-pull the current
     * user from the server. Falls back to null on auth failures so callers can
     * keep the cached value.
     */
    public refreshAccess(): Observable<AdminUser | null> {
        return this.fetchMe().pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401 || err.status === 403) {
                    this.forceLogoutForExpiredSession();
                }
                return of(null);
            })
        );
    }

    private isTokenExpired(token: string): boolean {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            return payload.exp ? (payload.exp * 1000) <= Date.now() : false;
        } catch {
            return true;
        }
    }

    private clearSession(): void {
        this.accessToken = null;
        this.safeLocalRemove(USER_PROFILE_STORAGE_KEY);
        this.safeLocalRemove(LAST_ACTIVITY_STORAGE_KEY);
        this.stopIdleWatchdog();
        this.currentUserSubject.next(null);
    }

    private shouldUseDevelopmentBypass(): boolean {
        return this.devBypassEnabled && !this.accessToken && !this.requiresFreshLogin;
    }

    private computeDevBypassEnabled(): boolean {
        if (!environment.skipAuthForDevelopment) {
            return false;
        }
        if (environment.production) {
            return false;
        }
        if (typeof window === 'undefined') {
            return false;
        }
        const host = (window.location?.hostname || '').toLowerCase();
        if (!host) {
            return false;
        }
        return DEV_BYPASS_HOSTS.has(host) || host.endsWith('.localhost');
    }

    private loadUserFromStorage(): void {
        const userJson = this.safeLocalGet(USER_PROFILE_STORAGE_KEY);
        if (!userJson) {
            if (this.shouldUseDevelopmentBypass()) {
                this.currentUserSubject.next(DEV_ADMIN_USER);
            }
            return;
        }

        try {
            this.currentUserSubject.next(JSON.parse(userJson));
        } catch {
            this.clearSession();
        }
    }

    private markLoginRequired(): void {
        this.safeLocalSet(LOGIN_REQUIRED_STORAGE_KEY, '1');
    }

    private clearLoginRequired(): void {
        this.safeLocalRemove(LOGIN_REQUIRED_STORAGE_KEY);
    }

    // --------------------------------------------------------------------
    //  Idle session enforcement
    // --------------------------------------------------------------------

    private isIdleTimedOut(): boolean {
        const raw = this.safeLocalGet(LAST_ACTIVITY_STORAGE_KEY);
        if (!raw) {
            this.touchActivity();
            return false;
        }
        const last = Number(raw);
        if (!Number.isFinite(last)) {
            this.touchActivity();
            return false;
        }
        return Date.now() - last > IDLE_TIMEOUT_MS;
    }

    private startIdleWatchdog(): void {
        if (this.idleListenersBound || typeof window === 'undefined') {
            return;
        }
        this.idleListenersBound = true;
        this.touchActivity();

        const handleActivity = () => this.touchActivity();

        this.ngZone.runOutsideAngular(() => {
            for (const evt of IDLE_ACTIVITY_EVENTS) {
                window.addEventListener(evt, handleActivity, { passive: true });
            }
            if (typeof document !== 'undefined') {
                document.addEventListener('visibilitychange', handleActivity, { passive: true });
            }

            const tick = () => {
                if (!this.accessToken) {
                    this.stopIdleWatchdog();
                    return;
                }
                if (this.isIdleTimedOut()) {
                    this.ngZone.run(() => this.forceLogoutForExpiredSession());
                    return;
                }
                this.idleTimerHandle = setTimeout(tick, 60_000);
            };
            this.idleTimerHandle = setTimeout(tick, 60_000);
        });
    }

    private stopIdleWatchdog(): void {
        if (this.idleTimerHandle) {
            clearTimeout(this.idleTimerHandle);
            this.idleTimerHandle = null;
        }
    }

    // --------------------------------------------------------------------
    //  CSRF cookie reader
    // --------------------------------------------------------------------

    private readCsrfFromCookie(): string | null {
        if (typeof document === 'undefined' || !document.cookie) {
            return null;
        }
        const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
        if (!match) {
            return null;
        }
        try {
            return decodeURIComponent(match[1]);
        } catch {
            return null;
        }
    }

    // --------------------------------------------------------------------
    //  Defensive storage wrappers
    // --------------------------------------------------------------------

    private safeLocalGet(key: string): string | null {
        try { return localStorage.getItem(key); } catch { return null; }
    }

    private safeLocalSet(key: string, value: string): void {
        try { localStorage.setItem(key, value); } catch { /* ignore */ }
    }

    private safeLocalRemove(key: string): void {
        try { localStorage.removeItem(key); } catch { /* ignore */ }
    }
}
