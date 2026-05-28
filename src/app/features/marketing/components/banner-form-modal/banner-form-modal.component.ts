import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MarketingBanner, MarketingBannerUpdatePayload } from '@marketing/models/marketing.models';
import { MarketingApiService } from '@marketing/services/marketing.api.service';
import { toDateTimeLocalInput, toNullableUtcIso } from '@marketing/utils/marketing-date.utils';
import { AppButtonComponent } from '@shared/components/ui/button/button.component';
import { AppInputComponent } from '@shared/components/ui/form-controls/input/input.component';
import { ModalShellComponent } from '@shared/components/ui/modal-shell/modal-shell.component';

const IMAGE_ONLY_BANNER_DEFAULTS = {
  tagAr: 'بانر',
  tagEn: 'Banner',
  titleAr: 'بانر رئيسي',
  titleEn: 'Main Banner'
} as const;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      [title]="(banner ? 'MARKETING.BANNERS.MODAL.EDIT_TITLE' : 'MARKETING.BANNERS.MODAL.CREATE_TITLE') | translate"
      [subtitle]="'MARKETING.BANNERS.MODAL.SUBTITLE' | translate"
      [icon]="'campaign'"
      [maxWidthClass]="'max-w-4xl'"
      (close)="close.emit()"
    >
      <form [formGroup]="form" modal-body class="space-y-6" (ngSubmit)="submit()">
        
        <div class="grid gap-6 md:grid-cols-2">
          <!-- Image Upload Section -->
          <div class="md:col-span-2 space-y-3">
            <label class="text-sm font-black text-slate-700">
              {{ 'MARKETING.BANNERS.FIELDS.IMAGE' | translate }}
              <span class="text-red-500">*</span>
            </label>

            <div class="flex flex-col items-center rounded-3xl border border-slate-200 bg-slate-50/70 p-6 transition-all hover:bg-slate-50">
              <div class="group relative">
                <div class="flex h-40 w-[28rem] max-w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-white shadow-inner transition-all group-hover:border-zadna-primary group-hover:shadow-lg group-hover:shadow-zadna-primary/10">
                  <img
                    *ngIf="form.get('imageUrl')?.value"
                    [src]="form.get('imageUrl')?.value"
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105">

                  <div *ngIf="!form.get('imageUrl')?.value" class="flex flex-col items-center text-slate-400">
                    <span class="material-symbols-outlined text-[40px] mb-2 opacity-50">add_photo_alternate</span>
                    <span class="text-xs font-black uppercase tracking-widest text-slate-500">
                      {{ 'MARKETING.BANNERS.FIELDS.UPLOAD_IMAGE' | translate }}
                    </span>
                  </div>

                  <label class="absolute inset-0 flex cursor-pointer items-center justify-center bg-zadna-primary/10 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                    <span class="rounded-xl border border-zadna-primary/20 bg-white px-4 py-2 text-xs font-black text-zadna-primary shadow-sm flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all">
                      <span class="material-symbols-outlined text-[16px]">{{ form.get('imageUrl')?.value ? 'edit' : 'upload' }}</span>
                      {{ (form.get('imageUrl')?.value ? 'MARKETING.BANNERS.FIELDS.CHANGE_IMAGE' : 'MARKETING.BANNERS.FIELDS.SELECT_IMAGE') | translate }}
                    </span>
                    <input type="file" class="hidden" accept="image/*" (change)="onFileSelected($event)">
                  </label>
                </div>

                <div *ngIf="isUploading" class="absolute inset-0 z-10 rounded-2xl bg-white/90 p-4 backdrop-blur-sm">
                  <span class="admin-skeleton admin-skeleton-media rounded-xl"></span>
                </div>
              </div>
            </div>
          </div>

          <div class="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-zadna-primary shadow-sm">
                <span class="material-symbols-outlined text-[20px]">image</span>
              </div>
              <div>
                <p class="text-sm font-black text-slate-900">
                  {{ translateService.currentLang === 'ar' ? 'بانر بصورة فقط' : 'Image-only banner' }}
                </p>
                <p class="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  {{ translateService.currentLang === 'ar'
                    ? 'تم إخفاء حقول النص من هذه النافذة. النظام سيحفظ قيماً افتراضية داخليًا، وأنت تحتاج فقط إلى رفع الصورة وترتيب ظهورها.'
                    : 'Text fields are hidden in this modal. The system saves internal defaults, so you only need to upload the image and choose its order.' }}
                </p>
              </div>
            </div>
          </div>

          <div class="md:col-span-2 h-px bg-slate-200 my-2"></div>

          <!-- Scheduling & Ordering -->
          <app-input formControlName="displayOrder" type="number" [label]="'MARKETING.BANNERS.FIELDS.ORDER' | translate" [placeholder]="'MARKETING.BANNERS.FIELDS.ORDER_PLACEHOLDER' | translate" [isRequired]="true"></app-input>
          
          <div class="flex items-end">
            <div class="flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 hover:border-zadna-primary/50 transition-colors">
              <label class="flex w-full cursor-pointer items-center justify-between gap-3 text-sm font-bold text-slate-700 select-none">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-[20px] text-zadna-primary">visibility</span>
                  <span>{{ 'MARKETING.BANNERS.FIELDS.ACTIVATE' | translate }}</span>
                </div>
                <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" formControlName="isActive" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-slate-300 appearance-none cursor-pointer transition-all duration-300 checked:right-0 checked:border-zadna-primary focus:outline-none focus:ring-0 focus:ring-offset-0" style="right: 1.25rem;" [style.right]="form.get('isActive')?.value ? '0' : '1.25rem'" [style.borderColor]="form.get('isActive')?.value ? '#127c8c' : '#cbd5e1'"/>
                  <label class="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer transition-colors duration-300" [style.backgroundColor]="form.get('isActive')?.value ? '#77cdd8' : '#cbd5e1'"></label>
                </div>
              </label>
            </div>
          </div>

          <app-input formControlName="startsAtUtc" type="datetime-local" [label]="'MARKETING.BANNERS.FIELDS.STARTS_AT' | translate" placeholder=""></app-input>
          <app-input formControlName="endsAtUtc" type="datetime-local" [label]="'MARKETING.BANNERS.FIELDS.ENDS_AT' | translate" placeholder=""></app-input>
        </div>

        <div *ngIf="submitAttempted && form.invalid" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">error</span>
          {{ 'MARKETING.BANNERS.MESSAGES.REQUIRED_FIELDS' | translate }}
        </div>
      </form>

      <div modal-footer class="flex items-center justify-end gap-3 w-full bg-slate-50/80 p-4 border-t border-slate-200">
        <app-button variant="ghost" size="sm" (btnClick)="close.emit()" customClass="!rounded-xl text-slate-600 hover:bg-slate-200 hover:text-slate-900">{{ 'MARKETING.COUPONS.ACTIONS.CANCEL' | translate }}</app-button>
        <app-button variant="primary" size="sm" [isLoading]="isSaving || isUploading" (btnClick)="submit()" customClass="!rounded-xl bg-zadna-primary hover:bg-zadna-primary/90 shadow-lg shadow-zadna-primary/20">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">save</span>
            {{ (banner ? 'MARKETING.BANNERS.ACTIONS.SAVE_CHANGES' : 'MARKETING.BANNERS.ACTIONS.ADD_BANNER') | translate }}
          </div>
        </app-button>
      </div>
    </app-modal-shell>
  `,
  styles: [`
    .toggle-checkbox:checked { right: 0; border-color: #127c8c; }
    .toggle-label { background-color: #cbd5e1; }
    .toggle-checkbox:checked + .toggle-label { background-color: #77cdd8; }
  `]
})
export class BannerFormModalComponent implements OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);
  @Input() isOpen = false;
  @Input() isSaving = false;
  @Input() banner: MarketingBanner | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<MarketingBannerUpdatePayload>();

  submitAttempted = false;
  isUploading = false;

  private readonly formBuilder = inject(FormBuilder);
  private readonly marketingApi = inject(MarketingApiService);
  readonly translateService = inject(TranslateService);

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
        tagAr: banner?.tagAr ?? IMAGE_ONLY_BANNER_DEFAULTS.tagAr,
        tagEn: banner?.tagEn ?? IMAGE_ONLY_BANNER_DEFAULTS.tagEn,
        titleAr: banner?.titleAr ?? IMAGE_ONLY_BANNER_DEFAULTS.titleAr,
        titleEn: banner?.titleEn ?? IMAGE_ONLY_BANNER_DEFAULTS.titleEn,
        subtitleAr: '',
        subtitleEn: '',
        actionLabelAr: '',
        actionLabelEn: '',
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
      tagAr: normalizeRequired(value.tagAr, IMAGE_ONLY_BANNER_DEFAULTS.tagAr),
      tagEn: normalizeRequired(value.tagEn, IMAGE_ONLY_BANNER_DEFAULTS.tagEn),
      titleAr: normalizeRequired(value.titleAr, IMAGE_ONLY_BANNER_DEFAULTS.titleAr),
      titleEn: normalizeRequired(value.titleEn, IMAGE_ONLY_BANNER_DEFAULTS.titleEn),
      subtitleAr: null,
      subtitleEn: null,
      actionLabelAr: null,
      actionLabelEn: null,
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
        this.cdr.markForCheck();
        this.form.patchValue({ imageUrl: response.url });
        this.form.get('imageUrl')?.markAsDirty();
        this.form.get('imageUrl')?.markAsTouched();
        this.isUploading = false;
        input.value = '';
      },
      error: (error) => {
        this.cdr.markForCheck();
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

function normalizeRequired(value: string | null, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}
