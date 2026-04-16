import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  HomeSectionTheme,
  HomeSectionThemeOption,
  MarketingCategoryOption,
  MarketingHomeSection,
  MarketingHomeSectionUpdatePayload
} from '@marketing/models/marketing.models';
import { toDateTimeLocalInput, toNullableUtcIso } from '@marketing/utils/marketing-date.utils';
import { AppButtonComponent } from '@shared/components/ui/button/button.component';
import { ModalShellComponent } from '@shared/components/ui/modal-shell/modal-shell.component';

@Component({
  selector: 'app-home-section-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, ModalShellComponent, AppButtonComponent],
  template: `
    <app-modal-shell
      *ngIf="isOpen"
      [dir]="translateService.currentLang === 'ar' ? 'rtl' : 'ltr'"
      [title]="section ? 'MARKETING.HOME_SECTIONS.MODAL.EDIT_TITLE' : 'MARKETING.HOME_SECTIONS.MODAL.CREATE_TITLE'"
      [subtitle]="'MARKETING.HOME_SECTIONS.MODAL.SUBTITLE'"
      [icon]="'grid_view'"
      [maxWidthClass]="'max-w-4xl'"
      [panelClass]="'rounded-[2rem] border-slate-200/90 shadow-[0_28px_80px_-24px_rgba(15,23,42,0.35)]'"
      [headerClass]="'px-7 py-6'"
      [bodyClass]="'px-7 py-6'"
      [footerClass]="'px-7 py-5'"
      (close)="close.emit()"
    >
      <form [formGroup]="form" modal-body class="space-y-6" (ngSubmit)="submit()">
        <section class="space-y-3">
          <label class="text-sm font-black text-slate-500">
            {{ 'MARKETING.HOME_SECTIONS.FIELDS.SUBCATEGORY' | translate }}
            <span class="text-red-500">*</span>
          </label>
          <select
            formControlName="categoryId"
            class="min-h-[3.75rem] w-full rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-zadna-primary focus:bg-white focus:ring-4 focus:ring-zadna-primary/10">
            <option value="" disabled>{{ 'MARKETING.HOME_SECTIONS.PLACEHOLDERS.SUBCATEGORY' | translate }}</option>
            <option *ngFor="let option of categoryOptions" [value]="option.id">
              {{ option.pathLabel }}
            </option>
          </select>
          <p *ngIf="!categoryOptions.length" class="text-sm font-bold text-amber-600">
            {{ 'MARKETING.HOME_SECTIONS.MESSAGES.NO_SUBCATEGORIES' | translate }}
          </p>
        </section>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label class="text-sm font-black text-slate-500">
              {{ 'MARKETING.HOME_SECTIONS.FIELDS.THEME' | translate }}
              <span class="text-red-500">*</span>
            </label>
            <select
              formControlName="theme"
              class="min-h-[3.75rem] w-full rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-zadna-primary focus:bg-white focus:ring-4 focus:ring-zadna-primary/10">
              <option value="" disabled>{{ 'MARKETING.HOME_SECTIONS.PLACEHOLDERS.THEME' | translate }}</option>
              <option *ngFor="let option of themeOptions" [value]="option.key">
                {{ getThemeOptionLabel(option) }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-black text-slate-500">
              {{ 'COMMON.ORDER' | translate }}
              <span class="text-red-500">*</span>
            </label>
            <input
              formControlName="displayOrder"
              type="number"
              min="0"
              class="min-h-[3.75rem] w-full rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-zadna-primary focus:bg-white focus:ring-4 focus:ring-zadna-primary/10"
              [placeholder]="translateService.instant('MARKETING.COMMON.PLACEHOLDERS.ORDER')" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-black text-slate-500">
              {{ 'MARKETING.HOME_SECTIONS.FIELDS.PRODUCTS_TAKE' | translate }}
              <span class="text-red-500">*</span>
            </label>
            <input
              formControlName="productsTake"
              type="number"
              min="1"
              class="min-h-[3.75rem] w-full rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-zadna-primary focus:bg-white focus:ring-4 focus:ring-zadna-primary/10"
              [placeholder]="translateService.instant('MARKETING.HOME_SECTIONS.PLACEHOLDERS.PRODUCTS_TAKE')" />
            <p class="text-xs font-bold text-slate-400">
              {{ 'MARKETING.HOME_SECTIONS.HELPERS.PRODUCTS_TAKE' | translate }}
            </p>
          </div>

          <div class="flex items-center rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4">
            <label class="flex cursor-pointer items-center gap-3 text-sm font-bold text-slate-700">
              <input type="checkbox" formControlName="isActive" class="h-4 w-4 rounded border-slate-300 text-zadna-primary focus:ring-zadna-primary" />
              {{ 'MARKETING.HOME_SECTIONS.FIELDS.IS_ACTIVE' | translate }}
            </label>
          </div>
        </div>

        <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="space-y-1">
              <h3 class="text-sm font-black text-slate-700">
                {{ 'MARKETING.COMMON.TABLE.SCHEDULE' | translate }}
              </h3>
              <p class="text-xs font-bold text-slate-400">
                {{ (form.controls.alwaysVisible.value
                  ? 'MARKETING.HOME_SECTIONS.HELPERS.SCHEDULE_ALWAYS'
                  : 'MARKETING.HOME_SECTIONS.HELPERS.SCHEDULE_WINDOW') | translate }}
              </p>
            </div>

            <label class="flex cursor-pointer items-center gap-3 text-sm font-black text-slate-700">
              <input type="checkbox" formControlName="alwaysVisible" class="h-4 w-4 rounded border-slate-300 text-zadna-primary focus:ring-zadna-primary" />
              {{ 'MARKETING.HOME_SECTIONS.FIELDS.ALWAYS_VISIBLE' | translate }}
            </label>
          </div>

          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm font-black text-slate-500">
                {{ 'MARKETING.COMMON.FIELDS.STARTS_AT' | translate }}
              </label>
              <input
                formControlName="startsAtUtc"
                type="datetime-local"
                [disabled]="form.controls.alwaysVisible.value"
                class="min-h-[3.75rem] w-full rounded-[1.35rem] border px-4 text-sm font-bold outline-none transition"
                [ngClass]="form.controls.alwaysVisible.value
                  ? 'border-slate-200 bg-slate-100 text-slate-400'
                  : 'border-slate-200 bg-white text-slate-800 focus:border-zadna-primary focus:ring-4 focus:ring-zadna-primary/10'" />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-black text-slate-500">
                {{ 'MARKETING.COMMON.FIELDS.ENDS_AT' | translate }}
              </label>
              <input
                formControlName="endsAtUtc"
                type="datetime-local"
                [disabled]="form.controls.alwaysVisible.value"
                class="min-h-[3.75rem] w-full rounded-[1.35rem] border px-4 text-sm font-bold outline-none transition"
                [ngClass]="form.controls.alwaysVisible.value
                  ? 'border-slate-200 bg-slate-100 text-slate-400'
                  : 'border-slate-200 bg-white text-slate-800 focus:border-zadna-primary focus:ring-4 focus:ring-zadna-primary/10'" />
            </div>
          </div>
        </section>

        <div *ngIf="submitAttempted && form.invalid" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          {{ 'MARKETING.HOME_SECTIONS.MESSAGES.REQUIRED_FIELDS' | translate }}
        </div>
      </form>

      <div modal-footer class="flex items-center justify-end gap-3">
        <app-button variant="ghost" size="sm" (btnClick)="close.emit()">{{ 'COMMON.CANCEL' | translate }}</app-button>
        <app-button variant="primary" size="sm" [isLoading]="isSaving" (btnClick)="submit()">
          {{ (section ? 'MARKETING.ACTIONS.SAVE_CHANGES' : 'MARKETING.HOME_SECTIONS.ACTIONS.CREATE') | translate }}
        </app-button>
      </div>
    </app-modal-shell>
  `
})
export class HomeSectionFormModalComponent implements OnChanges, OnInit {
  @Input() isOpen = false;
  @Input() isSaving = false;
  @Input() section: MarketingHomeSection | null = null;
  @Input() categoryOptions: MarketingCategoryOption[] = [];
  @Input() themeOptions: HomeSectionThemeOption[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<MarketingHomeSectionUpdatePayload>();

  submitAttempted = false;

  private readonly formBuilder = inject(FormBuilder);
  readonly translateService = inject(TranslateService);

  readonly form = this.formBuilder.nonNullable.group({
    categoryId: ['', Validators.required],
    theme: ['' as HomeSectionTheme | '', Validators.required],
    displayOrder: ['0', Validators.required],
    productsTake: ['8', Validators.required],
    startsAtUtc: [''],
    endsAtUtc: [''],
    alwaysVisible: true,
    isActive: true
  });

  ngOnInit(): void {
    this.form.controls.alwaysVisible.valueChanges.subscribe(() => this.toggleScheduleInputs());
    this.toggleScheduleInputs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen'] || changes['section']) && this.isOpen) {
      this.submitAttempted = false;
      const section = this.section;
      this.form.reset({
        categoryId: section?.categoryId ?? '',
        theme: section?.theme ?? '',
        displayOrder: String(section?.displayOrder ?? 0),
        productsTake: String(section?.productsTake ?? 8),
        startsAtUtc: toDateTimeLocalInput(section?.startsAtUtc),
        endsAtUtc: toDateTimeLocalInput(section?.endsAtUtc),
        alwaysVisible: !section?.startsAtUtc && !section?.endsAtUtc,
        isActive: section?.isActive ?? true
      });
    }

    if (changes['isOpen']) {
      this.toggleScheduleInputs();
    }
  }

