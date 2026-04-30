import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AdminUnreadCountResponse {
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminNotificationsService {
  private readonly apiUrl = `${environment.apiUrl}/admin/notifications`;

  constructor(private readonly http: HttpClient) {}

  getUnreadCount(): Observable<number> {
    if (environment.skipAuthForDevelopment) {
      return of(0);
    }

    return this.http.get<AdminUnreadCountResponse>(`${this.apiUrl}/unread-count`).pipe(
      map((response) => Math.max(0, response.count || 0)),
      catchError(() => of(0))
    );
  }
}
