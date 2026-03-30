import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminUser {
    id: string;
    fullName: string;
    email?: string | null;
    phone?: string | null;
    role: string;
}

export interface AuthResponse {
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
    user: AdminUser;
}

const DEV_ADMIN_USER: AdminUser = {
    id: 'dev-super-admin',
    fullName: 'Development Admin',
    email: 'dev@zadana.local',
    role: 'SuperAdmin'
};

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiUrl = `${environment.apiUrl}/admin/auth`;

    private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        if (environment.skipAuthForDevelopment) {
            this.currentUserSubject.next(DEV_ADMIN_USER);
            return;
        }

        this.loadUserFromStorage();
    }

    public get currentUserValue(): AdminUser | null {
        return this.currentUserSubject.value;
    }

    public get isAuthenticated(): boolean {
        if (environment.skipAuthForDevelopment) {
            return true;
        }

        const token = this.getToken();
        if (!token) return false;

        if (this.isTokenExpired(token)) {
            this.forceLogout();
            return false;
        }

        return true;
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

    login(credentials: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap(response => {
                    localStorage.setItem('admin_token', response.tokens.accessToken);
                    localStorage.setItem('admin_refresh_token', response.tokens.refreshToken);
                    localStorage.setItem('admin_user', JSON.stringify(response.user));
                    this.currentUserSubject.next(response.user);
                })
            );
    }

    logout(): Observable<void> {
        if (environment.skipAuthForDevelopment) {
            this.currentUserSubject.next(DEV_ADMIN_USER);
            return of(void 0);
        }

        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            this.clearSession();
            return of(void 0);
        }

        return this.http.post<void>(`${this.apiUrl}/logout`, { refreshToken }).pipe(
            catchError(() => of(void 0)),
            tap(() => this.clearSession())
        );
    }

    forceLogout(): void {
        this.clearSession();
    }

    private clearSession(): void {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
        this.currentUserSubject.next(null);
    }

    private loadUserFromStorage(): void {
        const userJson = localStorage.getItem('admin_user');
        if (!userJson) {
            return;
        }

        try {
            this.currentUserSubject.next(JSON.parse(userJson));
        } catch {
            this.clearSession();
        }
    }
}
