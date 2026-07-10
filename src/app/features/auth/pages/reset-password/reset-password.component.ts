import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize, switchMap, timeout } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  readonly translate = inject(TranslateService);

  isLoading = false;
  submitted = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  readonly form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.form = this.fb.group({
      identifier: ['', [Validators.required, Validators.email]],
      otpCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    const identifier = this.route.snapshot.queryParamMap.get('identifier');
    if (identifier) {
      this.form.patchValue({ identifier });
    }
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
    this.cdr.markForCheck();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
    this.cdr.markForCheck();
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
    this.cdr.markForCheck();
  }

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const { identifier, otpCode, newPassword } = this.form.getRawValue();
    this.isLoading = true;
    this.cdr.markForCheck();

    this.authService.verifyPasswordResetOtp(identifier || '', otpCode || '').pipe(
      switchMap((verification) =>
        this.authService.resetPassword(identifier || '', verification.resetToken, newPassword || '')
      ),
      timeout(45000),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        void this.router.navigate(['/login']);
      },
      error: (error) => {
        this.errorMessage = error?.error?.detail
          || error?.error?.message
          || error?.message
          || this.translate.instant('RESET_PASSWORD_PAGE.ERRORS.RESET_FAILED');
        this.cdr.markForCheck();
      }
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const form = control as FormGroup;
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
}
