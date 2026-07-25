import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  PlatformLegalDocument,
  PlatformLegalDocumentPayload,
  PlatformLegalDocumentType
} from '@marketing/models/marketing.models';
import { MarketingApiService } from '@marketing/services/marketing.api.service';
import { describeApiError } from '@marketing/utils/marketing-date.utils';
import { ToastService } from '@shared/services/toast.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-marketing-legal-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="text-[16px] font-black text-slate-900">{{ 'MARKETING.LEGAL_DOCUMENTS.TITLE' | translate }}</h3>
          <p class="mt-1 max-w-3xl text-[13px] font-medium text-slate-500">
            {{ 'MARKETING.LEGAL_DOCUMENTS.DESCRIPTION' | translate }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            (click)="loadSelected()"
            [disabled]="isLoading || isSaving"
            class="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[12px] font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60">
            <span class="material-symbols-outlined text-[18px]">refresh</span>
            {{ 'MARKETING.ACTIONS.REFRESH' | translate }}
          </button>
          <button
            type="button"
            (click)="save()"
            [disabled]="isLoading || isSaving || !selectedType"
            class="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-5 text-[12px] font-black text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60">
            <span class="material-symbols-outlined text-[18px]">{{ isSaving ? 'hourglass_empty' : 'save' }}</span>
            {{ (isSaving ? 'MARKETING.ACTIONS.SAVING' : 'MARKETING.ACTIONS.SAVE_CHANGES') | translate }}
          </button>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          *ngFor="let type of documentTypes"
          type="button"
          (click)="selectType(type)"
          class="rounded-2xl border px-3.5 py-2 text-[12px] font-black transition"
          [ngClass]="selectedType === type
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'">
          {{ 'MARKETING.LEGAL_DOCUMENTS.TYPES.' + type | translate }}
        </button>
      </div>

      <div *ngIf="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-700">
        {{ errorMessage }}
      </div>

      <div *ngIf="isLoading" class="grid gap-4">
        <div class="h-20 animate-pulse rounded-2xl bg-slate-100"></div>
        <div class="h-64 animate-pulse rounded-2xl bg-slate-100"></div>
      </div>

      <form *ngIf="!isLoading && selectedType" class="grid gap-6" (ngSubmit)="save()">
        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-700">
              <span class="material-symbols-outlined text-[22px]">gavel</span>
            </div>
            <div>
              <h4 class="text-[15px] font-black text-slate-950">{{ 'MARKETING.LEGAL_DOCUMENTS.META_TITLE' | translate }}</h4>
              <p class="mt-1 text-[12px] font-medium text-slate-500">{{ 'MARKETING.LEGAL_DOCUMENTS.META_DESC' | translate }}</p>
            </div>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <label class="flex flex-col gap-2">
              <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ 'MARKETING.LEGAL_DOCUMENTS.VERSION' | translate }}</span>
              <input
                [(ngModel)]="form.version"
                name="version"
                dir="ltr"
                class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                placeholder="1.0" />
            </label>

            <label class="flex flex-col gap-2">
              <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">{{ 'MARKETING.LEGAL_DOCUMENTS.EFFECTIVE_AT' | translate }}</span>
              <input
                [(ngModel)]="effectiveDateInput"
                name="effectiveAt"
                type="date"
                dir="ltr"
                class="h-12 rounded-2xl border border-slate-200 px-4 text-[14px] font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" />
            </label>
          </div>

          <p *ngIf="updatedAtUtc" class="mt-4 text-[12px] font-bold text-slate-500">
            {{ 'MARKETING.LEGAL_DOCUMENTS.LAST_UPDATED' | translate }}:
            <span class="text-slate-900" dir="ltr">{{ updatedAtUtc | date:'medium' }}</span>
          </p>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" dir="rtl">
          <div class="mb-4 text-right">
            <h4 class="text-[15px] font-black text-slate-950">{{ 'MARKETING.LEGAL_DOCUMENTS.CONTENT_AR' | translate }}</h4>
            <p class="mt-1 text-[12px] font-medium text-slate-500">{{ 'MARKETING.LEGAL_DOCUMENTS.MARKDOWN_HINT_AR' | translate }}</p>
          </div>
          <textarea
            [(ngModel)]="form.contentAr"
            name="contentAr"
            rows="16"
            dir="rtl"
            lang="ar"
            class="w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 font-mono text-[13px] font-medium leading-relaxed text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            style="direction: rtl; text-align: right; unicode-bidi: plaintext;"></textarea>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" dir="ltr">
          <div class="mb-4 text-left">
            <h4 class="text-[15px] font-black text-slate-950">{{ 'MARKETING.LEGAL_DOCUMENTS.CONTENT_EN' | translate }}</h4>
            <p class="mt-1 text-[12px] font-medium text-slate-500">{{ 'MARKETING.LEGAL_DOCUMENTS.MARKDOWN_HINT_EN' | translate }}</p>
          </div>
          <textarea
            [(ngModel)]="form.contentEn"
            name="contentEn"
            rows="16"
            dir="ltr"
            lang="en"
            class="w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 font-mono text-[13px] font-medium leading-relaxed text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            style="direction: ltr; text-align: left; unicode-bidi: plaintext;"></textarea>
        </section>
      </form>
    </div>
  `
})
export class MarketingLegalDocumentsComponent implements OnInit {
  private readonly api = inject(MarketingApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly documentTypes: PlatformLegalDocumentType[] = [
    'CustomerTerms',
    'CustomerPrivacy',
    'DriverTerms',
    'DriverPrivacy',
    'VendorTerms',
    'VendorPrivacy'
  ];

  selectedType: PlatformLegalDocumentType = 'CustomerTerms';
  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;
  updatedAtUtc: string | null = null;
  effectiveDateInput = '';
  form: PlatformLegalDocumentPayload = this.emptyForm();

  ngOnInit(): void {
    this.loadSelected();
  }

  selectType(type: PlatformLegalDocumentType): void {
    if (this.selectedType === type || this.isSaving) {
      return;
    }
    this.selectedType = type;
    this.loadSelected();
  }

  loadSelected(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.api.getLegalDocument(this.selectedType).subscribe({
      next: (document) => {
        this.applyDocument(document);
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

    const payload: PlatformLegalDocumentPayload = {
      contentAr: this.form.contentAr ?? '',
      contentEn: this.form.contentEn ?? '',
      version: (this.form.version ?? '1.0').trim() || '1.0',
      effectiveAtUtc: this.effectiveDateInput
        ? new Date(`${this.effectiveDateInput}T00:00:00.000Z`).toISOString()
        : null
    };

    this.api.upsertLegalDocument(this.selectedType, payload).subscribe({
      next: (document) => {
        this.applyDocument(document);
        this.isSaving = false;
        this.toast.success(this.translate.instant('MARKETING.LEGAL_DOCUMENTS.SAVE_SUCCESS'));
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = describeApiError(error);
        this.cdr.markForCheck();
      }
    });
  }

  private applyDocument(document: PlatformLegalDocument): void {
    this.form = {
      contentAr: document.contentAr ?? '',
      contentEn: document.contentEn ?? '',
      version: document.version ?? '1.0',
      effectiveAtUtc: document.effectiveAtUtc
    };
    this.updatedAtUtc = document.updatedAtUtc ?? null;
    this.effectiveDateInput = this.toDateInput(document.effectiveAtUtc);
  }

  private toDateInput(value?: string | null): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().slice(0, 10);
  }

  private emptyForm(): PlatformLegalDocumentPayload {
    return {
      contentAr: '',
      contentEn: '',
      version: '1.0',
      effectiveAtUtc: null
    };
  }
}
