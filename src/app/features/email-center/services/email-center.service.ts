import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthService } from '@core/services/auth.service';
import {
  EmailCenterOverview,
  EmailDispatchFilters,
  EmailDispatchLog,
  EmailResolvedRecipients,
  EmailTemplateRenderResult,
  EmailTestSendResult,
  EmailWorkflowRule
} from '../models/email-center.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailCenterApiService {
  private readonly apiUrl = `${environment.apiUrl}/admin/email-center`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  getOverview(): Observable<EmailCenterOverview> {
    return this.http.get<EmailCenterOverview>(`${this.apiUrl}/overview`, {
      headers: this.getHeaders()
    });
  }

  updateRule(rule: EmailWorkflowRule): Observable<EmailWorkflowRule> {
    return this.http.put<EmailWorkflowRule>(`${this.apiUrl}/rules/${encodeURIComponent(rule.id)}`, rule, {
      headers: this.getHeaders()
    });
  }

  resolveRecipients(rule: EmailWorkflowRule): Observable<EmailResolvedRecipients> {
    return this.http.post<EmailResolvedRecipients>(
      `${this.apiUrl}/rules/${encodeURIComponent(rule.id)}/resolve-recipients`,
      rule,
      { headers: this.getHeaders() }
    );
  }

  testSend(rule: EmailWorkflowRule): Observable<EmailTestSendResult> {
    return this.http.post<EmailTestSendResult>(
      `${this.apiUrl}/rules/${encodeURIComponent(rule.id)}/test-send`,
      rule,
      { headers: this.getHeaders() }
    );
  }

  previewTemplate(
    rule: EmailWorkflowRule,
    options?: { useSampleValues?: boolean; targetUrl?: string | null }
  ): Observable<EmailTemplateRenderResult> {
    let params = new HttpParams();

    if (options?.useSampleValues === false) {
      params = params.set('useSampleValues', 'false');
    }

    if (options?.targetUrl) {
      params = params.set('targetUrl', options.targetUrl);
    }

    return this.http.post<EmailTemplateRenderResult>(
      `${this.apiUrl}/rules/${encodeURIComponent(rule.id)}/preview-template`,
      rule,
      {
        headers: this.getHeaders(),
        params
      }
    );
  }

  getDispatches(filters: EmailDispatchFilters): Observable<EmailDispatchLog[]> {
    let params = new HttpParams();

    if (filters.ruleId) {
      params = params.set('ruleId', filters.ruleId);
    }

    if (filters.source) {
      params = params.set('source', filters.source);
    }

    if (filters.status) {
      params = params.set('status', filters.status);
    }

    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }

    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }

    return this.http.get<EmailDispatchLog[]>(`${this.apiUrl}/dispatches`, {
      headers: this.getHeaders(),
      params
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }
}
