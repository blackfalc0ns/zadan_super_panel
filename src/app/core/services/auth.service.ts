import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminUser {
    id: string;
    fullName: string;
    email: string;
    roles: string[];
}

export interface AuthResponse {
    tokens: {
        accessToken: string;
        refreshToken: string;
        expiresAt: string;
    };
    user: AdminUser;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiUrl = `${environment.apiUrl}/admin/auth`;

    private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadUserFromStorage();
    }

    public get currentUserValue(): AdminUser | null {
        return this.currentUserSubject.value;
    }

    public get isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        if (this.isTokenExpired(token)) {
            // Token is expired, clear local storage
            this.logout();
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
            if (payload.exp) {
                // payload.exp is in seconds, Date.now() is in milliseconds
                return (payload.exp * 1000) <= Date.now();
            }
            return false;
        } catch (e) {
            return true; // If parsing fails, consider it invalid/expired
        }
    }

    public getToken(): string | null {
        return localStorage.getItem('admin_token');
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

    logout(): void {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
        this.currentUserSubject.next(null);
        // Optionally call backend logout endpoint here
    }

    private loadUserFromStorage(): void {
        const userJson = localStorage.getItem('admin_user');
        if (userJson) {
            this.currentUserSubject.next(JSON.parse(userJson));
        }
    }
}
