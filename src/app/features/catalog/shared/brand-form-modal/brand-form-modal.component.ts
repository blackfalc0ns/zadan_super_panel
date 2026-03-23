import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '../../../../core/services/catalog.service';
import { Brand } from '../../../../core/models/catalog.model';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppInputComponent } from '../../../../shared/components/ui/form-controls/input.component';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';

@Component({
  selector: 'app-brand-form-modal',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TranslateModule,
    AppButtonComponent,
    AppInputComponent,
    ModalShellComponent
  ],
  templateUrl: './brand-form-modal.component.html',
  styleUrl: './brand-form-modal.component.scss'
})
export class BrandFormModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() brand: Brand | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  isSaving = false;
  isUploading = false;
  activeInputLang: 'ar' | 'en' = 'ar';

  constructor(
    private fb: FormBuilder,
    private catalogService: CatalogService,
    public translate: TranslateService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['brand']) {
      if (this.mode === 'edit' && this.brand) {
        this.form.patchValue(this.brand);
      } else {
        this.form.reset({ isActive: true });
      }
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [null],
      nameAr: ['', [Validators.required, Validators.maxLength(100)]],
      nameEn: ['', [Validators.required, Validators.maxLength(100)]],
      logoUrl: [''],
      isActive: [true]
    });
  }

  setLang(lang: 'ar' | 'en'): void {
    this.activeInputLang = lang;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.catalogService.uploadFile(file, 'brands').subscribe({
        next: (res) => {
          this.form.patchValue({ logoUrl: res.url });
          this.isUploading = false;
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.isUploading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const payload = this.form.value;

    const request = this.mode === 'create'
      ? this.catalogService.createBrand(payload)
      : this.catalogService.updateBrand(payload.id, payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.saved.emit();
        this.onClose();
      },
      error: (err) => {
        console.error('Save failed', err);
        this.isSaving = false;
      }
    });
  }

  onClose(): void {
    this.form.reset({ isActive: true });
    this.close.emit();
  }
}
