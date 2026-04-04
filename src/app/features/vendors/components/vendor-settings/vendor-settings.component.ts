import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';

@Component({
  selector: 'app-vendor-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SectionHeaderComponent, StatusPillComponent],
  templateUrl: './vendor-settings.component.html'
})
export class VendorSettingsComponent {
  currentLang = 'ar';
  isRTL = true;
  resetPasswordQueued = false;
  isAccountSuspended = false;
  isLoginLocked = false;
  isArchived = false;
  private readonly destroyRef = inject(DestroyRef);

  constructor(private readonly translate: TranslateService) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
      });
  }

  get accountStatusLabel(): string {
    return this.isAccountSuspended || this.isArchived ? 'VENDORS.STATUS.SUSPENDED' : 'COMMON.ACTIVE';
  }

  get accountStatusVariant(): StatusPillVariant {
    return this.isAccountSuspended || this.isArchived ? 'danger' : 'success';
  }

  onResetPassword(): void {
    this.resetPasswordQueued = true;
  }

  toggleSuspended(): void {
    this.isAccountSuspended = !this.isAccountSuspended;
  }

  toggleLoginLock(): void {
    this.isLoginLocked = !this.isLoginLocked;
  }

  onArchiveAccount(): void {
    this.isArchived = true;
  }
}
