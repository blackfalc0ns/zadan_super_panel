import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppInputComponent } from '../../../../../../../shared/components/ui/form-controls/input/input.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../../../../shared/components/ui/form-controls/select/searchable-select.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-variant-card',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    AppInputComponent,
    SearchableSelectComponent
  ],
  templateUrl: './variant-card.component.html'
})
export class VariantCardComponent {
  @Input() variantGroup!: FormGroup;
  @Input() index!: number;
  @Input() activeLang: string = 'ar';
  @Input() displayPreview: string = '';
  @Input() packageTypeOptions: SearchableSelectOption<string | null>[] = [];
  @Input() measurementUnitOptions: SearchableSelectOption<string | null>[] = [];
  @Input() isPrimary: boolean = false;
  @Input() isUploading: boolean = false;
  /** Field name for the image URL within the form group. Defaults to 'imageUrl', primary uses 'primaryImageUrl' */
  @Input() imageFieldName: string = 'imageUrl';

  @Output() remove = new EventEmitter<number>();
  @Output() uploadImage = new EventEmitter<{ index: number; event: Event }>();
  @Output() removeImage = new EventEmitter<number>();

  get imageUrl(): string | null {
    return this.variantGroup.get(this.imageFieldName)?.value ?? null;
  }

  get barcode(): string {
    return this.variantGroup.get('barcode')?.value ?? '';
  }

  get slug(): string {
    return this.variantGroup.get('slug')?.value ?? '';
  }

  get variantId(): string | null {
    return this.variantGroup.get('id')?.value ?? null;
  }

  get cardTitle(): string {
    if (this.isPrimary) {
      return this.activeLang === 'ar' ? 'الحجم الأساسي' : 'Primary size';
    }
    return (this.activeLang === 'ar' ? 'حجم إضافي ' : 'Additional size ') + (this.index + 1);
  }

  get cardBadgeClass(): string {
    return this.isPrimary
      ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
      : 'border-slate-200 bg-slate-50 text-slate-600';
  }

  onFileInputClick(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onFileSelected(event: Event): void {
    this.uploadImage.emit({ index: this.index, event });
  }

  onRemoveImage(): void {
    this.removeImage.emit(this.index);
  }

  onRemoveVariant(): void {
    this.remove.emit(this.index);
  }
}
