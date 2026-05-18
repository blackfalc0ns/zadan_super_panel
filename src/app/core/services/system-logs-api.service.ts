import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PagedResultDto<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface SystemLogEntryDto {
  id: string;
  occurredAtUtc: string;
  sourceApp: string;
  module: string;
  action: string;
  summary: string;
  requestPath: string;
  httpMethod: string;
  statusCode: number;
  isSuccess: boolean;
  actorUserId: string | null;
  actorFullName: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  targetEntityType: string | null;
  targetEntityId: string | null;
  correlationId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  queryString: string | null;
  requestPayloadJson: string | null;
  metadataJson: string | null;
  errorMessage: string | null;
}

export interface SystemLogsQuery {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sourceApp?: string;
  module?: string;
  isSuccess?: boolean | '';
  fromUtc?: string;
  toUtc?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SystemLogsApiService {
  private readonly baseUrl = `${environment.apiUrl}/admin/system/logs`;

  constructor(private readonly http: HttpClient) {}

  getLogs(query: SystemLogsQuery = {}): Observable<PagedResultDto<SystemLogEntryDto>> {
    const params = this.buildParams(query);
    return this.http.get<PagedResultDto<SystemLogEntryDto>>(this.baseUrl, { params });
  }

  exportCsv(query: SystemLogsQuery = {}): Observable<Blob> {
    const params = this.buildParams(query);
    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  private buildParams(query: SystemLogsQuery): Record<string, string> {
    return Object.fromEntries(
      Object.entries(query)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    );
  }
}
