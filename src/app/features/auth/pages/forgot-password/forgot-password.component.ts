import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize, timeout } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './forgot-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  readonly translate = inject(TranslateService);

  forgotForm: FormGroup;
  isLoading = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();
    const identifier = `${this.forgotForm.get('email')?.value || ''}`.trim();

    this.authService.forgotPassword(identifier).pipe(
      timeout(45000),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        void this.router.navigate(['/reset-password'], {
          queryParams: { identifier }
        });
      },
      error: (error) => {
        this.errorMessage = error?.error?.detail
          || error?.error?.message
          || error?.message
          || this.translate.instant('FORGOT_PASSWORD_PAGE.ERRORS.SEND_FAILED');
        this.cdr.markForCheck();
      }
    });
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
    this.cdr.markForCheck();
  }
}
