import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AccessService } from '@core/services/access.service';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { ToastService } from '@shared/services/toast.service';
import { buildSafeApiErrorLog, describeApiError } from '@shared/utils/api-error.util';
import { Subject, catchError, debounceTime, finalize, of, switchMap } from 'rxjs';
import {
  EmailBranchOption,
  EmailBranchScopeMode,
  EmailResolvedRecipients,
  EmailScopeOption,
  EmailSenderProfile,
  EmailTestSendResult,
  EmailWorkflowRule
} from '../models/email-center.models';
import { EmailCenterApiService } from '../services/email-center.service';
import { EmailCenterStoreService } from '../services/email-center-store.service';
import { EmailRuleConfigComponent } from '../components/email-rule-config/email-rule-config.component';

const EMPTY_RECIPIENTS: EmailResolvedRecipients = {
  to: [],
  cc: [],
  bcc: [],
  warnings: []
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-email-center-rule-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    AppPageHeaderComponent,
    EmailRuleConfigComponent
  ],
  templateUrl: './email-center-rule-detail.component.html',
  styleUrl: './email-center-rule-detail.component.scss'
})
export class EmailCenterRuleDetailComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(EmailCenterStoreService);
  private readonly resolvePreview$ = new Subject<void>();

  rule: EmailWorkflowRule | null = null;
  senderProfiles: EmailSenderProfile[] = [];
  vendorOptions: EmailScopeOption[] = [];
  branchDirectory: EmailBranchOption[] = [];
  resolvedRecipients: EmailResolvedRecipients = { ...EMPTY_RECIPIENTS };
  lastTestSendResult: EmailTestSendResult | null = null;
  isLoading = true;
  isSaving = false;
  isResolvingRecipients = false;
  isTestingSend = false;
  pageError = '';
  ruleId = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly accessService: AccessService,
    private readonly toastService: ToastService,
    private readonly emailCenterApi: EmailCenterApiService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.ruleId = params.get('ruleId') ?? '';
      this.loadRuleContext();
    });

    this.resolvePreview$.pipe(
      debounceTime(350),
      switchMap(() => {
        if (!this.rule) {
          return of({ ...EMPTY_RECIPIENTS });
        }

        this.isResolvingRecipients = true;
        this.cdr.markForCheck();

        return this.emailCenterApi.resolveRecipients(this.rule).pipe(
          catchError((error) =>
            of({
              ...EMPTY_RECIPIENTS,
              warnings: [describeApiError(error, this.translate, { fallbackKey: 'COMMON.API_ERRORS.UNKNOWN' })]
            })
          ),
          finalize(() => {
            this.isResolvingRecipients = false;
            this.cdr.markForCheck();
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((resolved) => {
      this.resolvedRecipients = resolved;
      this.cdr.markForCheck();
    });
  }

  get canEdit(): boolean {
    return this.accessService.hasPermission('email_center.edit');
  }

  get ruleTitle(): string {
    if (!this.rule) {
      return '';
    }

    const translated = this.translate.instant(this.rule.titleKey);
    return translated !== this.rule.titleKey ? translated : this.rule.id;
  }

  backToHub(): void {
    this.router.navigate(['/email-center']);
  }

  saveRule(): void {
    if (!this.canEdit || !this.rule) {
      return;
    }

    this.isSaving = true;
    this.emailCenterApi.updateRule(this.rule).pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.markForCheck();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (saved) => {
        this.rule = structuredClone(saved);
        this.store.upsertRule(saved);
        this.scheduleRecipientResolution();
        this.toastService.success(
          this.translate.instant('EMAIL_CENTER.MESSAGES.SAVE_SUCCESS'),
          this.translate.instant('EMAIL_CENTER.TITLE')
        );
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.toastService.error(
          describeApiError(error, this.translate, { fallbackKey: 'COMMON.API_ERRORS.UNKNOWN' }),
          this.translate.instant('EMAIL_CENTER.TITLE')
        );
      }
    });
  }

  testSendRule(): void {
    if (!this.canEdit || !this.rule) {
      return;
    }

    this.isTestingSend = true;
    this.emailCenterApi.testSend(this.rule).pipe(
      finalize(() => {
        this.isTestingSend = false;
        this.cdr.markForCheck();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (result) => {
        this.lastTestSendResult = result;
        if (this.rule) {
          this.rule = {
            ...this.rule,
            lastDispatch: {
              status: result.status,
              source: 'test_send',
              createdAtUtc: result.createdAtUtc,
              failureReason: result.failureReason
            }
          };
          this.store.upsertRule(this.rule);
        }

        const title = this.translate.instant('EMAIL_CENTER.TITLE');
        if (result.status === 'sent') {
          this.toastService.success(this.translate.instant('EMAIL_CENTER.MESSAGES.TEST_SEND_SUCCESS'), title);
        } else if (result.status === 'skipped') {
          this.toastService.warning(result.failureReason ?? 'Skipped', title);
        } else {
          this.toastService.error(result.failureReason ?? 'Failed', title);
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.toastService.error(
          describeApiError(error, this.translate, { fallbackKey: 'COMMON.API_ERRORS.UNKNOWN' }),
          this.translate.instant('EMAIL_CENTER.TITLE')
        );
      }
    });
  }

  onRuleDraftChanged(): void {
    this.scheduleRecipientResolution();
  }

  onVendorChange(vendorId: string | null): void {
    if (!this.canEdit || !this.rule) {
      return;
    }

    this.rule.entityScope.vendorId = vendorId || null;
    if (!vendorId) {
      this.rule.entityScope.branchId = null;
    }
    this.scheduleRecipientResolution();
  }

  onBranchScopeModeChange(branchScopeMode: EmailBranchScopeMode): void {
    if (!this.canEdit || !this.rule) {
      return;
    }

    this.rule.branchScopeMode = branchScopeMode;
    if (branchScopeMode !== 'specific_branch') {
      this.rule.entityScope.branchId = null;
    }
    this.scheduleRecipientResolution();
  }

  private loadRuleContext(): void {
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
        const found = overview.rules.find((entry) => entry.id === this.ruleId);
        if (!found) {
          this.pageError = this.translate.instant('EMAIL_CENTER.RULE_NOT_FOUND');
          this.rule = null;
          this.cdr.markForCheck();
          return;
        }

        this.rule = structuredClone(found);
        this.senderProfiles = overview.senderProfiles;
        this.vendorOptions = overview.vendors;
        this.branchDirectory = overview.branches;
        this.applyQueryScope();
        this.scheduleRecipientResolution();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load email rule', buildSafeApiErrorLog(error));
        this.pageError = describeApiError(error, this.translate, {
          fallbackKey: 'COMMON.API_ERRORS.UNKNOWN'
        });
        this.cdr.markForCheck();
      }
    });
  }

  private applyQueryScope(): void {
    if (!this.rule) {
      return;
    }

    const vendorId = this.route.snapshot.queryParamMap.get('vendor');
    const entityId = this.route.snapshot.queryParamMap.get('entityId');

    if (vendorId) {
      this.rule.entityScope.vendorId = vendorId;
    }

    if (entityId) {
      this.rule.entityScope.entityId = entityId;
    }
  }

  private scheduleRecipientResolution(): void {
    this.resolvePreview$.next();
  }
}
