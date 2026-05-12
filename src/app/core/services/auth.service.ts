import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
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

export interface AuthResponse {
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
    user: AdminUser;
}

export interface LoginCredentials {
    identifier: string;
    password: string;
}

const DEV_ADMIN_USER: AdminUser = {
    id: 'dev-super-admin',
    fullName: 'Development Admin',
    email: 'dev@zadana.local',
    role: 'SuperAdmin',
    mustChangePassword: false,
    access: {
        permissionVersion: 1,
        permissions: ['*'], // A wildcard or just let it pass development bypass
        activeScope: null
    }
};

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiUrl = `${environment.apiUrl}/admin/auth`;
    private readonly loginRequiredStorageKey = 'admin_login_required';

    private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        if (this.shouldUseDevelopmentBypass()) {
            this.currentUserSubject.next(DEV_ADMIN_USER);
            return;
        }

        this.loadUserFromStorage();
    }

    public get currentUserValue(): AdminUser | null {
        return this.currentUserSubject.value;
    }

    public get hasApiSession(): boolean {
        const token = this.getToken();
        if (!token) {
            return false;
        }

        if (this.isTokenExpired(token)) {
            this.markLoginRequired();
            this.clearSession();
            return false;
        }

        return true;
    }

    public get isAuthenticated(): boolean {
        return this.hasApiSession || this.shouldUseDevelopmentBypass();
    }

    public get requiresFreshLogin(): boolean {
        return localStorage.getItem(this.loginRequiredStorageKey) === '1';
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

    public getToken(): string | null {
        return localStorage.getItem('admin_token');
    }

    public getRefreshToken(): string | null {
        return localStorage.getItem('admin_refresh_token');
    }

    login(credentials: LoginCredentials): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap(response => {
                    this.clearLoginRequired();
                    localStorage.setItem('admin_token', response.tokens.accessToken);
                    localStorage.setItem('admin_refresh_token', response.tokens.refreshToken);
                    localStorage.setItem('admin_user', JSON.stringify(response.user));
                    this.currentUserSubject.next(response.user);
                })
            );
    }

    changeTemporaryPassword(currentPassword: string, newPassword: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/change-temporary-password`, { currentPassword, newPassword }).pipe(
            tap(() => {
                const currentUser = this.currentUserValue;
                if (!currentUser) {
                    return;
                }

                const updatedUser: AdminUser = { ...currentUser, mustChangePassword: false };
                localStorage.setItem('admin_user', JSON.stringify(updatedUser));
                this.currentUserSubject.next(updatedUser);
            })
        );
    }

    logout(): Observable<void> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            this.clearLoginRequired();
            this.clearSession();
            return of(void 0);
        }

        return this.http.post<void>(`${this.apiUrl}/logout`, { refreshToken }).pipe(
            catchError(() => of(void 0)),
            tap(() => {
                this.clearLoginRequired();
                this.clearSession();
            })
        );
    }

    forceLogout(): void {
        this.clearLoginRequired();
        this.clearSession();
    }

    forceLogoutForExpiredSession(): void {
        this.markLoginRequired();
        this.clearSession();
    }

    public bootstrap(): Observable<AdminUser | null> {
        if (!this.hasApiSession && !this.shouldUseDevelopmentBypass()) {
            return of(null);
        }

        if (this.shouldUseDevelopmentBypass()) {
            this.currentUserSubject.next(DEV_ADMIN_USER);
            return of(DEV_ADMIN_USER);
        }

        return this.fetchMe().pipe(
            catchError(() => {
                return of(this.currentUserValue);
            })
        );
    }

    public refreshAccess(): Observable<AdminUser | null> {
        return this.fetchMe().pipe(
            catchError((err) => {
                if (err.status === 401 || err.status === 403) {
                    this.forceLogoutForExpiredSession();
                }
                return of(null);
            })
        );
    }

    private fetchMe(): Observable<AdminUser> {
        return this.http.get<AdminUser>(`${this.apiUrl}/me`).pipe(
            tap(user => {
                localStorage.setItem('admin_user', JSON.stringify(user));
                this.currentUserSubject.next(user);
            })
        );
    }

    private clearSession(): void {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
        this.currentUserSubject.next(null);
    }

    private hasValidStoredSession(): boolean {
        const token = this.getToken();
        return !!token && !this.isTokenExpired(token);
    }

    private shouldUseDevelopmentBypass(): boolean {
        return environment.skipAuthForDevelopment && !this.hasValidStoredSession() && !this.requiresFreshLogin;
    }

    private loadUserFromStorage(): void {
        const userJson = localStorage.getItem('admin_user');
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
        localStorage.setItem(this.loginRequiredStorageKey, '1');
    }

    private clearLoginRequired(): void {
        localStorage.removeItem(this.loginRequiredStorageKey);
    }
}
