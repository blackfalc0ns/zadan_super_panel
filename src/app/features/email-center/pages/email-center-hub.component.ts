import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { buildSafeApiErrorLog, describeApiError } from '@shared/utils/api-error.util';
import { finalize } from 'rxjs';
import { EmailWorkflowRule } from '../models/email-center.models';
import { EmailCenterStoreService } from '../services/email-center-store.service';
import { EmailRulesListComponent } from '../components/email-rules-list/email-rules-list.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-email-center-hub',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    AppPageHeaderComponent,
    EmailRulesListComponent
  ],
  templateUrl: './email-center-hub.component.html',
  styleUrl: './email-center-hub.component.scss'
})
export class EmailCenterHubComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(EmailCenterStoreService);

  rules: EmailWorkflowRule[] = [];
  isLoading = true;
  pageError = '';

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.loadOverview();
  }

  get liveRules(): EmailWorkflowRule[] {
    return this.rules.filter((rule) => rule.automationState === 'live');
  }

  openHistory(): void {
    this.router.navigate(['/email-center/history']);
  }

  private loadOverview(): void {
    this.isLoading = true;
    this.pageError = '';

    this.store.loadOverview().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (overview) => {
        this.rules = overview.rules;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load email center overview', buildSafeApiErrorLog(error));
        this.pageError = describeApiError(error, this.translate, {
          fallbackKey: 'COMMON.API_ERRORS.UNKNOWN'
        });
        this.cdr.markForCheck();
      }
    });
  }
}
