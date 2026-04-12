import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FeaturedPlacement, FeaturedPlacementType, FeaturedPlacementUpdatePayload } from '@marketing/models/marketing.models';
import { toDateTimeLocalInput, toNullableUtcIso } from '@marketing/utils/marketing-date.utils';
import { AppButtonComponent } from '@shared/components/ui/button/button.component';
import { AppInputComponent } from '@shared/components/ui/form-controls/input/input.component';
import { AppTextareaComponent } from '@shared/components/ui/form-controls/textarea/textarea.component';
import { ModalShellComponent } from '@shared/components/ui/modal-shell/modal-shell.component';

@Component({
  selector: 'app-featured-placement-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ModalShellComponent,
    AppInputComponent,
    AppTextareaComponent,
    AppButtonComponent
  ],
  template: `
    <app-modal-shell
      *ngIf="isOpen"
      [title]="placement ? 'MARKETING.FEATURED.MODAL.EDIT_TITLE' : 'MARKETING.FEATURED.MODAL.CREATE_TITLE'"
      [subtitle]="'MARKETING.FEATURED.MODAL.SUBTITLE'"
      [icon]="'star'"
      [maxWidthClass]="'max-w-4xl'"
      (close)="close.emit()"
    >
      <form [formGroup]="form" modal-body class="space-y-6" (ngSubmit)="submit()">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label class="form-label-base">{{ 'MARKETING.FEATURED.FIELDS.PLACEMENT_TYPE' | translate }} <span class="text-red-500">*</span></label>
            <select formControlName="placementType" class="form-input-base w-full !px-4">
              <option value="VendorProduct">{{ 'MARKETING.FEATURED.TYPES.VENDOR_PRODUCT' | translate }}</option>
              <option value="MasterProduct">{{ 'MARKETING.FEATURED.TYPES.MASTER_PRODUCT' | translate }}</option>
            </select>
          </div>

          <app-input formControlName="displayOrder" type="number" label="COMMON.ORDER" placeholder="MARKETING.COMMON.PLACEHOLDERS.ORDER" [isRequired]="true"></app-input>

          <app-input formControlName="vendorProductId" label="MARKETING.FEATURED.FIELDS.VENDOR_PRODUCT_ID" placeholder="MARKETING.COMMON.PLACEHOLDERS.GUID" [customClass]="isVendorPlacement ? '' : 'opacity-60'"></app-input>
          <app-input formControlName="masterProductId" label="MARKETING.FEATURED.FIELDS.MASTER_PRODUCT_ID" placeholder="MARKETING.COMMON.PLACEHOLDERS.GUID" [customClass]="isMasterPlacement ? '' : 'opacity-60'"></app-input>

          <app-input formControlName="startsAtUtc" type="datetime-local" label="MARKETING.COMMON.FIELDS.STARTS_AT" placeholder=""></app-input>
          <app-input formControlName="endsAtUtc" type="datetime-local" label="MARKETING.COMMON.FIELDS.ENDS_AT" placeholder=""></app-input>
        </div>

        <app-textarea formControlName="note" label="MARKETING.FEATURED.FIELDS.NOTE" placeholder="MARKETING.FEATURED.PLACEHOLDERS.NOTE" [rows]="3"></app-textarea>

        <div class="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <label class="flex cursor-pointer items-center gap-3 text-sm font-bold text-slate-700">
              <input type="checkbox" formControlName="isActive" class="h-4 w-4 rounded border-slate-300 text-zadna-primary focus:ring-zadna-primary" />
              {{ 'MARKETING.FEATURED.FIELDS.IS_ACTIVE' | translate }}
            </label>
          </div>

        <div *ngIf="submitAttempted && targetValidationMessage" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          {{ targetValidationMessage | translate }}
        </div>
      </form>

      <div modal-footer class="flex items-center justify-end gap-3">
        <app-button variant="ghost" size="sm" (btnClick)="close.emit()">{{ 'COMMON.CANCEL' | translate }}</app-button>
        <app-button variant="primary" size="sm" [isLoading]="isSaving" (btnClick)="submit()">
          {{ (placement ? 'MARKETING.ACTIONS.SAVE_CHANGES' : 'MARKETING.FEATURED.ACTIONS.CREATE') | translate }}
        </app-button>
      </div>
    </app-modal-shell>
  `
})
export class FeaturedPlacementFormModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSaving = false;
  @Input() placement: FeaturedPlacement | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<FeaturedPlacementUpdatePayload>();

  submitAttempted = false;

  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.nonNullable.group({
    placementType: ['VendorProduct' as FeaturedPlacementType, Validators.required],
    vendorProductId: [''],
    masterProductId: [''],
    displayOrder: ['0', Validators.required],
    startsAtUtc: [''],
    endsAtUtc: [''],
    note: [''],
    isActive: true
  });

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen'] || changes['placement']) && this.isOpen) {
      this.submitAttempted = false;
      const placement = this.placement;
      this.form.reset({
        placementType: placement?.placementType ?? 'VendorProduct',
        vendorProductId: placement?.vendorProductId ?? '',
        masterProductId: placement?.masterProductId ?? '',
        displayOrder: String(placement?.displayOrder ?? 0),
        startsAtUtc: toDateTimeLocalInput(placement?.startsAtUtc),
        endsAtUtc: toDateTimeLocalInput(placement?.endsAtUtc),
        note: placement?.note ?? '',
        isActive: placement?.isActive ?? true
      });
    }
  }

  get isVendorPlacement(): boolean {
    return this.form.controls.placementType.value === 'VendorProduct';
  }

  get isMasterPlacement(): boolean {
    return this.form.controls.placementType.value === 'MasterProduct';
  }

  get targetValidationMessage(): string {
    const value = this.form.getRawValue();
    if (value.placementType === 'VendorProduct' && !value.vendorProductId.trim()) {
      return 'MARKETING.FEATURED.MESSAGES.VENDOR_ID_REQUIRED';
    }

    if (value.placementType === 'MasterProduct' && !value.masterProductId.trim()) {
      return 'MARKETING.FEATURED.MESSAGES.MASTER_ID_REQUIRED';
    }

    return '';
  }

  submit(): void {
    this.submitAttempted = true;
    if (this.form.invalid || this.targetValidationMessage) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const isVendorPlacement = value.placementType === 'VendorProduct';

    this.save.emit({
      placementType: value.placementType,
      vendorProductId: isVendorPlacement ? normalizeOptional(value.vendorProductId) : null,
      masterProductId: isVendorPlacement ? null : normalizeOptional(value.masterProductId),
      displayOrder: Number(value.displayOrder) || 0,
      startsAtUtc: toNullableUtcIso(value.startsAtUtc),
      endsAtUtc: toNullableUtcIso(value.endsAtUtc),
      note: normalizeOptional(value.note),
      isActive: value.isActive
    });
  }
}

function normalizeOptional(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
