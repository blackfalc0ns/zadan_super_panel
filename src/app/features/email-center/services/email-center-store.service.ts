import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import {
  EmailCenterOverview,
  EmailWorkflowRule
} from '../models/email-center.models';
import { EmailCenterApiService } from './email-center.service';

@Injectable({ providedIn: 'root' })
export class EmailCenterStoreService {
  private readonly overviewSubject = new BehaviorSubject<EmailCenterOverview | null>(null);

  readonly overview$ = this.overviewSubject.asObservable();

  constructor(private readonly emailCenterApi: EmailCenterApiService) {}

  get snapshot(): EmailCenterOverview | null {
    return this.overviewSubject.value;
  }

  loadOverview(force = false): Observable<EmailCenterOverview> {
    const cached = this.overviewSubject.value;
    if (!force && cached) {
      return of(cached);
    }

    return this.emailCenterApi.getOverview().pipe(
      tap((overview) => this.overviewSubject.next(overview))
    );
  }

  getRule(ruleId: string): EmailWorkflowRule | undefined {
    return this.overviewSubject.value?.rules.find((rule) => rule.id === ruleId);
  }

  upsertRule(rule: EmailWorkflowRule): void {
    const current = this.overviewSubject.value;
    if (!current) {
      return;
    }

    this.overviewSubject.next({
      ...current,
      rules: current.rules.map((entry) => entry.id === rule.id ? rule : entry)
    });
  }

  patchOverview(partial: Partial<EmailCenterOverview>): void {
    const current = this.overviewSubject.value;
    if (!current) {
      return;
    }

    this.overviewSubject.next({ ...current, ...partial });
  }
}
