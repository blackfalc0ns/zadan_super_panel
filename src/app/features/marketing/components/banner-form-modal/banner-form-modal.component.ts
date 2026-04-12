import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MarketingBanner, MarketingBannerUpdatePayload } from '@marketing/models/marketing.models';
import { MarketingApiService } from '@marketing/services/marketing.api.service';
import { toDateTimeLocalInput, toNullableUtcIso } from '@marketing/utils/marketing-date.utils';
import { AppButtonComponent } from '@shared/components/ui/button/button.component';
import { AppInputComponent } from '@shared/components/ui/form-controls/input/input.component';
import { ModalShellComponent } from '@shared/components/ui/modal-shell/modal-shell.component';

@Component({
  selector: 'app-banner-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ModalShellComponent,
    AppInputComponent,
    AppButtonComponent
  ],
  template: `
    <app-modal-shell
      *ngIf="isOpen"
      [title]="banner ? 'MARKETING.BANNERS.MODAL.EDIT_TITLE' : 'MARKETING.BANNERS.MODAL.CREATE_TITLE'"
      [subtitle]="'MARKETING.BANNERS.MODAL.SUBTITLE'"
      [icon]="'ad'"
      [maxWidthClass]="'max-w-5xl'"
      (close)="close.emit()"
    >
      <form [formGroup]="form" modal-body class="space-y-6" (ngSubmit)="submit()">
        <div class="grid gap-4 md:grid-cols-2">
          <app-input formControlName="tagAr" label="MARKETING.BANNERS.FIELDS.TAG_AR" placeholder="MARKETING.BANNERS.PLACEHOLDERS.TAG" [isRequired]="true"></app-input>
          <app-input formControlName="tagEn" label="MARKETING.BANNERS.FIELDS.TAG_EN" placeholder="MARKETING.BANNERS.PLACEHOLDERS.TAG" [isRequired]="true"></app-input>
          <app-input formControlName="titleAr" label="MARKETING.BANNERS.FIELDS.TITLE_AR" placeholder="MARKETING.BANNERS.PLACEHOLDERS.TITLE_AR" [isRequired]="true"></app-input>
          <app-input formControlName="titleEn" label="MARKETING.BANNERS.FIELDS.TITLE_EN" placeholder="MARKETING.BANNERS.PLACEHOLDERS.TITLE_EN" [isRequired]="true"></app-input>
          <app-input formControlName="subtitleAr" label="MARKETING.BANNERS.FIELDS.SUBTITLE_AR" placeholder="MARKETING.BANNERS.PLACEHOLDERS.SUBTITLE_AR"></app-input>
          <app-input formControlName="subtitleEn" label="MARKETING.BANNERS.FIELDS.SUBTITLE_EN" placeholder="MARKETING.BANNERS.PLACEHOLDERS.SUBTITLE_EN"></app-input>
          <app-input formControlName="actionLabelAr" label="MARKETING.BANNERS.FIELDS.ACTION_AR" placeholder="MARKETING.BANNERS.PLACEHOLDERS.ACTION_AR"></app-input>
          <app-input formControlName="actionLabelEn" label="MARKETING.BANNERS.FIELDS.ACTION_EN" placeholder="MARKETING.BANNERS.PLACEHOLDERS.ACTION_EN"></app-input>
          <div class="md:col-span-2 space-y-4">
            <label class="form-label-base">
              {{ 'MARKETING.COMMON.FIELDS.IMAGE_URL' | translate }}
              <span class="text-red-500">*</span>
            </label>

            <div class="flex flex-col items-center rounded-[2rem] border border-slate-200 bg-slate-50/70 p-6">
              <div class="group relative">
                <div class="flex h-40 w-40 items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-slate-200 bg-white shadow-inner transition-all group-hover:border-zadna-primary group-hover:shadow-xl group-hover:shadow-zadna-primary/5">
                  <img
                    *ngIf="form.get('imageUrl')?.value"
                    [src]="form.get('imageUrl')?.value"
                    class="h-full w-full object-cover transition-transform group-hover:scale-105">

                  <div *ngIf="!form.get('imageUrl')?.value" class="flex flex-col items-center text-slate-300">
                    <svg class="mb-2 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-[10px] font-black uppercase tracking-widest">
                      {{ 'COMMON.UPLOAD' | translate }}
                    </span>
                  </div>

                  <label class="absolute inset-0 flex cursor-pointer items-center justify-center bg-zadna-primary/10 opacity-0 transition-opacity group-hover:opacity-100">
                    <span class="rounded-full border border-zadna-primary/20 bg-white px-3 py-1.5 text-[10px] font-black text-zadna-primary shadow-sm">
                      {{ (form.get('imageUrl')?.value ? 'COMMON.CHANGE' : 'COMMON.UPLOAD') | translate }}
                    </span>
                    <input type="file" class="hidden" accept="image/*" (change)="onFileSelected($event)">
                  </label>
                </div>

                <div *ngIf="isUploading" class="absolute inset-0 z-10 flex items-center justify-center rounded-[2rem] bg-white/80 backdrop-blur-sm">
                  <div class="h-8 w-8 animate-spin rounded-full border-2 border-zadna-primary border-t-transparent"></div>
                </div>
              </div>

              <p *ngIf="form.get('imageUrl')?.value" class="mt-4 max-w-full break-all text-center text-xs font-bold text-slate-500">
                {{ form.get('imageUrl')?.value }}
              </p>
            </div>
          </div>
          <app-input formControlName="displayOrder" type="number" label="COMMON.ORDER" placeholder="MARKETING.COMMON.PLACEHOLDERS.ORDER" [isRequired]="true"></app-input>
          <div class="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <label class="flex cursor-pointer items-center gap-3 text-sm font-bold text-slate-700">
              <input type="checkbox" formControlName="isActive" class="h-4 w-4 rounded border-slate-300 text-zadna-primary focus:ring-zadna-primary" />
              {{ 'MARKETING.BANNERS.FIELDS.IS_ACTIVE' | translate }}
            </label>
          </div>
          <app-input formControlName="startsAtUtc" type="datetime-local" label="MARKETING.COMMON.FIELDS.STARTS_AT" placeholder="" customClass="md:col-span-1"></app-input>
          <app-input formControlName="endsAtUtc" type="datetime-local" label="MARKETING.COMMON.FIELDS.ENDS_AT" placeholder="" customClass="md:col-span-1"></app-input>
        </div>

        <div *ngIf="submitAttempted && form.invalid" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          {{ 'MARKETING.BANNERS.MESSAGES.REQUIRED_FIELDS' | translate }}
        </div>
      </form>

      <div modal-footer class="flex items-center justify-end gap-3">
        <app-button variant="ghost" size="sm" (btnClick)="close.emit()">{{ 'COMMON.CANCEL' | translate }}</app-button>
        <app-button variant="primary" size="sm" [isLoading]="isSaving || isUploading" (btnClick)="submit()">
          {{ (banner ? 'MARKETING.ACTIONS.SAVE_CHANGES' : 'MARKETING.BANNERS.ACTIONS.CREATE') | translate }}
        </app-button>
      </div>
    </app-modal-shell>
  `
})
export class BannerFormModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSaving = false;
  @Input() banner: MarketingBanner | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<MarketingBannerUpdatePayload>();

  submitAttempted = false;
  isUploading = false;

  private readonly formBuilder = inject(FormBuilder);
  private readonly marketingApi = inject(MarketingApiService);

  readonly form = this.formBuilder.nonNullable.group({
    tagAr: ['', Validators.required],
    tagEn: ['', Validators.required],
    titleAr: ['', Validators.required],
    titleEn: ['', Validators.required],
    subtitleAr: [''],
    subtitleEn: [''],
    actionLabelAr: [''],
    actionLabelEn: [''],
    imageUrl: ['', Validators.required],
    displayOrder: ['0', Validators.required],
    startsAtUtc: [''],
    endsAtUtc: [''],
    isActive: true
  });

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen'] || changes['banner']) && this.isOpen) {
      this.submitAttempted = false;
      this.isUploading = false;
      const banner = this.banner;
      this.form.reset({
        tagAr: banner?.tagAr ?? '',
        tagEn: banner?.tagEn ?? '',
        titleAr: banner?.titleAr ?? '',
        titleEn: banner?.titleEn ?? '',
        subtitleAr: banner?.subtitleAr ?? '',
        subtitleEn: banner?.subtitleEn ?? '',
        actionLabelAr: banner?.actionLabelAr ?? '',
        actionLabelEn: banner?.actionLabelEn ?? '',
        imageUrl: banner?.imageUrl ?? '',
        displayOrder: String(banner?.displayOrder ?? 0),
        startsAtUtc: toDateTimeLocalInput(banner?.startsAtUtc),
        endsAtUtc: toDateTimeLocalInput(banner?.endsAtUtc),
        isActive: banner?.isActive ?? true
      });
    }
  }

  submit(): void {
    this.submitAttempted = true;
    if (this.form.invalid || this.isUploading) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.save.emit({
      tagAr: value.tagAr.trim(),
      tagEn: value.tagEn.trim(),
      titleAr: value.titleAr.trim(),
      titleEn: value.titleEn.trim(),
      subtitleAr: normalizeOptional(value.subtitleAr),
      subtitleEn: normalizeOptional(value.subtitleEn),
      actionLabelAr: normalizeOptional(value.actionLabelAr),
      actionLabelEn: normalizeOptional(value.actionLabelEn),
      imageUrl: value.imageUrl.trim(),
      displayOrder: Number(value.displayOrder) || 0,
      startsAtUtc: toNullableUtcIso(value.startsAtUtc),
      endsAtUtc: toNullableUtcIso(value.endsAtUtc),
      isActive: value.isActive
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.isUploading = true;

    this.marketingApi.uploadBannerImage(file).subscribe({
      next: (response) => {
        this.form.patchValue({ imageUrl: response.url });
        this.form.get('imageUrl')?.markAsDirty();
        this.form.get('imageUrl')?.markAsTouched();
        this.isUploading = false;
        input.value = '';
      },
      error: (error) => {
        console.error('Banner image upload failed', error);
        this.isUploading = false;
        input.value = '';
      }
    });
  }
}

function normalizeOptional(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