  submit(): void {
    this.submitAttempted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const startsAtUtc = value.alwaysVisible ? null : toNullableUtcIso(value.startsAtUtc);
    const endsAtUtc = value.alwaysVisible ? null : toNullableUtcIso(value.endsAtUtc);

    this.save.emit({
      categoryId: value.categoryId,
      theme: value.theme as HomeSectionTheme,
      displayOrder: Number(value.displayOrder) || 0,
      productsTake: Number(value.productsTake) || 0,
      startsAtUtc,
      endsAtUtc,
      isActive: value.isActive
    });
  }

  private toggleScheduleInputs(): void {
    const alwaysVisible = this.form.controls.alwaysVisible.value;
    const startsAtControl = this.form.controls.startsAtUtc;
    const endsAtControl = this.form.controls.endsAtUtc;

    if (alwaysVisible) {
      startsAtControl.setValue('', { emitEvent: false });
      endsAtControl.setValue('', { emitEvent: false });
      startsAtControl.disable({ emitEvent: false });
      endsAtControl.disable({ emitEvent: false });
      return;
    }

    startsAtControl.enable({ emitEvent: false });
    endsAtControl.enable({ emitEvent: false });
  }

  getThemeOptionLabel(option: HomeSectionThemeOption): string {
    return this.translateService.currentLang === 'ar' ? option.labelAr : option.labelEn;
  }
}
