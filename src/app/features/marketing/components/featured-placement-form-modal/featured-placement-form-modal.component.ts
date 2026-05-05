import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
    ModalShellComponent,
    AppInputComponent,
    AppTextareaComponent,
    AppButtonComponent
  ],
  template: `
    <app-modal-shell
      *ngIf="isOpen"
      [title]="placement ? 'تعديل المنتج المميز' : 'إضافة منتج مميز جديد'"
      [subtitle]="'حدد المنتج الذي ترغب بترويجه ليظهر في الصفحة الرئيسية كمنتج مميز.'"
      [icon]="'star'"
      [maxWidthClass]="'max-w-4xl'"
      (close)="close.emit()"
    >
      <form [formGroup]="form" modal-body class="space-y-6" (ngSubmit)="submit()">
        
        <div class="grid gap-6 md:grid-cols-2">
          
          <div class="md:col-span-2 p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col gap-4">
            <label class="text-sm font-black text-slate-700">
              نوع المنتج المستهدف <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-3">
               <label class="relative flex cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-zadna-primary/50 transition-colors" [ngClass]="{'border-zadna-primary ring-1 ring-zadna-primary bg-zadna-primary/5': isVendorPlacement}">
                  <input type="radio" formControlName="placementType" value="VendorProduct" class="peer sr-only">
                  <div class="flex items-start gap-3">
                     <span class="material-symbols-outlined text-[24px]" [ngClass]="isVendorPlacement ? 'text-zadna-primary' : 'text-slate-400'">storefront</span>
                     <div>
                        <h4 class="text-sm font-black" [ngClass]="isVendorPlacement ? 'text-zadna-primary' : 'text-slate-700'">منتج متجر</h4>
                        <p class="text-[11px] font-bold mt-1 text-slate-500">ترويج منتج خاص بمتجر معين</p>
                     </div>
                  </div>
               </label>

               <label class="relative flex cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-zadna-primary/50 transition-colors" [ngClass]="{'border-zadna-primary ring-1 ring-zadna-primary bg-zadna-primary/5': isMasterPlacement}">
                  <input type="radio" formControlName="placementType" value="MasterProduct" class="peer sr-only">
                  <div class="flex items-start gap-3">
                     <span class="material-symbols-outlined text-[24px]" [ngClass]="isMasterPlacement ? 'text-zadna-primary' : 'text-slate-400'">inventory_2</span>
                     <div>
                        <h4 class="text-sm font-black" [ngClass]="isMasterPlacement ? 'text-zadna-primary' : 'text-slate-700'">منتج رئيسي</h4>
                        <p class="text-[11px] font-bold mt-1 text-slate-500">ترويج منتج من الكتالوج الموحد</p>
                     </div>
                  </div>
               </label>
            </div>
          </div>

          <div class="md:col-span-2 space-y-4">
            <app-input *ngIf="isVendorPlacement" formControlName="vendorProductId" label="معرف منتج المتجر (Vendor Product ID)" placeholder="مثال: 123e4567-e89b-12d3-a456-426614174000" [isRequired]="true" [customClass]="'animate-in fade-in zoom-in-95 duration-200'"></app-input>
            <app-input *ngIf="isMasterPlacement" formControlName="masterProductId" label="معرف المنتج الرئيسي (Master Product ID)" placeholder="مثال: 123e4567-e89b-12d3-a456-426614174000" [isRequired]="true" [customClass]="'animate-in fade-in zoom-in-95 duration-200'"></app-input>
          </div>

          <div class="md:col-span-2 h-px bg-slate-200 my-1"></div>

          <app-input formControlName="displayOrder" type="number" label="ترتيب العرض" placeholder="الترتيب بين المنتجات المميزة" [isRequired]="true"></app-input>
          
          <div class="flex items-end">
            <div class="flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 hover:border-zadna-primary/50 transition-colors">
              <label class="flex w-full cursor-pointer items-center justify-between gap-3 text-sm font-bold text-slate-700 select-none">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-[20px] text-zadna-primary">star</span>
                  <span>تفعيل المنتج</span>
                </div>
                <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" formControlName="isActive" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-slate-300 appearance-none cursor-pointer transition-all duration-300 checked:right-0 checked:border-zadna-primary focus:outline-none focus:ring-0 focus:ring-offset-0" style="right: 1.25rem;" [style.right]="form.get('isActive')?.value ? '0' : '1.25rem'" [style.borderColor]="form.get('isActive')?.value ? '#127c8c' : '#cbd5e1'"/>
                  <label class="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer transition-colors duration-300" [style.backgroundColor]="form.get('isActive')?.value ? '#77cdd8' : '#cbd5e1'"></label>
                </div>
              </label>
            </div>
          </div>

          <app-input formControlName="startsAtUtc" type="datetime-local" label="تاريخ بداية العرض" placeholder=""></app-input>
          <app-input formControlName="endsAtUtc" type="datetime-local" label="تاريخ نهاية العرض" placeholder=""></app-input>

          <div class="md:col-span-2">
            <app-textarea formControlName="note" label="ملاحظات (اختياري)" placeholder="أضف أي ملاحظات ترويجية إضافية هنا..." [rows]="3"></app-textarea>
          </div>

        </div>

        <div *ngIf="submitAttempted && targetValidationMessage" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">error</span>
          {{ targetValidationMessage }}
        </div>
      </form>

      <div modal-footer class="flex items-center justify-end gap-3 w-full bg-slate-50/80 p-4 border-t border-slate-200">
        <app-button variant="ghost" size="sm" (btnClick)="close.emit()" customClass="!rounded-xl text-slate-600 hover:bg-slate-200 hover:text-slate-900">إلغاء</app-button>
        <app-button variant="primary" size="sm" [isLoading]="isSaving" (btnClick)="submit()" customClass="!rounded-xl bg-zadna-primary hover:bg-zadna-primary/90 shadow-lg shadow-zadna-primary/20 text-white">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">save</span>
            {{ placement ? 'حفظ التغييرات' : 'إضافة المنتج' }}
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
      return 'يرجى إدخال معرف منتج المتجر.';
    }

    if (value.placementType === 'MasterProduct' && !value.masterProductId.trim()) {
      return 'يرجى إدخال معرف المنتج الرئيسي.';
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
