import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService, AuthLoginResponse, LoginCredentials } from '@core/services/auth.service';

const SAFE_RETURN_URL = /^\/(?!\/)([\w\-./?=&%#]+)?$/;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  returnUrl = '/';
  showPassword = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    public translate: TranslateService
  ) {

    // Identifier accepts either an admin email OR a phone number; the backend
    // normalises both. We only enforce a non-empty value here. The backend is
    // the authoritative validator.
    this.loginForm = this.formBuilder.group({
      identifier: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(120)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]]
    });

    const candidate = this.route.snapshot.queryParams['returnUrl'];
    this.returnUrl = this.sanitizeReturnUrl(candidate) ?? '/';

    const reason = this.route.snapshot.queryParams['reason'];
    if (reason === 'session-expired') {
      this.errorMessage = this.translate.instant('LOGIN.ERR_SESSION_EXPIRED');
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.getRawValue() as LoginCredentials).subscribe({
      next: (response: AuthLoginResponse) => {
        this.cdr.markForCheck();
        if (response.user.mustChangePassword) {
          this.router.navigate(['/change-temporary-password'], { queryParams: { returnUrl: this.returnUrl } });
          return;
        }

        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err: unknown) => {
        this.cdr.markForCheck();
        this.isLoading = false;
        const message = (err as { error?: { message?: string } } | undefined)?.error?.message;
        this.errorMessage = message || this.translate.instant('LOGIN.ERR_LOGIN_FAILED');
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }

  /**
   * Only accept a relative, in-app return URL. Rejects protocol-relative
   * (`//evil.com`), absolute external URLs, and `javascript:` URIs.
   */
  private sanitizeReturnUrl(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (!trimmed.startsWith('/')) {
      return null;
    }

    if (trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
      return null;
    }

    if (!SAFE_RETURN_URL.test(trimmed)) {
      return null;
    }

    return trimmed;
  }
}
