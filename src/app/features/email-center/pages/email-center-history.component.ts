import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { ToastService } from '@shared/services/toast.service';
import { buildSafeApiErrorLog, describeApiError } from '@shared/utils/api-error.util';
import { finalize } from 'rxjs';
import { EmailDispatchFilters, EmailDispatchLog, EmailWorkflowRule } from '../models/email-center.models';
import { EmailCenterApiService } from '../services/email-center.service';
import { EmailCenterStoreService } from '../services/email-center-store.service';
import { EmailDispatchHistoryComponent } from '../components/email-dispatch-history/email-dispatch-history.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-email-center-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    AppPageHeaderComponent,
    EmailDispatchHistoryComponent
  ],
  templateUrl: './email-center-history.component.html',
  styleUrl: './email-center-history.component.scss'
})
export class EmailCenterHistoryComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(EmailCenterStoreService);

  rules: EmailWorkflowRule[] = [];
  dispatches: EmailDispatchLog[] = [];
  isLoading = true;
  isHistoryLoading = false;
  pageError = '';

  historyFilters: EmailDispatchFilters = {
    ruleId: null,
    source: null,
    status: null,
    dateFrom: null,
    dateTo: null
  };

  constructor(
    private readonly router: Router,
    private readonly toastService: ToastService,
    private readonly emailCenterApi: EmailCenterApiService
  ) {}

  ngOnInit(): void {
    this.store.loadOverview().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (overview) => {
        this.rules = overview.rules;
        this.loadDispatchHistory();
      },
      error: (error) => {
        this.pageError = describeApiError(error, this.translate, {
          fallbackKey: 'COMMON.API_ERRORS.UNKNOWN'
        });
        console.error('Failed to load email center history context', buildSafeApiErrorLog(error));
        this.cdr.markForCheck();
      }
    });
  }

  backToHub(): void {
    this.router.navigate(['/email-center']);
  }

  onHistoryFiltersChange(filters: EmailDispatchFilters): void {
    this.historyFilters = filters;
    this.loadDispatchHistory();
  }

  clearHistoryFilters(): void {
    this.historyFilters = {
      ruleId: null,
      source: null,
      status: null,
      dateFrom: null,
      dateTo: null
    };
    this.loadDispatchHistory();
  }

  private loadDispatchHistory(): void {
    this.isHistoryLoading = true;

    this.emailCenterApi.getDispatches(this.historyFilters).pipe(
      finalize(() => {
        this.isHistoryLoading = false;
        this.cdr.markForCheck();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (dispatches) => {
        this.dispatches = dispatches;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.dispatches = [];
        this.toastService.error(
          describeApiError(error, this.translate, { fallbackKey: 'COMMON.API_ERRORS.UNKNOWN' }),
          this.translate.instant('EMAIL_CENTER.HISTORY.BADGE')
        );
        this.cdr.markForCheck();
      }
    });
  }
}
