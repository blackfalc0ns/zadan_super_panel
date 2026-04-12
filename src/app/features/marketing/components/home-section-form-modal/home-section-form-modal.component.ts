import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  MarketingCategoryOption,
  MarketingHomeSection,
  MarketingHomeSectionUpdatePayload
} from '@marketing/models/marketing.models';
import { toDateTimeLocalInput, toNullableUtcIso } from '@marketing/utils/marketing-date.utils';
import { AppButtonComponent } from '@shared/components/ui/button/button.component';
import { AppInputComponent } from '@shared/components/ui/form-controls/input/input.component';
import { ModalShellComponent } from '@shared/components/ui/modal-shell/modal-shell.component';

@Component({
  selector: 'app-home-section-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, ModalShellComponent, AppInputComponent, AppButtonComponent],
  template: `
    <app-modal-shell
      *ngIf="isOpen"
      [title]="section ? 'MARKETING.HOME_SECTIONS.MODAL.EDIT_TITLE' : 'MARKETING.HOME_SECTIONS.MODAL.CREATE_TITLE'"
      [subtitle]="'MARKETING.HOME_SECTIONS.MODAL.SUBTITLE'"
      [icon]="'grid_view'"
      [maxWidthClass]="'max-w-4xl'"
      (close)="close.emit()"
    >
      <form [formGroup]="form" modal-body class="space-y-6" (ngSubmit)="submit()">
        <div class="space-y-2">
          <label class="form-label-base">{{ 'MARKETING.HOME_SECTIONS.FIELDS.SUBCATEGORY' | translate }} <span class="text-red-500">*</span></label>
          <select formControlName="categoryId" class="form-input-base w-full !px-4">
            <option value="" disabled>{{ 'MARKETING.HOME_SECTIONS.PLACEHOLDERS.SUBCATEGORY' | translate }}</option>
            <option *ngFor="let option of categoryOptions" [value]="option.id">
              {{ option.pathLabel }}
            </option>
          </select>
          <p *ngIf="!categoryOptions.length" class="text-sm font-bold text-amber-600">
            {{ 'MARKETING.HOME_SECTIONS.MESSAGES.NO_SUBCATEGORIES' | translate }}
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <app-input formControlName="theme" label="MARKETING.HOME_SECTIONS.FIELDS.THEME" placeholder="MARKETING.HOME_SECTIONS.PLACEHOLDERS.THEME" [isRequired]="true"></app-input>
          <app-input formControlName="displayOrder" type="number" label="COMMON.ORDER" placeholder="MARKETING.COMMON.PLACEHOLDERS.ORDER" [isRequired]="true"></app-input>
          <app-input formControlName="productsTake" type="number" label="MARKETING.HOME_SECTIONS.FIELDS.PRODUCTS_TAKE" placeholder="MARKETING.HOME_SECTIONS.PLACEHOLDERS.PRODUCTS_TAKE" [isRequired]="true"></app-input>
          <div class="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <label class="flex cursor-pointer items-center gap-3 text-sm font-bold text-slate-700">
              <input type="checkbox" formControlName="isActive" class="h-4 w-4 rounded border-slate-300 text-zadna-primary focus:ring-zadna-primary" />
              {{ 'MARKETING.HOME_SECTIONS.FIELDS.IS_ACTIVE' | translate }}
            </label>
          </div>
          <app-input formControlName="startsAtUtc" type="datetime-local" label="MARKETING.COMMON.FIELDS.STARTS_AT" placeholder=""></app-input>
          <app-input formControlName="endsAtUtc" type="datetime-local" label="MARKETING.COMMON.FIELDS.ENDS_AT" placeholder=""></app-input>
        </div>

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
export class HomeSectionFormModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSaving = false;
  @Input() section: MarketingHomeSection | null = null;
  @Input() categoryOptions: MarketingCategoryOption[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<MarketingHomeSectionUpdatePayload>();

  submitAttempted = false;

  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.nonNullable.group({
    categoryId: ['', Validators.required],
    theme: ['', Validators.required],
    displayOrder: ['0', Validators.required],
    productsTake: ['8', Validators.required],
    startsAtUtc: [''],
    endsAtUtc: [''],
    isActive: true
  });

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
        isActive: section?.isActive ?? true
      });
    }
  }

  submit(): void {
    this.submitAttempted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.save.emit({
      categoryId: value.categoryId,
      theme: value.theme.trim(),
      displayOrder: Number(value.displayOrder) || 0,
      productsTake: Number(value.productsTake) || 0,
      startsAtUtc: toNullableUtcIso(value.startsAtUtc),
      endsAtUtc: toNullableUtcIso(value.endsAtUtc),
      isActive: value.isActive
    });
  }
}
