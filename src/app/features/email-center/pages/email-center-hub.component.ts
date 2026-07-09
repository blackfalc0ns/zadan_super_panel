import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DIRECTORY_AUDIENCE_LABELS,
  DirectoryAudienceType
} from '@admin-users/public-api';
import { AccessService } from '@core/services/access.service';
import { KpiCardsComponent, KPICard } from '@shared/components/ui/kpi-cards/kpi-cards.component';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { buildSafeApiErrorLog, describeApiError } from '@shared/utils/api-error.util';
import { finalize } from 'rxjs';
import { EmailCenterKpiSnapshot, EmailSenderProfile, EmailWorkflowRule } from '../models/email-center.models';
import { EmailCenterStoreService } from '../services/email-center-store.service';
import { EmailRulesListComponent } from '../components/email-rules-list/email-rules-list.component';
import { EmailSenderProfilesModalComponent } from '../components/email-sender-profiles-modal/email-sender-profiles-modal.component';

type EmailAudienceFilter = 'all' | DirectoryAudienceType;

const EMPTY_KPI: EmailCenterKpiSnapshot = {
  totalRules: 0,
  enabledRules: 0,
  senderProfiles: 0,
  directoryDrivenRules: 0,
  audienceCoverage: 0
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-email-center-hub',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    AppPageHeaderComponent,
    KpiCardsComponent,
    EmailRulesListComponent,
    EmailSenderProfilesModalComponent
  ],
  templateUrl: './email-center-hub.component.html',
  styleUrl: './email-center-hub.component.scss'
})
export class EmailCenterHubComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(EmailCenterStoreService);

  senderProfiles: EmailSenderProfile[] = [];
  rules: EmailWorkflowRule[] = [];
  kpiSnapshot: EmailCenterKpiSnapshot = { ...EMPTY_KPI };
  selectedAudience: EmailAudienceFilter = 'all';
  isLoading = true;
  pageError = '';
  showSenderProfilesModal = false;

  readonly audienceTabs: Array<{ value: EmailAudienceFilter; labelKey: string }> = [
    { value: 'all', labelKey: 'EMAIL_CENTER.AUDIENCE.ALL' },
    ...Object.entries(DIRECTORY_AUDIENCE_LABELS).map(([value, labelKey]) => ({
      value: value as DirectoryAudienceType,
      labelKey
    }))
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly accessService: AccessService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.selectedAudience = this.normalizeAudience(params.get('audience'));
      this.cdr.markForCheck();
    });

    this.loadOverview();
  }

  get kpiCards(): KPICard[] {
    return [
      {
        id: 'total-rules',
        title: 'EMAIL_CENTER.KPI.TOTAL_RULES',
        value: this.kpiSnapshot.totalRules,
        icon: '<span class="material-symbols-outlined text-[20px]">notifications_active</span>',
        color: '#127c8c'
      },
      {
        id: 'enabled-rules',
        title: 'EMAIL_CENTER.KPI.ENABLED',
        value: this.kpiSnapshot.enabledRules,
        icon: '<span class="material-symbols-outlined text-[20px]">toggle_on</span>',
        color: '#10b981'
      },
      {
        id: 'sender-profiles',
        title: 'EMAIL_CENTER.KPI.SENDER_PROFILES',
        value: this.kpiSnapshot.senderProfiles,
        icon: '<span class="material-symbols-outlined text-[20px]">alternate_email</span>',
        color: '#2563eb'
      },
      {
        id: 'directory-rules',
        title: 'EMAIL_CENTER.KPI.DIRECTORY_DRIVEN',
        value: this.kpiSnapshot.directoryDrivenRules,
        icon: '<span class="material-symbols-outlined text-[20px]">hub</span>',
        color: '#f59e0b'
      },
      {
        id: 'audience-coverage',
        title: 'EMAIL_CENTER.KPI.AUDIENCE_COVERAGE',
        value: this.kpiSnapshot.audienceCoverage,
        icon: '<span class="material-symbols-outlined text-[20px]">groups</span>',
        color: '#0f766e'
      }
    ];
  }

  get filteredRules(): EmailWorkflowRule[] {
    return this.selectedAudience === 'all'
      ? this.rules
      : this.rules.filter((rule) => rule.audienceType === this.selectedAudience);
  }

  get canEdit(): boolean {
    return this.accessService.hasPermission('email_center.edit');
  }

  setAudience(audience: EmailAudienceFilter): void {
    this.selectedAudience = audience;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { audience: audience === 'all' ? null : audience },
      queryParamsHandling: 'merge'
    });
  }

  openAccessDirectory(): void {
    this.router.navigate(['/admin-users'], {
      queryParams: this.selectedAudience === 'all' ? {} : { audience: this.selectedAudience }
    });
  }

  openHistory(): void {
    this.router.navigate(['/email-center/history']);
  }

  openSenderProfiles(): void {
    this.showSenderProfilesModal = true;
  }

  closeSenderProfiles(): void {
    this.showSenderProfilesModal = false;
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
        this.senderProfiles = overview.senderProfiles;
        this.rules = overview.rules;
        this.kpiSnapshot = overview.kpi;
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

  private normalizeAudience(value: string | null): EmailAudienceFilter {
    if (value === 'super_admin' || value === 'vendor_network' || value === 'drivers' || value === 'customers') {
      return value;
    }

    return 'all';
  }
}
