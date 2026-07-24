import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PlatformContactSettings, PlatformContactSettingsPayload } from '@marketing/models/marketing.models';
import { MarketingApiService } from '@marketing/services/marketing.api.service';
import { describeApiError } from '@marketing/utils/marketing-date.utils';
import { ToastService } from '@shared/services/toast.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-marketing-contact-social',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="text-[16px] font-black text-slate-900">{{ 'MARKETING.CONTACT_SOCIAL.TITLE' | translate }}</h3>
          <p class="mt-1 max-w-2xl text-[13px] font-medium text-slate-500">
            {{ 'MARKETING.CONTACT_SOCIAL.DESCRIPTION' | translate }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            (click)="load()"
            [disabled]="isLoading || isSaving"
            class="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[12px] font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60">
            <span class="material-symbols-outlined text-[18px]">refresh</span>
            {{ 'MARKETING.ACTIONS.REFRESH' | translate }}
          </button>
          <button
            type="button"
            (click)="save()"
            [disabled]="isLoading || isSaving"
            class="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-5 text-[12px] font-black text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60">
            <span class="material-symbols-outlined text-[18px]">{{ isSaving ? 'hourglass_empty' : 'save' }}</span>
            {{ (isSaving ? 'MARKETING.ACTIONS.SAVING' : 'MARKETING.ACTIONS.SAVE_CHANGES') | translate }}
          </button>
        </div>
      </div>

      <div *ngIf="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-700">
        {{ errorMessage }}
      </div>

      <div *ngIf="isLoading" class="grid gap-4 md:grid-cols-2">
        <div *ngFor="let item of [1,2,3,4,5,6]" class="h-20 animate-pulse rounded-2xl bg-slate-100"></div>
      </div>

      <form *ngIf="!isLoading" class="grid gap-6" (ngSubmit)="save()">
        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
              <span class="material-symbols-outlined text-[22px]">support_agent</span>
            </div>
            <div>
              <h4 class="text-[15px] font-black text-slate-950">{{ 'MARKETING.CONTACT_SOCIAL.SUPPORT_TITLE' | translate }}</h4>
              <p class="mt-1 text-[12px] font-medium text-slate-500">{{ 'MARKETING.CONTACT_SOCIAL.SUPPORT_DESC' | translate }}</p>
            </div>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <label class="flex flex-col gap-2">
              <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ 'MARKETING.CONTACT_SOCIAL.SUPPORT_EMAIL' | translate }}</span>
              <input
                [(ngModel)]="form.supportEmail"
                name="supportEmail"
                type="email"
                dir="ltr"
                class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                [placeholder]="'MARKETING.CONTACT_SOCIAL.SUPPORT_EMAIL_PLACEHOLDER' | translate" />
            </label>

            <label class="flex flex-col gap-2">
              <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ 'MARKETING.CONTACT_SOCIAL.SUPPORT_PHONE' | translate }}</span>
              <input
                [(ngModel)]="form.supportPhone"
                name="supportPhone"
                type="tel"
                dir="ltr"
                class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                [placeholder]="'MARKETING.CONTACT_SOCIAL.SUPPORT_PHONE_PLACEHOLDER' | translate" />
            </label>
          </div>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-700">
              <span class="material-symbols-outlined text-[22px]">share</span>
            </div>
            <div>
              <h4 class="text-[15px] font-black text-slate-950">{{ 'MARKETING.CONTACT_SOCIAL.SOCIAL_TITLE' | translate }}</h4>
              <p class="mt-1 text-[12px] font-medium text-slate-500">{{ 'MARKETING.CONTACT_SOCIAL.SOCIAL_DESC' | translate }}</p>
            </div>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <label *ngFor="let field of socialFields" class="flex flex-col gap-2">
              <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ field.labelKey | translate }}</span>
              <input
                [(ngModel)]="form[field.key]"
                [name]="field.key"
                type="url"
                dir="ltr"
                class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                [placeholder]="'MARKETING.COMMON.PLACEHOLDERS.URL' | translate" />
            </label>
          </div>
        </section>

        <aside *ngIf="updatedAtUtc" class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-bold text-slate-600">
          {{ 'MARKETING.CONTACT_SOCIAL.LAST_UPDATED' | translate }}:
          <span class="text-slate-900" dir="ltr">{{ updatedAtUtc | date:'medium' }}</span>
        </aside>
      </form>
    </div>
  `
})
export class MarketingContactSocialComponent implements OnInit {
  private readonly api = inject(MarketingApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;
  updatedAtUtc: string | null = null;

  form: PlatformContactSettingsPayload = this.emptyForm();

  readonly socialFields: Array<{ key: keyof PlatformContactSettingsPayload; labelKey: string }> = [
    { key: 'whatsAppUrl', labelKey: 'MARKETING.CONTACT_SOCIAL.WHATSAPP' },
    { key: 'instagramUrl', labelKey: 'MARKETING.CONTACT_SOCIAL.INSTAGRAM' },
    { key: 'twitterUrl', labelKey: 'MARKETING.CONTACT_SOCIAL.TWITTER' },
    { key: 'tikTokUrl', labelKey: 'MARKETING.CONTACT_SOCIAL.TIKTOK' },
    { key: 'snapchatUrl', labelKey: 'MARKETING.CONTACT_SOCIAL.SNAPCHAT' },
    { key: 'facebookUrl', labelKey: 'MARKETING.CONTACT_SOCIAL.FACEBOOK' },
    { key: 'youTubeUrl', labelKey: 'MARKETING.CONTACT_SOCIAL.YOUTUBE' },
    { key: 'linkedInUrl', labelKey: 'MARKETING.CONTACT_SOCIAL.LINKEDIN' }
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.api.getPlatformContact().subscribe({
      next: (settings) => {
        this.applySettings(settings);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = describeApiError(error);
        this.cdr.markForCheck();
      }
    });
  }

  save(): void {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.api.upsertPlatformContact(this.normalizePayload(this.form)).subscribe({
      next: (settings) => {
        this.applySettings(settings);
        this.isSaving = false;
        this.toast.success(this.translate.instant('MARKETING.CONTACT_SOCIAL.SAVE_SUCCESS'));
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = describeApiError(error);
        this.cdr.markForCheck();
      }
    });
  }

  private applySettings(settings: PlatformContactSettings): void {
    this.form = {
      supportEmail: settings.supportEmail ?? '',
      supportPhone: settings.supportPhone ?? '',
      whatsAppUrl: settings.whatsAppUrl ?? '',
      instagramUrl: settings.instagramUrl ?? '',
      twitterUrl: settings.twitterUrl ?? '',
      tikTokUrl: settings.tikTokUrl ?? '',
      snapchatUrl: settings.snapchatUrl ?? '',
      facebookUrl: settings.facebookUrl ?? '',
      youTubeUrl: settings.youTubeUrl ?? '',
      linkedInUrl: settings.linkedInUrl ?? ''
    };
    this.updatedAtUtc = settings.updatedAtUtc ?? null;
  }

  private normalizePayload(form: PlatformContactSettingsPayload): PlatformContactSettingsPayload {
    const trimOrNull = (value: string | null | undefined): string | null => {
      const trimmed = (value ?? '').trim();
      return trimmed.length ? trimmed : null;
    };

    return {
      supportEmail: trimOrNull(form.supportEmail),
      supportPhone: trimOrNull(form.supportPhone),
      whatsAppUrl: trimOrNull(form.whatsAppUrl),
      instagramUrl: trimOrNull(form.instagramUrl),
      twitterUrl: trimOrNull(form.twitterUrl),
      tikTokUrl: trimOrNull(form.tikTokUrl),
      snapchatUrl: trimOrNull(form.snapchatUrl),
      facebookUrl: trimOrNull(form.facebookUrl),
      youTubeUrl: trimOrNull(form.youTubeUrl),
      linkedInUrl: trimOrNull(form.linkedInUrl)
    };
  }

  private emptyForm(): PlatformContactSettingsPayload {
    return {
      supportEmail: '',
      supportPhone: '',
      whatsAppUrl: '',
      instagramUrl: '',
      twitterUrl: '',
      tikTokUrl: '',
      snapchatUrl: '',
      facebookUrl: '',
      youTubeUrl: '',
      linkedInUrl: ''
    };
  }
}
